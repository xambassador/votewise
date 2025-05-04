import { CryptoService } from "./crypto.service";
import { JWTService } from "./jwt.service";
import { OnboardService } from "./onboard.service";
import { SessionManager } from "./session.service";

export { CryptoService, JWTService, SessionManager, OnboardService };

declare global {
  interface Services {
    crypto: CryptoService;
    jwt: JWTService;
    session: SessionManager;
    onboard: OnboardService;
  }
}
