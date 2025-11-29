import type { AppContext } from "@/context";

import { faker } from "@faker-js/faker";

import { Assertions } from "@votewise/errors";

import { Controller } from "@/core/user/onboard/controller";
import { requestParserPluginFactory } from "@/plugins";

import { mockTaskQueue, mockUploadQueue } from "../__mock__/queue";
import {
  mockPostTopicRepository,
  mockRefreshTokenRepository,
  mockTimelineRepository,
  mockUserInterestRepository,
  mockUserRepository
} from "../__mock__/repository";
import { mockOnboardService, mockSessionManagerWithoutCtx } from "../__mock__/services";
import { appUrl, buildReq, buildRes, buildUser, getLocals } from "../helpers";

const controller = new Controller({
  plugins: { requestParser: requestParserPluginFactory() },
  assert: new Assertions(),
  config: { appUrl, avatarsBucket: "avatars", backgroundsBucket: "backgrounds" },
  repositories: {
    user: mockUserRepository,
    postTopic: mockPostTopicRepository,
    timeline: mockTimelineRepository,
    userInterest: mockUserInterestRepository,
    refreshToken: mockRefreshTokenRepository
  },
  services: {
    onboard: mockOnboardService,
    session: mockSessionManagerWithoutCtx
  },
  queues: {
    tasksQueue: mockTaskQueue,
    uploadQueue: mockUploadQueue
  }
} as unknown as AppContext);

beforeEach(() => {
  jest.clearAllMocks();
});

const { locals, user } = getLocals();
const getOnboardBody = (step: number) => ({
  step,
  user_name: faker.internet.userName().slice(0, 20),
  first_name: faker.person.firstName(),
  last_name: faker.person.lastName(),
  gender: "MALE",
  about: faker.lorem.paragraph(),
  avatar: "http://example.com/avatars/avatar.jpg",
  cover: "http://example.com/backgrounds/cover.jpg",
  location: faker.location.city(),
  topics: ["topic1", "topic2", "topic3"],
  has_setup_2fa: false
});

describe("Onboard Controller", () => {
  it("should throw an error if the body is invalid", async () => {
    const req = buildReq({ body: { step: 1 } });
    const res = buildRes({ locals });
    const error = await controller.handle(req, res).catch((err) => err);
    expect(mockUserRepository.findById).not.toHaveBeenCalled();
    expect(error.message).toBe("username is required");
  });

  it("should throw an error if the user is not found", async () => {
    const req = buildReq({ body: getOnboardBody(1) });
    const res = buildRes({ locals });
    mockUserRepository.findById.mockResolvedValue(undefined);
    const error = await controller.handle(req, res).catch((err) => err);
    expect(error.message).toBe("User not found");
  });

  it("should throw an error if the username is already taken", async () => {
    const body = getOnboardBody(1);
    body.user_name = "existing_username";
    const existingUser = buildUser({ user_name: body.user_name });
    const req = buildReq({ body });
    const res = buildRes({ locals });
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.findByUsername.mockResolvedValue(existingUser);
    const error = await controller.handle(req, res).catch((err) => err);
    expect(mockUserRepository.update).not.toHaveBeenCalled();
    expect(error.message).toBe("Username already exists");
  });

  it("should successfully update user information for step 1", async () => {
    const body = getOnboardBody(1);
    const req = buildReq({ body });
    const res = buildRes({ locals });
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.findByUsername.mockResolvedValue(undefined);

    const data = { user_name: body.user_name, first_name: body.first_name, last_name: body.last_name };
    await controller.handle(req, res);
    expect(mockUserRepository.update).toHaveBeenCalledWith(user.id, data);
    expect(mockOnboardService.updateUserOnboardCache).toHaveBeenCalledWith(user.id, data);
  });

  it("should successfully update user information for step 2", async () => {
    const body = getOnboardBody(2);
    const req = buildReq({ body });
    const res = buildRes({ locals });
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.findByUsername.mockResolvedValue(undefined);

    const data = { gender: body.gender, about: body.about };
    await controller.handle(req, res);
    expect(mockUserRepository.update).toHaveBeenCalledWith(user.id, data);
    expect(mockOnboardService.updateUserOnboardCache).toHaveBeenCalledWith(user.id, data);
  });

  it("should throw an error if the avatar URL is invalid", async () => {
    const body = getOnboardBody(3);
    body.avatar = "http://example.com/avatar.jpg";
    const req = buildReq({ body });
    const res = buildRes({ locals });
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.findByUsername.mockResolvedValue(undefined);

    const error = await controller.handle(req, res).catch((err) => err);
    expect(mockUserRepository.update).not.toHaveBeenCalled();
    expect(error.message).toBe("Invalid avatar url");
  });

  it("should successfully update user information for step 3 and schedule avatar upload", async () => {
    const body = getOnboardBody(3);
    const fileName = "avatar.jpg";
    const fileToken = "some_random_token";
    body.avatar = `http://example.com/avatar.jpg?file_name=${fileName}&file_token=${fileToken}`;
    const req = buildReq({ body });
    const res = buildRes({ locals });
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.findByUsername.mockResolvedValue(undefined);

    const data = { avatar_url: body.avatar };
    await controller.handle(req, res);
    expect(mockUserRepository.update).toHaveBeenCalledWith(user.id, data);
    expect(mockOnboardService.updateUserOnboardCache).toHaveBeenCalledWith(user.id, data);
    expect(mockUploadQueue.add).toHaveBeenCalledWith({
      name: "uploadToS3",
      payload: {
        fileName,
        fileToken,
        assetType: "avatar",
        userId: user.id,
        path: user.id + "/" + fileName
      }
    });
  });

  it("should successfully update user information for step 3 without schedule avatar upload", async () => {
    const body = getOnboardBody(3);
    const req = buildReq({ body });
    const res = buildRes({ locals });
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.findByUsername.mockResolvedValue(undefined);

    const data = { avatar_url: body.avatar };
    await controller.handle(req, res);
    expect(mockUploadQueue.add).not.toHaveBeenCalled();
    expect(mockUserRepository.update).toHaveBeenCalledWith(user.id, data);
    expect(mockOnboardService.updateUserOnboardCache).toHaveBeenCalledWith(user.id, data);
  });

  it("should throw an error if the cover URL is invalid", async () => {
    const body = getOnboardBody(4);
    body.cover = "http://example.com/background.jpg";
    const req = buildReq({ body });
    const res = buildRes({ locals });
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.findByUsername.mockResolvedValue(undefined);

    const error = await controller.handle(req, res).catch((err) => err);
    expect(mockUserRepository.update).not.toHaveBeenCalled();
    expect(error.message).toBe("Invalid cover url");
  });

  it("should successfully update user information for step 4 and schedule cover upload", async () => {
    const body = getOnboardBody(4);
    const fileName = "background.jpg";
    const fileToken = "some_random_token";
    body.cover = `http://example.com/background.jpg?file_name=${fileName}&file_token=${fileToken}`;
    const req = buildReq({ body });
    const res = buildRes({ locals });
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.findByUsername.mockResolvedValue(undefined);

    const data = { cover_image_url: body.cover };
    await controller.handle(req, res);
    expect(mockUserRepository.update).toHaveBeenCalledWith(user.id, data);
    expect(mockOnboardService.updateUserOnboardCache).toHaveBeenCalledWith(user.id, data);
    expect(mockUploadQueue.add).toHaveBeenCalledWith({
      name: "uploadToS3",
      payload: {
        fileName,
        fileToken,
        assetType: "cover_image",
        userId: user.id,
        path: user.id + "/" + fileName
      }
    });
  });

  it("should successfully update user information for step 4 without schedual cover upload", async () => {
    const body = getOnboardBody(4);
    const req = buildReq({ body });
    const res = buildRes({ locals });
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.findByUsername.mockResolvedValue(undefined);

    const data = { cover_image_url: body.cover };
    await controller.handle(req, res);
    expect(mockUploadQueue.add).not.toHaveBeenCalled();
    expect(mockUserRepository.update).toHaveBeenCalledWith(user.id, data);
    expect(mockOnboardService.updateUserOnboardCache).toHaveBeenCalledWith(user.id, data);
  });

  it("should successfully update user information for step 5", async () => {
    const body = getOnboardBody(5);
    const req = buildReq({ body });
    const res = buildRes({ locals });
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.findByUsername.mockResolvedValue(undefined);

    const data = { location: body.location };
    await controller.handle(req, res);
    expect(mockUserRepository.update).toHaveBeenCalledWith(user.id, data);
    expect(mockOnboardService.updateUserOnboardCache).toHaveBeenCalledWith(user.id, data);
  });

  it("should successfully update user information for step 6 and schedule welcome email", async () => {
    const body = getOnboardBody(6);
    const req = buildReq({ body });
    const res = buildRes({ locals });
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.findByUsername.mockResolvedValue(undefined);
    mockUserInterestRepository.findByUserId.mockResolvedValue([]);
    mockPostTopicRepository.getInterestedFeedIds.mockResolvedValue([{ post_id: "post1", topic_id: "topic1" }]);

    await controller.handle(req, res);
    expect(mockUserInterestRepository.create).toHaveBeenCalledWith(user.id, body.topics);
    expect(mockOnboardService.updateUserOnboardCache).toHaveBeenCalledWith(user.id, { topics: body.topics });
    expect(mockTaskQueue.add).toHaveBeenCalledWith({
      name: "email",
      payload: {
        templateName: "welcome",
        to: user.email,
        subject: "Welcome to VoteWise",
        locals: {
          name: `${user.first_name} ${user.last_name}`,
          logo: "http://localhost:3000/assets/logo.png"
        }
      }
    });
    expect(mockPostTopicRepository.getInterestedFeedIds).toHaveBeenCalledWith(body.topics);
    expect(mockTimelineRepository.createMany).toHaveBeenCalledWith([{ post_id: "post1", user_id: user.id }]);
  });

  it("should successfully update onboard status and create new session with updated claims", async () => {
    const body = getOnboardBody(7);
    const req = buildReq({ body });
    const res = buildRes({ locals });
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.findByUsername.mockResolvedValue(undefined);
    mockSessionManagerWithoutCtx.create.mockReturnValue({
      accessToken: "new_access_token",
      refreshToken: "new_refresh_token",
      expiresAt: Date.now() + 3600,
      expiresInMs: 3600000,
      sessionId: "new_session_id"
    });

    await controller.handle(req, res);
    expect(mockUserRepository.update).toHaveBeenCalledWith(user.id, { is_onboarded: true });
    expect(mockOnboardService.clearUserOnboardCache).toHaveBeenCalledWith(user.id);
    expect(mockSessionManagerWithoutCtx.create).toHaveBeenCalledWith({
      subject: locals.payload.sub,
      aal: locals.payload.aal,
      amr: locals.payload.amr,
      email: locals.payload.email,
      role: locals.payload.role,
      user_aal_level: locals.payload.user_aal_level,
      appMetaData: locals.payload.app_metadata,
      isOnboarded: true
    });
    expect(mockSessionManagerWithoutCtx.delete).toHaveBeenCalledWith(locals.payload.session_id);
    expect(mockSessionManagerWithoutCtx.save).toHaveBeenCalledWith("new_session_id", {
      ip: locals.session.ip,
      userAgent: locals.session.userAgent,
      aal: locals.payload.aal,
      userId: user.id
    });
  });
});
