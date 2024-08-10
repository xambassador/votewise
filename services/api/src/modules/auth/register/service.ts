import type { AppContext } from "@/http/context";
import type { TRegister } from "@votewise/schemas";

import { InvalidInputError } from "@votewise/lib/errors";
import { Minute, Second } from "@votewise/lib/times";

export type Context = {
  userRepository: AppContext["repositories"]["user"];
  cryptoService: AppContext["cryptoService"];
  cache: AppContext["cache"];
  httpStatusCodes: AppContext["httpStatusCodes"];
  mailer: AppContext["mailer"];
};

export class Service {
  private readonly ctx: Context;

  constructor(opts: Context) {
    this.ctx = opts;
  }

  async execute(body: TRegister) {
    const user = await this.ctx.userRepository.findByEmail(body.email);
    if (user) throw new InvalidInputError("Email already exists", this.ctx.httpStatusCodes.CONFLICT);

    const newUser = await this.ctx.userRepository.create({
      email: body.email,
      password: body.password,
      user_name: body.username,
      first_name: body.first_name,
      last_name: body.last_name
    });

    const verificationWindowToken = this.ctx.cryptoService.generateUUID();
    const verificationWindowTokenExpiry = (5 * Minute) / Second;
    const data = { userId: newUser.id, otp: 1000 };
    await this.ctx.cache.setWithExpiry(verificationWindowToken, JSON.stringify(data), verificationWindowTokenExpiry);

    await this.ctx.mailer.send({
      to: body.email,
      subject: "Verify your email",
      html: `Your verification code is ${data.otp}`
    });

    return { ...body };
  }
}
