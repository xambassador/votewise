function buildReq({ ...overrides } = {}) {
  const req = { body: {}, params: {}, ...overrides };
  return req;
}

function buildRes(overrides = {}) {
  const res: unknown = {
    json: jest.fn(() => res).mockName("json"),
    status: jest.fn(() => res).mockName("status"),
    ...overrides,
  };
  return res;
}

function buildNext(impl: () => void) {
  return jest.fn(impl).mockName("next");
}

export { buildNext, buildReq, buildRes };
