jest.mock("@votewise/lib/logger", () => {
  return {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    errorInfo: jest.fn()
  };
});
