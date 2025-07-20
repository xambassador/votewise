import os
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import redis

# Load env from .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
ML_SERVICE_PORT = os.getenv("ML_SERVICE_PORT", 5003)
if not DATABASE_URL:
    raise ValueError("Invalid environment configuration. DATABASE_URL is missing")

engine = create_engine(DATABASE_URL)

# Redis setup
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", 6379)
REDIS_DB = os.getenv("REDIS_DB", 0)
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB, decode_responses=True)

app = FastAPI(title="Votewise ML Service", description="Votewise ML Service for recommendations")

class RecommendationRequest(BaseModel):
    user_id: str
    top_n: int = 5

# Create similarity table in PostgreSQL if it doesn’t exist
def init_db():
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS "UserSimilarity" (
                user_id_1 VARCHAR,
                user_id_2 VARCHAR,
                similarity FLOAT,
                PRIMARY KEY (user_id_1, user_id_2)
            );
        """))
        conn.commit()

def load_data():
    user_interests = pd.read_sql('SELECT "user_id", "topic_id" FROM "UserInterests"', engine)
    group_members = pd.read_sql('SELECT "user_id", "group_id" FROM "GroupMember"', engine)
    upvotes = pd.read_sql('SELECT "user_id", "post_id" FROM "Upvote"', engine)
    return user_interests, group_members, upvotes

# Compute and store similarity
def compute_and_store_similarity():
    user_interests, group_members, upvotes = load_data()
    user_topic_matrix = pd.pivot_table(
        user_interests, index="user_id", columns="topic_id", aggfunc="size", fill_value=0
    )
    user_post_matrix = pd.pivot_table(
        upvotes, index="user_id", columns="post_id", aggfunc="size", fill_value=0
    )

    user_topic_similarity = cosine_similarity(user_topic_matrix)
    user_post_similarity = cosine_similarity(user_post_matrix)

    user_topic_sim_df = pd.DataFrame(
        user_topic_similarity, index=user_topic_matrix.index, columns=user_topic_matrix.index
    )
    user_post_sim_df = pd.DataFrame(
        user_post_similarity, index=user_post_matrix.index, columns=user_post_matrix.index
    )

    common_users = user_topic_sim_df.index.intersection(user_post_sim_df.index)
    hybrid_similarity = (
        user_topic_sim_df.loc[common_users, common_users] + user_post_sim_df.loc[common_users, common_users]
    ) / 2

    with engine.connect() as conn:
        conn.execute(text('TRUNCATE TABLE "UserSimilarity"'))  # Clear old data
        similarity_data = [
            {"user_id_1": user1, "user_id_2": user2, "similarity": float(sim)}
            for user1, row in hybrid_similarity.iterrows()
            for user2, sim in row.items()
            if user1 != user2  # Exclude self-similarity
        ]
        res = conn.execute(
            text('INSERT INTO "UserSimilarity" (user_id_1, user_id_2, similarity) VALUES (:user_id_1, :user_id_2, :similarity) ON CONFLICT DO NOTHING'),
            similarity_data
        )
        conn.commit()

        for user1 in hybrid_similarity.index:
            sim_dict = hybrid_similarity.loc[user1].to_dict()
            redis_client.hset(f"similarity:{user1}", mapping={str(k): str(v) for k, v in sim_dict.items()})

        return hybrid_similarity, group_members


def load_similarity():
    all_users = pd.read_sql('SELECT DISTINCT "id" AS "user_id" FROM "User"', engine)["user_id"].tolist()
    similarity_dict = {}
    for user in all_users:
        sim = redis_client.hgetall(f"similarity:{user}")
        if sim:
            similarity_dict[user] = {k: float(v) for k, v in sim.items()}

    if similarity_dict:
        return pd.DataFrame(similarity_dict).fillna(0).reindex(index=all_users, columns=all_users, fill_value=0)

    sim_df = pd.read_sql('SELECT "user_id_1", "user_id_2", "similarity" FROM "UserSimilarity"', engine)
    if sim_df.empty:
        return None
    pivot_df = sim_df.pivot(index="user_id_1", columns="user_id_2", values="similarity").fillna(0)
    return pivot_df.reindex(index=all_users, columns=all_users, fill_value=0)


HYBRID_SIMILARITY, GROUP_MEMBERS = None, None


@app.on_event("startup")
def startup_event():
    global HYBRID_SIMILARITY, GROUP_MEMBERS
    init_db()
    HYBRID_SIMILARITY = load_similarity()
    _, GROUP_MEMBERS = compute_and_store_similarity() if HYBRID_SIMILARITY is None else (None, load_data()[1])
    print("Recommendation service started.")

# On shutdown, we can clear the Redis cache for development purposes
@app.on_event("shutdown")
def shutdown_event():
    is_development = os.getenv("ENVIRONMENT") == "development"
    if is_development:
        redis_client.flushdb()
        print("✅ Cache cleared on shutdown.")


def recommend_users(user_id: str, top_n: int = 5):
    if HYBRID_SIMILARITY is None or user_id not in HYBRID_SIMILARITY.index:
        return []
    similar_users = HYBRID_SIMILARITY.loc[user_id].sort_values(ascending=False)[1:top_n + 1]
    return similar_users.index.tolist()

def recommend_groups(user_id: str, top_n: int = 5):
    similar_users = recommend_users(user_id, top_n=10)
    if not similar_users:
        return []
    group_scores = GROUP_MEMBERS[GROUP_MEMBERS["user_id"].isin(similar_users)].groupby("group_id").size()
    return group_scores.sort_values(ascending=False).head(top_n).index.tolist()

@app.post("/recommend/users")
def get_user_recommendations(request: RecommendationRequest):
    try:
        user_id = request.user_id
        followed = pd.read_sql(
            f'SELECT "following_id" FROM "Follow" WHERE "follower_id" = \'{user_id}\'',
            engine
        )['following_id'].tolist()
        users = recommend_users(user_id, request.top_n)
        filtered_users = [u for u in users  if u not in followed and u != user_id][:request.top_n]
        return {"user_id": request.user_id, "recommended_users": filtered_users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error recommending users: {str(e)}")

@app.post("/recommend/groups")
def get_group_recommendations(request: RecommendationRequest):
    try:
        groups = recommend_groups(request.user_id, request.top_n)
        return {"user_id": request.user_id, "recommended_groups": groups}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error recommending groups: {str(e)}")

@app.post("/refresh_similarity")
def refresh_similarity():
    global HYBRID_SIMILARITY, GROUP_MEMBERS
    try:
        HYBRID_SIMILARITY, GROUP_MEMBERS = compute_and_store_similarity()
        return {"status": "Similarity refreshed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing similarity: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=ML_SERVICE_PORT)
