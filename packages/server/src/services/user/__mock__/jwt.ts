const JWTService = {
  generateAccessToken: jest.fn().mockReturnValue("accessToken"),
  generateRefreshToken: jest.fn().mockReturnValue("refreshToken"),
  verifyAccessToken: jest.fn().mockReturnValue({ userId: 1 }),
  verifyRefreshToken: jest.fn().mockReturnValue({ userId: 1 }),
  saveRefreshToken: jest.fn(),
  checkIfRefreshTokenExists: jest.fn().mockReturnValue(true),
};

export default JWTService;
