jest.mock("@votewise/log", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  errorInfo: jest.fn()
}));
