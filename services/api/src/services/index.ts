import { CryptoService } from "./crypto.service";
import { JWTService } from "./jwt.service";
import { SessionManager } from "./session.service";

export { CryptoService, JWTService, SessionManager };

declare global {
  interface Services {
    crypto: CryptoService;
    jwt: JWTService;
    session: SessionManager;
  }
}
