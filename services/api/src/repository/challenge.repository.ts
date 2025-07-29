import { BaseRepository } from "./base.repository";

/* ----------------------------------------------------------------------------------------------- */

type TCreate = {
  ip: string;
  factor_id: string;
  otp_code?: string;
};

export class ChallengeRepository extends BaseRepository {
  private readonly db: RepositoryConfig["db"];

  constructor(cfg: RepositoryConfig) {
    super();
    this.db = cfg.db;
  }

  public create(data: TCreate) {
    return this.execute(async () => {
      const challenge = await this.db.challenge.create({
        data: {
          ip: data.ip,
          factor_id: data.factor_id,
          otp_code: data.otp_code
        }
      });
      return challenge;
    });
  }

  public findById(id: string) {
    return this.execute(async () => {
      const challenge = await this.db.challenge.findUnique({ where: { id } });
      return challenge;
    });
  }

  public verifyChallenge(id: string) {
    return this.execute(async () => {
      const challenge = await this.db.challenge.update({ data: { verified_at: new Date() }, where: { id } });
      return challenge;
    });
  }
}
