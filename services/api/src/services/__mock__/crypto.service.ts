import type { CryptoService } from "../crypto.service";

export const mockCryptoService = {
  symmetricEncrypt: jest.fn().mockName("cryptoService.symmetricEncrypt"),
  symmetricDecrypt: jest.fn().mockName("cryptoService.symmetricDecrypt"),
  generateRandomKey: jest.fn().mockName("cryptoService.generateRandomKey"),
  generateRandomToken: jest.fn().mockName("cryptoService.generateRandomToken"),
  generateUUID: jest.fn().mockName("cryptoService.generateUUID"),
  generateHex: jest.fn().mockName("cryptoService.generateHex"),
  generateApiKey: jest.fn().mockName("cryptoService.generateApiKey"),
  hashPassword: jest.fn().mockName("cryptoService.hashPassword"),
  getOtp: jest.fn().mockName("cryptoService.getOtp"),
  comparePassword: jest.fn().mockName("cryptoService.comparePassword")
} as jest.Mocked<CryptoService>;
