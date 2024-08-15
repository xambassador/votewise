import type { JWTService } from "../jwt.service";

export const mockJWTService = {
  signAccessToken: jest.fn(),
  signRefreshToken: jest.fn(),
  verifyAccessToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  handleError: jest.fn()
} as unknown as jest.Mocked<JWTService>;
