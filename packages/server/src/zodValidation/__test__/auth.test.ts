/* eslint-disable prefer-const */

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { validateLoginSchema, validateRegisterUserSchema, isEmail } from "../auth";

describe("Register validators", () => {
  test("Should validate a valid register user payload", () => {
    const payload = {
      email: "test@gmail.com",
      password: "test1234",
    };
    const isValid = validateRegisterUserSchema(payload);
    expect(isValid.success).toBe(true);
  });

  test("Should invalidate if register payload is invalid", () => {
    let payload: {
      email: string;
      password?: string;
    } = {
      email: "test@gmail.com",
    };
    // @ts-ignore
    let isValid = validateRegisterUserSchema(payload);
    expect(isValid.success).toBe(false);
    payload = {
      email: "test@gmail",
      password: "12",
    };
    // @ts-ignore
    isValid = validateRegisterUserSchema(payload);
    expect(isValid.success).toBe(false);
    payload = {
      email: "test.com",
      password: "test1234",
    };
    // @ts-ignore
    isValid = validateRegisterUserSchema(payload);
    expect(isValid.success).toBe(false);
  });
});

describe("Login validator", () => {
  test("Should return true is username is passed as email", () => {
    const username = "test@gmail.com";
    const isValidEmail = isEmail(username);
    expect(isValidEmail).toBe(true);
  });

  test("Should return false if username is not an email", () => {
    const username = "test";
    const isValidEmail = isEmail(username);
    expect(isValidEmail).toBe(false);
  });

  test("Should validate a valid login payload", () => {
    let payload = {
      username: "test@gmail.com",
      password: "test1234",
    };
    // @ts-ignore
    let isValid = validateLoginSchema(payload);
    expect(isValid.success).toBe(true);

    payload = {
      username: "test", // since username can be email or username
      password: "test1234",
    };

    // @ts-ignore
    isValid = validateLoginSchema(payload);
    expect(isValid.success).toBe(true);
  });

  test("Should invalidate if login payload is invalid", () => {
    let payload = {
      passowrd: "test1234",
    };

    // @ts-ignore
    let isValid = validateLoginSchema(payload);
    expect(isValid.success).toBe(false);

    // @ts-ignore
    isValid = validateLoginSchema("test@gmail.com");
    expect(isValid.success).toBe(false);
  });
});
