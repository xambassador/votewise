import type { OnboardService } from "../onboard.service";

export const mockOnboardService = {
  getOnboardDataFromCache: jest.fn().mockName("getOnboardDataFromCache"),
  clearUserOnboardCache: jest.fn().mockName("clearUserOnboardCache"),
  getOnboardKey: jest.fn().mockName("getOnboardKey"),
  getUserOnboardData: jest.fn().mockName("getUserOnboardData"),
  updateUserOnboardCache: jest.fn().mockName("updateUserOnboardCache")
} as unknown as jest.Mocked<OnboardService>;
