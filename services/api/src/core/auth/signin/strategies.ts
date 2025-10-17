import type { AppContext } from "@/context";
import type { User } from "@votewise/prisma/db";

export abstract class Strategy {
  public abstract handle(value: string): Promise<User | undefined>;
}

export class UsernameStrategy implements Strategy {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  public async handle(username: string) {
    const user = await this.ctx.repositories.user.findByUsername(username);
    return user;
  }
}

export class EmailStrategy implements Strategy {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  public async handle(email: string) {
    const user = await this.ctx.repositories.user.findByEmail(email);
    return user;
  }
}
