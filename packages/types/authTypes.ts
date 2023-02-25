/**
 * @file: authTypes.ts
 * @description: This file contains types that are shared between the server and client
 */

type RegisterUserPayload = {
  email: string;
  password: string;
};

export type { RegisterUserPayload };
