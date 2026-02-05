import { CryptoService } from "./crypto.service";
import { JWTService } from "./jwt.service";
import { MLService } from "./ml.service";
import { NotificationService } from "./notification.service";
import { OnboardService } from "./onboard.service";
import { Realtime } from "./realtime.service";
import { SessionManager } from "./session.service";

export { CryptoService, JWTService, SessionManager, OnboardService, MLService, NotificationService, Realtime };

declare global {
  interface Services {
    crypto: CryptoService;
    jwt: JWTService;
    session: SessionManager;
    onboard: OnboardService;
    ml: MLService;
    realtime: Realtime;
  }
}
