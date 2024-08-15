import type { CryptoService } from "../crypto.service";

export const mockeCryptoService = {
  symmetricEncrypt: jest.fn(),
  symmetricDecrypt: jest.fn(),
  generateRandomKey: jest.fn(),
  generateRandomToken: jest.fn(),
  generateUUID: jest.fn(),
  generateHex: jest.fn(),
  generateApiKey: jest.fn(),
  hashPassword: jest.fn(),
  getOtp: jest.fn()
} as jest.Mocked<CryptoService>;
