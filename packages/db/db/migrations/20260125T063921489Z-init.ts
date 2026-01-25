import type { Kysely } from "kysely";

import { sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema.createType("Gender").asEnum(["MALE", "FEMALE", "OTHER"]).execute();
  await db.schema.createType("PostType").asEnum(["PUBLIC", "GROUP_ONLY"]).execute();
  await db.schema.createType("PostStatus").asEnum(["OPEN", "CLOSED", "ARCHIVED", "INPROGRESS"]).execute();
  await db.schema
    .createType("FriendType")
    .asEnum(["FRIENDS", "PENDING_USER_TO_FRIEND_REQUEST", "PENDING_FRIEND_TO_USER_REQUEST"])
    .execute();
  await db.schema.createType("GroupType").asEnum(["PUBLIC", "PRIVATE"]).execute();
  await db.schema.createType("GroupStatus").asEnum(["OPEN", "CLOSED", "INACTIVE"]).execute();
  await db.schema.createType("GroupMemberRole").asEnum(["ADMIN", "MODERATOR", "MEMBER"]).execute();
  await db.schema.createType("GroupInvitationType").asEnum(["JOIN", "INVITE"]).execute();
  await db.schema.createType("GroupInvitationStatus").asEnum(["PENDING", "ACCEPTED", "REJECTED"]).execute();
  await db.schema.createType("FactorType").asEnum(["TOTP", "PHONE", "WEB_AUTHN"]).execute();
  await db.schema.createType("FactorStatus").asEnum(["UNVERIFIED", "VERIFIED"]).execute();

  await db.schema
    .createTable("User")
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("email", "text", (col) => col.notNull().unique())
    .addColumn("user_name", "varchar(20)", (col) => col.notNull().unique())
    .addColumn("password", "text", (col) => col.notNull())
    .addColumn("first_name", "varchar(50)", (col) => col.notNull())
    .addColumn("last_name", "varchar(50)", (col) => col.notNull())
    .addColumn("secret", "text", (col) => col.notNull().defaultTo(sql`gen_random_uuid()`))
    .addColumn("about", "varchar(256)")
    .addColumn("twitter_profile_url", "text")
    .addColumn("facebook_profile_url", "text")
    .addColumn("instagram_profile_url", "text")
    .addColumn("github_profile_url", "text")
    .addColumn("avatar_url", "text")
    .addColumn("cover_image_url", "text")
    .addColumn("location", "varchar(100)")
    .addColumn("gender", sql`"Gender"`)
    .addColumn("last_login", "timestamptz")
    .addColumn("is_onboarded", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("is_email_verify", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("email_confirmed_at", "timestamptz")
    .addColumn("email_confirmation_sent_at", "timestamptz")
    .addColumn("banned_until", "timestamptz")
    .addColumn("vote_bucket", "integer", (col) => col.notNull().defaultTo(10))
    .addColumn("last_bucket_reset_at", "timestamptz")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("Factor")
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("friendly_name", "text", (col) => col.notNull())
    .addColumn("factor_type", sql`"FactorType"`, (col) => col.notNull())
    .addColumn("status", sql`"FactorStatus"`, (col) => col.notNull())
    .addColumn("secret", "text", (col) => col.notNull())
    .addColumn("phone", "text")
    .addColumn("last_challenged_at", "timestamptz")
    .addColumn("user_id", "text", (col) => col.notNull().references("User.id").onDelete("cascade"))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("Challenge")
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("ip", "text", (col) => col.notNull())
    .addColumn("otp_code", "text")
    .addColumn("factor_id", "text", (col) => col.notNull().references("Factor.id").onDelete("cascade"))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("verified_at", "timestamptz")
    .execute();

  await db.schema
    .createTable("Session")
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("aal", "text", (col) => col.notNull().defaultTo("aal1"))
    .addColumn("ip", "text", (col) => col.notNull())
    .addColumn("user_agent", "text", (col) => col.notNull())
    .addColumn("user_id", "text", (col) => col.notNull().references("User.id").onDelete("cascade"))
    .addColumn("factor_id", "text", (col) => col.references("Factor.id").onDelete("cascade"))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("Group")
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("name", "varchar(21)", (col) => col.notNull().unique())
    .addColumn("about", "varchar(500)", (col) => col.notNull())
    .addColumn("cover_image_url", "text")
    .addColumn("logo_url", "text")
    .addColumn("type", sql`"GroupType"`, (col) => col.notNull())
    .addColumn("status", sql`"GroupStatus"`, (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("Post")
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("title", "varchar(50)", (col) => col.notNull())
    .addColumn("content", "varchar(300)", (col) => col.notNull())
    .addColumn("slug", "varchar(255)", (col) => col.notNull().unique())
    .addColumn("type", sql`"PostType"`, (col) => col.notNull().defaultTo("PUBLIC"))
    .addColumn("status", sql`"PostStatus"`, (col) => col.notNull().defaultTo("OPEN"))
    .addColumn("group_id", "text", (col) => col.references("Group.id").onDelete("cascade"))
    .addColumn("author_id", "text", (col) => col.notNull().references("User.id").onDelete("cascade"))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("PostAsset")
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("type", "text", (col) => col.notNull())
    .addColumn("url", "text", (col) => col.notNull())
    .addColumn("mime_type", "text")
    .addColumn("size", "integer")
    .addColumn("post_id", "text", (col) => col.notNull().references("Post.id").onDelete("cascade"))
    .execute();

  await db.schema
    .createTable("Upvote")
    .addColumn("post_id", "text", (col) => col.notNull().references("Post.id").onDelete("cascade"))
    .addColumn("user_id", "text", (col) => col.notNull().references("User.id").onDelete("cascade"))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint("post_user_unique", ["post_id", "user_id"])
    .execute();

  await db.schema
    .createTable("Comment")
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("text", "varchar(300)", (col) => col.notNull())
    .addColumn("parent_id", "text")
    .addColumn("appreciated", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("post_id", "text", (col) => col.notNull().references("Post.id").onDelete("cascade"))
    .addColumn("user_id", "text", (col) => col.notNull().references("User.id").onDelete("cascade"))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await sql`ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Comment"("id") ON DELETE CASCADE`.execute(
    db
  );

  await db.schema
    .createTable("HashTag")
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("count", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("name", "text", (col) => col.notNull().unique())
    .execute();

  await db.schema
    .createTable("PostHashTag")
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("post_id", "text", (col) => col.notNull().references("Post.id").onDelete("cascade"))
    .addColumn("hash_tag_id", "text", (col) => col.notNull().references("HashTag.id").onDelete("cascade"))
    .execute();

  await db.schema
    .createTable("Follow")
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("follower_id", "text", (col) => col.notNull().references("User.id").onDelete("cascade"))
    .addColumn("following_id", "text", (col) => col.notNull().references("User.id").onDelete("cascade"))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("GroupMember")
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("role", sql`"GroupMemberRole"`, (col) => col.notNull().defaultTo("MEMBER"))
    .addColumn("joined_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("blocked", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("is_removed", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("user_id", "text", (col) => col.notNull().references("User.id").onDelete("cascade"))
    .addColumn("group_id", "text", (col) => col.notNull().references("Group.id").onDelete("cascade"))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint("user_group_unique", ["user_id", "group_id"])
    .execute();

  await db.schema
    .createTable("GroupInvitation")
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("type", sql`"GroupInvitationType"`, (col) => col.notNull())
    .addColumn("status", sql`"GroupInvitationStatus"`, (col) => col.notNull())
    .addColumn("sent_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("group_id", "text", (col) => col.notNull().references("Group.id").onDelete("cascade"))
    .addColumn("user_id", "text", (col) => col.notNull().references("User.id").onDelete("cascade"))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint("GroupInvitation_user_group_unique", ["user_id", "group_id"])
    .execute();

  await db.schema
    .createTable("Notification")
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("source_type", "text", (col) => col.notNull())
    .addColumn("source_id", "text", (col) => col.notNull())
    .addColumn("user_id", "text", (col) => col.notNull().references("User.id").onDelete("cascade"))
    .addColumn("creator_id", "text", (col) => col.references("User.id").onDelete("cascade"))
    .addColumn("read_at", "timestamptz")
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("RefreshToken")
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("token", "text", (col) => col.notNull().unique())
    .addColumn("user_id", "text", (col) => col.notNull().references("User.id").onDelete("cascade"))
    .addColumn("revoked", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("Topics")
    .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("name", "varchar(20)", (col) => col.notNull().unique())
    .addColumn("is_system_topic", "boolean", (col) => col.notNull().defaultTo(true))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createTable("PostTopic")
    .addColumn("post_id", "text", (col) => col.notNull().references("Post.id").onDelete("cascade"))
    .addColumn("topic_id", "text", (col) => col.notNull().references("Topics.id").onDelete("cascade"))
    .addUniqueConstraint("post_topic_unique", ["post_id", "topic_id"])
    .execute();

  await db.schema
    .createTable("UserInterests")
    .addColumn("user_id", "text", (col) => col.notNull().references("User.id").onDelete("cascade"))
    .addColumn("topic_id", "text", (col) => col.notNull().references("Topics.id").onDelete("cascade"))
    .addUniqueConstraint("user_topic_unique", ["user_id", "topic_id"])
    .execute();

  await db.schema
    .createTable("UserSimilarity")
    .addColumn("user_id_1", "text", (col) => col.notNull())
    .addColumn("user_id_2", "text", (col) => col.notNull())
    .addColumn("similarity", "float8", (col) => col.notNull())
    .addPrimaryKeyConstraint("UserSimilarity_pkey", ["user_id_1", "user_id_2"])
    .execute();

  await db.schema
    .createTable("Timeline")
    .addColumn("user_id", "text", (col) => col.notNull().references("User.id").onDelete("cascade"))
    .addColumn("post_id", "text", (col) => col.notNull().references("Post.id").onDelete("cascade"))
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addUniqueConstraint("user_post_unique", ["user_id", "post_id"])
    .execute();

  await db.schema
    .createTable("PostAggregates")
    .addColumn("votes", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("comments", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("views", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("shares", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("post_id", "text", (col) => col.primaryKey().references("Post.id").onDelete("cascade"))
    .execute();

  await db.schema
    .createTable("UserAggregates")
    .addColumn("total_posts", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("total_votes", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("total_comments", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("total_followers", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("total_following", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("total_groups", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("user_id", "text", (col) => col.primaryKey().references("User.id").onDelete("cascade"))
    .execute();

  await db.schema
    .createTable("GroupAggregates")
    .addColumn("total_posts", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("total_members", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("total_comments", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("total_votes", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("group_id", "text", (col) => col.primaryKey().references("Group.id").onDelete("cascade"))
    .execute();

  // Indexes
  await db.schema.createIndex("factor_user_idx").on("Factor").column("user_id").execute();

  await db.schema.createIndex("session_user_idx").on("Session").column("user_id").execute();

  await db.schema.createIndex("post_author_idx").on("Post").column("author_id").execute();
  await db.schema.createIndex("post_group_idx").on("Post").column("group_id").execute();

  await db.schema.createIndex("post_asset_post_idx").on("PostAsset").column("post_id").execute();

  await db.schema.createIndex("upvote_user_idx").on("Upvote").column("user_id").execute();

  await db.schema.createIndex("post_hashtag_post_idx").on("PostHashTag").column("post_id").execute();
  await db.schema.createIndex("post_hashtag_tag_idx").on("PostHashTag").column("hash_tag_id").execute();

  await db.schema.createIndex("group_member_group_idx").on("GroupMember").column("group_id").execute();
  await db.schema.createIndex("group_member_user_idx").on("GroupMember").column("user_id").execute();
  await db.schema.createIndex("group_member_group_role_idx").on("GroupMember").columns(["group_id", "role"]).execute();
  await sql`CREATE INDEX group_member_active_idx ON "GroupMember" (group_id, user_id) WHERE is_removed = false AND blocked = false`.execute(
    db
  );

  await db.schema.createIndex("group_invitation_group_idx").on("GroupInvitation").column("group_id").execute();
  await db.schema.createIndex("group_invitation_status_idx").on("GroupInvitation").column("status").execute();
  await db.schema.createIndex("group_invitation_user_idx").on("GroupInvitation").column("user_id").execute();
  await sql`CREATE INDEX group_invitation_pending_idx ON "GroupInvitation" (user_id, group_id) WHERE status = 'PENDING'`.execute(
    db
  );

  await db.schema
    .createIndex("notification_source_index")
    .on("Notification")
    .columns(["source_type", "source_id"])
    .execute();
  await sql`CREATE INDEX "user_notifications_idx" ON "Notification" ("user_id", "read_at", "created_at" DESC)`.execute(
    db
  );
  await db.schema.createIndex("notification_creator_idx").on("Notification").column("creator_id").execute();
  await sql`CREATE INDEX notification_unread_idx ON "Notification" (user_id, created_at DESC) WHERE read_at IS NULL`.execute(
    db
  );

  await db.schema.createIndex("user_refresh_token_idx").on("RefreshToken").column("user_id").execute();
  await sql`CREATE INDEX refresh_token_token_hash_idx ON "RefreshToken" USING hash (token)`.execute(db);

  await db.schema.createIndex("post_topic_topic_idx").on("PostTopic").column("topic_id").execute();
  await db.schema.createIndex("post_topic_post_idx").on("PostTopic").column("post_id").execute();

  await db.schema.createIndex("user_topic_topic_idx").on("UserInterests").column("topic_id").execute();
  await db.schema.createIndex("user_interests_user_idx").on("UserInterests").column("user_id").execute();

  await sql`CREATE INDEX timeline_user_feed_idx ON "Timeline" (user_id, created_at DESC, post_id DESC)`.execute(db);

  await db.schema.createIndex("challenge_factor_idx").on("Challenge").column("factor_id").execute();

  await db.schema
    .createIndex("follower_following_index")
    .on("Follow")
    .columns(["follower_id", "following_id"])
    .execute();
  await db.schema.createIndex("follow_follower_idx").on("Follow").column("follower_id").execute();
  await db.schema.createIndex("follow_following_idx").on("Follow").column("following_id").execute();

  await db.schema.createIndex("comment_parent_id_idx").on("Comment").column("parent_id").execute();
  await db.schema.createIndex("Comment_post_id_idx").on("Comment").column("post_id").execute();
  await db.schema.createIndex("Comment_user_id_idx").on("Comment").column("user_id").execute();

  await db.schema.createIndex("user_email_verified_idx").on("User").columns(["email", "is_email_verify"]).execute();
  await sql`CREATE INDEX user_onboarded_idx ON "User" (created_at DESC) WHERE is_onboarded = true`.execute(db);

  // pg_trgm indexes
  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`.execute(db);
  await sql`CREATE INDEX idx_post_title_trgm ON "Post" USING GIN (title gin_trgm_ops)`.execute(db);
  await sql`CREATE INDEX idx_group_name_trgm ON "Group" USING GIN (name gin_trgm_ops)`.execute(db);
  await sql`CREATE INDEX idx_user_username_trgm ON "User" USING GIN (user_name gin_trgm_ops)`.execute(db);

  await db.schema
    .createTable("view_param")
    .addColumn("name", "varchar", (col) => col.primaryKey())
    .addColumn("value", "varchar")
    .execute();

  await sql`
    INSERT INTO "view_param" (name, value)
    VALUES
      ('whats_hot_like_threshold', '2'),
      ('whats_hot_interval', '1 day'),
      ('hot_users_follower_threshold', '5'),
      ('hot_users_interval', '1 day'),
      ('hot_groups_member_threshold', '10'),
      ('hot_groups_interval', '1 day')
  `.execute(db);

  await sql`
    CREATE MATERIALIZED VIEW "AlgoHotFeedView" AS
    SELECT
      p.id AS post_id,
      COUNT(u.post_id) AS like_count,
      ROUND(1000000 * ((COUNT(u.post_id)::float - 1) / POWER((EXTRACT(EPOCH FROM AGE(NOW(), p.created_at)) / 3600 + 2), 1.8))) AS score
    FROM "Post" p
    LEFT JOIN "Upvote" u ON p.id = u.post_id
    WHERE
      p.status = 'OPEN'
      AND p.created_at > (
        SELECT NOW() - value::interval
        FROM "view_param"
        WHERE name = 'whats_hot_interval'
      )
      AND (SELECT COUNT(*) FROM "Upvote" WHERE post_id = p.id) > (
        SELECT value::integer
        FROM "view_param"
        WHERE name = 'whats_hot_like_threshold'
      )
    GROUP BY p.id
    ORDER BY score DESC
  `.execute(db);

  await sql`CREATE UNIQUE INDEX algo_whats_hot_view_post_id_idx ON "AlgoHotFeedView" (post_id)`.execute(db);
  await sql`CREATE INDEX algo_whats_hot_view_cursor_idx ON "AlgoHotFeedView" (score, post_id)`.execute(db);

  await sql`
    CREATE MATERIALIZED VIEW "AlgoHotUserView" AS
    SELECT
      u.id AS user_id,
      u.user_name,
      COUNT(f.id) AS follower_count,
      ROUND(1000000 * ((COUNT(f.id)::float - 1) / POWER((EXTRACT(EPOCH FROM AGE(NOW(), MIN(f.created_at))) / 3600 + 2), 1.8))) AS score
    FROM "User" u
    LEFT JOIN "Follow" f ON u.id = f.following_id
    WHERE
      u.is_onboarded = true
      AND f.created_at > (
        SELECT NOW() - value::interval
        FROM "view_param"
        WHERE name = 'hot_users_interval'
      )
      AND (
        SELECT COUNT(*)
        FROM "Follow"
        WHERE following_id = u.id
          AND created_at > (
            NOW() - (SELECT value::interval FROM view_param WHERE name = 'hot_users_interval')
          )
      ) > (
        SELECT value::integer
        FROM view_param
        WHERE name = 'hot_users_follower_threshold'
      )
    GROUP BY u.id, u.user_name
  `.execute(db);

  await sql`CREATE UNIQUE INDEX algo_hot_users_view_user_id_idx ON "AlgoHotUserView" (user_id)`.execute(db);
  await sql`CREATE INDEX algo_hot_users_view_cursor_idx ON "AlgoHotUserView" (score DESC, user_name DESC)`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`DROP MATERIALIZED VIEW IF EXISTS "AlgoHotUserView"`.execute(db);
  await sql`DROP MATERIALIZED VIEW IF EXISTS "AlgoHotFeedView"`.execute(db);
  await db.schema.dropTable("view_param").ifExists().execute();
  await sql`DROP INDEX IF EXISTS idx_user_username_trgm`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_group_name_trgm`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_post_title_trgm`.execute(db);
  await sql`DROP EXTENSION IF EXISTS pg_trgm`.execute(db);

  await db.schema.dropTable("GroupAggregates").ifExists().execute();
  await db.schema.dropTable("UserAggregates").ifExists().execute();
  await db.schema.dropTable("PostAggregates").ifExists().execute();
  await db.schema.dropTable("Timeline").ifExists().execute();
  await db.schema.dropTable("UserSimilarity").ifExists().execute();
  await db.schema.dropTable("UserInterests").ifExists().execute();
  await db.schema.dropTable("PostTopic").ifExists().execute();
  await db.schema.dropTable("Topics").ifExists().execute();
  await db.schema.dropTable("RefreshToken").ifExists().execute();
  await db.schema.dropTable("Notification").ifExists().execute();
  await db.schema.dropTable("GroupInvitation").ifExists().execute();
  await db.schema.dropTable("GroupMember").ifExists().execute();
  await db.schema.dropTable("Follow").ifExists().execute();
  await db.schema.dropTable("PostHashTag").ifExists().execute();
  await db.schema.dropTable("HashTag").ifExists().execute();
  await db.schema.dropTable("Comment").ifExists().execute();
  await db.schema.dropTable("Upvote").ifExists().execute();
  await db.schema.dropTable("PostAsset").ifExists().execute();
  await db.schema.dropTable("Post").ifExists().execute();
  await db.schema.dropTable("Group").ifExists().execute();
  await db.schema.dropTable("Session").ifExists().execute();
  await db.schema.dropTable("Challenge").ifExists().execute();
  await db.schema.dropTable("Factor").ifExists().execute();
  await db.schema.dropTable("User").ifExists().execute();

  await db.schema.dropType("FactorStatus").ifExists().execute();
  await db.schema.dropType("FactorType").ifExists().execute();
  await db.schema.dropType("GroupInvitationStatus").ifExists().execute();
  await db.schema.dropType("GroupInvitationType").ifExists().execute();
  await db.schema.dropType("GroupMemberRole").ifExists().execute();
  await db.schema.dropType("GroupStatus").ifExists().execute();
  await db.schema.dropType("GroupType").ifExists().execute();
  await db.schema.dropType("FriendType").ifExists().execute();
  await db.schema.dropType("PostStatus").ifExists().execute();
  await db.schema.dropType("PostType").ifExists().execute();
  await db.schema.dropType("Gender").ifExists().execute();
}
