import type { AppContext } from "@/context";
import type { User } from "@votewise/prisma/client";

export type StrategyOptions = {
  userRepository: AppContext["repositories"]["user"];
};

export abstract class Strategy {
  public abstract handle(value: string): Promise<User | null>;
}

export class UsernameStrategy implements Strategy {
  private readonly ctx: StrategyOptions;

  constructor(opts: StrategyOptions) {
    this.ctx = opts;
  }

  public async handle(username: string) {
    const user = await this.ctx.userRepository.findByUsername(username);
    return user;
  }
}

export class EmailStrategy implements Strategy {
  private readonly ctx: StrategyOptions;

  constructor(opts: StrategyOptions) {
    this.ctx = opts;
  }

  public async handle(email: string) {
    const user = await this.ctx.userRepository.findByEmail(email);
    return user;
  }
}
