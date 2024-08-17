import type { JWTService } from "../jwt.service";

export const mockJWTService = {
  signAccessToken: jest.fn().mockName("jwtService.signAccessToken"),
  signRefreshToken: jest.fn().mockName("jwtService.signRefreshToken"),
  verifyAccessToken: jest.fn().mockName("jwtService.verifyAccessToken"),
  verifyRefreshToken: jest.fn().mockName("jwtService.verifyRefreshToken"),
  handleError: jest.fn().mockName("jwtService.handleError"),
  decodeAccessToken: jest.fn().mockName("jwtService.decodeAccessToken")
} as unknown as jest.Mocked<JWTService>;
