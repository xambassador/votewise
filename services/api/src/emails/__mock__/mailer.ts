import type { Mailer } from "../mailer";

export const mockMailer = {
  send: jest.fn()
} as unknown as jest.Mocked<Mailer>;
