import type { CryptoService } from "../crypto.service";

export const mockCryptoService = {
  symmetricEncrypt: jest.fn().mockName("cryptoService.symmetricEncrypt"),
  symmetricDecrypt: jest.fn().mockName("cryptoService.symmetricDecrypt"),
  generateUUID: jest.fn().mockName("cryptoService.generateUUID").mockReturnValue("random-uuid"),
  generateHex: jest.fn().mockName("cryptoService.generateHex").mockReturnValue("random-hex"),
  generateApiKey: jest.fn().mockName("cryptoService.generateApiKey").mockReturnValue("random-api-key"),
  hashPassword: jest.fn().mockName("cryptoService.hashPassword"),
  getOtp: jest.fn().mockName("cryptoService.getOtp"),
  comparePassword: jest.fn().mockName("cryptoService.comparePassword"),
  hash: jest.fn().mockName("cryptoService.hash"),
  verifyOtp: jest.fn().mockName("cryptoService.verifyOtp"),
  generate2FAQRCode: jest.fn().mockName("cryptoService.generate2FAQRCode"),
  verify2FAToken: jest.fn().mockName("cryptoService.verify2FAToken"),
  generate2FASecret: jest.fn().mockName("cryptoService.generate2FASecret").mockReturnValue("random-2fa-secret"),
  generateKeyUri: jest.fn().mockName("cryptoService.generateKeyUri"),
  verify2FACode: jest.fn().mockName("cryptoService.verify2FACode"),
  generateNanoId: jest.fn().mockName("cryptoService.generateNanoId"),
  generateRandomString: jest.fn().mockName("cryptoService.generateRandomString")
} as jest.Mocked<CryptoService>;
