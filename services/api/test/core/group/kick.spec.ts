import type { AppContext } from "@/context";

import { faker } from "@faker-js/faker";
import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/errors";

import { Controller } from "@/core/group/kick/controller";

import { buildReq, buildRes, buildUser, getLocals } from "../../helpers";

const groupId = faker.string.uuid();
const { locals, user: admin } = getLocals();
const target = buildUser({ id: faker.string.uuid(), user_name: "target_user" });
const tx = Symbol("tx");

const mockGroupRepository = {
  findById: jest.fn(),
  groupMember: { isMember: jest.fn(), whatIsMyRole: jest.fn(), kick: jest.fn() }
};
const mockUserRepository = { findByUsername: jest.fn() };
const mockAggregate = jest.fn();
const mockTransactionManager = {
  withDataLayerTransaction: jest.fn((cb: (tx: unknown) => Promise<unknown>) => cb(tx))
};

const controller = new Controller({
  repositories: {
    group: mockGroupRepository,
    user: mockUserRepository,
    aggregator: { groupAggregator: { aggregate: mockAggregate } },
    transactionManager: mockTransactionManager
  },
  assert: new Assertions()
} as unknown as AppContext);

function setup(targetRole: "MEMBER" | "ADMIN" = "MEMBER") {
  mockGroupRepository.findById.mockResolvedValue({ id: groupId });
  mockUserRepository.findByUsername.mockResolvedValue(target);
  mockGroupRepository.groupMember.isMember.mockResolvedValue(true);
  mockGroupRepository.groupMember.whatIsMyRole.mockImplementation(async (_groupId: string, userId: string) =>
    userId === admin.id ? { role: "ADMIN" } : { role: targetRole }
  );
  mockGroupRepository.groupMember.kick.mockResolvedValue({});
  mockAggregate.mockResolvedValue({});
}

function buildRequest() {
  const req = buildReq({ params: { groupId, username: target.user_name } as never });
  const res = buildRes({ locals, send: jest.fn() } as never);
  return { req, res };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Kick Member Controller", () => {
  it("should kick the target user, not the admin", async () => {
    setup();
    const { req, res } = buildRequest();
    await controller.handle(req, res);
    expect(mockGroupRepository.groupMember.kick).toHaveBeenCalledWith(groupId, target.id, tx);
    expect(mockGroupRepository.groupMember.kick).not.toHaveBeenCalledWith(groupId, admin.id, expect.anything());
    expect(res.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
  });

  it("should decrease total_members by one", async () => {
    setup();
    const { req, res } = buildRequest();
    await controller.handle(req, res);
    const update = mockAggregate.mock.calls[0][1];
    expect(update({ total_members: 5 })).toEqual({ total_members: 4 });
  });

  it("should not kick an admin", async () => {
    setup("ADMIN");
    const { req, res } = buildRequest();
    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe("You cannot kick an admin. Please remove their admin role first.");
    expect(mockGroupRepository.groupMember.kick).not.toHaveBeenCalled();
    expect(mockAggregate).not.toHaveBeenCalled();
  });

  it("should not allow a non-admin to kick", async () => {
    setup();
    mockGroupRepository.groupMember.whatIsMyRole.mockResolvedValue({ role: "MEMBER" });
    const { req, res } = buildRequest();
    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe("You are not allowed to kick members from this group");
    expect(mockGroupRepository.groupMember.kick).not.toHaveBeenCalled();
  });

  it("should not allow kicking yourself", async () => {
    setup();
    mockUserRepository.findByUsername.mockResolvedValue({ ...target, id: admin.id });
    const { req, res } = buildRequest();
    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe("You cannot kick yourself.");
    expect(mockGroupRepository.groupMember.kick).not.toHaveBeenCalled();
  });

  it("should throw if target is not a group member", async () => {
    setup();
    mockGroupRepository.groupMember.isMember.mockResolvedValue(false);
    const { req, res } = buildRequest();
    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe("User is not a member of this group");
    expect(mockGroupRepository.groupMember.kick).not.toHaveBeenCalled();
  });
});
