import type { AppContext } from "@/context";

import { Minute } from "@votewise/times";

type RegisterServiceOptions = {
  cryptoService: AppContext["cryptoService"];
  cache: AppContext["cache"];
  tasksQueue: AppContext["queues"]["tasksQueue"];
  appUrl: AppContext["config"]["appUrl"];
};

type User = {
  secret: string;
  userId: string;
  email: string;
  ip: string;
};

type VerificationData = {
  userId: string;
  ip: string;
  email: string;
  verificationCode: string;
};

export class UserRegisterService {
  private readonly ctx: RegisterServiceOptions;

  constructor(opts: RegisterServiceOptions) {
    this.ctx = opts;
  }

  async startVerificationProcess(payload: User) {
    const key = `email:${payload.email}:verification`;
    const previousWindow = await this.getPreviouseWindow(key);
    if (!previousWindow) {
      const otp = this.ctx.cryptoService.getOtp(payload.secret);
      const verificationCode = this.ctx.cryptoService.generateUUID().replace(/-/g, "");
      const expiresIn = 5 * Minute;
      const data: VerificationData = { userId: payload.userId, ip: payload.ip, email: payload.email, verificationCode };
      await this.ctx.cache.setWithExpiry(key, JSON.stringify(data), expiresIn);
      this.ctx.tasksQueue.add({
        name: "email",
        payload: {
          to: payload.email,
          subject: "Verify your email",
          templateName: "signup",
          locals: {
            otp,
            logo: this.ctx.appUrl + "/assets/logo.png",
            expiresIn: expiresIn / Minute,
            expiresInUnit: "minutes"
          }
        }
      });
      return { verificationCode, expiresIn };
    }
    return { verificationCode: previousWindow.data.verificationCode, expiresIn: previousWindow.ttl };
  }

  private async getPreviouseWindow(key: string) {
    const data = await this.ctx.cache.get(key);
    if (!data) return null;
    const remaining = await this.ctx.cache.getRemainingTime(key);
    try {
      const parsed = JSON.parse(data) as VerificationData;
      return { data: parsed, ttl: remaining };
    } catch (err) {
      return null;
    }
  }
}
