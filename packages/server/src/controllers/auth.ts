import dotenv from "dotenv";
import type { Request, Response } from "express";
import httpStatusCodes from "http-status-codes";
import pino from "pino";

// -----------------------------------------------------------------------------------------
import type { RegisterUserPayload, LoginPayload } from "@votewise/types";

// -----------------------------------------------------------------------------------------
import { JSONResponse } from "../lib";
import UserService from "../services/user";
import JWTService from "../services/user/jwt";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.JWT_SALT_ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_SALT_REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  pino().error("Missing JWT_SALT_ACCESS_TOKEN_SECRET or JWT_SALT_REFRESH_TOKEN_SECRET");
  process.exit(1);
}

// -----------------------------------------------------------------------------------------
// Register a new user
export const register = async (req: Request, res: Response) => {
  const payload: RegisterUserPayload = req.body;
  const isValid = UserService.isValidRegisterPayload(payload);

  // Validate the request body
  if (!isValid.success) {
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .json(new JSONResponse("Validation failed", null, { message: isValid.message }, false));
  }

  // Check if the user already exists
  const user = await UserService.checkIfUserExists(payload.email);

  if (user) {
    return res
      .status(httpStatusCodes.CONFLICT)
      .json(new JSONResponse("User already exists", null, { message: "User already exists" }, false));
  }

  // Create a new user
  const newUser = await UserService.createUser(payload);

  // Create a new accessToken and refreshToken
  const accessToken = JWTService.generateAccessToken({ userId: newUser.id });
  const refreshToken = JWTService.generateRefreshToken({ userId: newUser.id });
  await JWTService.saveRefreshToken(newUser.id, refreshToken);

  // TODO: Send an email for verifying the email address

  // Send the accessToken and refreshToken to the client
  return res.status(httpStatusCodes.CREATED).json(
    new JSONResponse(
      "User created successfully",
      {
        accessToken,
        refreshToken,
      },
      null,
      true
    )
  );
};

// -----------------------------------------------------------------------------------------
// Login a user
export const login = async (req: Request, res: Response) => {
  // Validate body payload
  const payload = req.body as LoginPayload;
  const isValid = UserService.isValidLoginPayload(payload);

  if (!isValid.success) {
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .json(new JSONResponse("Validation failed", null, { message: isValid.message }, false));
  }

  // Check if user is exists or not
  const user = await UserService.checkIfUserExists(payload.username);

  // If user is not exists
  if (!user) {
    return res
      .status(httpStatusCodes.NOT_FOUND)
      .json(new JSONResponse("User not found", null, { message: "User not found" }, false));
  }

  // Check if the password is correct or not
  const isPasswordCorrect = await UserService.validatePassword(payload.password, user.password);

  if (!isPasswordCorrect) {
    return res
      .status(httpStatusCodes.UNAUTHORIZED)
      .json(new JSONResponse("Invalid credentials", null, { message: "Invalid credentials" }, false));
  }

  // Create a new accessToken and refreshToken
  const accessToken = JWTService.generateAccessToken({ userId: user.id });
  const refreshToken = JWTService.generateRefreshToken({ userId: user.id });
  await JWTService.saveRefreshToken(user.id, refreshToken, true);

  // Send the accessToken and refreshToken to the client
  return res
    .status(httpStatusCodes.OK)
    .json(new JSONResponse("Login successful", { accessToken, refreshToken }, null, true));
};

// -----------------------------------------------------------------------------------------
// Refresh the access token
export const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken as string;

  // Validate the refreshToken
  if (!refreshToken) {
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .json(new JSONResponse("Validation failed", null, { message: "Refresh token is required" }, false));
  }

  try {
    // Verify the refreshToken
    const decoded = JWTService.verifyRefreshToken(refreshToken) as { userId: string };

    if (!decoded) {
      return res
        .status(httpStatusCodes.UNAUTHORIZED)
        .json(new JSONResponse("Invalid refresh token", null, { message: "Invalid refresh token" }, false));
    }

    // Check if the refreshToken is in the database
    const isRefreshTokenExists = await JWTService.checkIfRefreshTokenExists(
      Number(decoded.userId),
      refreshToken
    );

    if (!isRefreshTokenExists) {
      return res
        .status(httpStatusCodes.UNAUTHORIZED)
        .json(
          new JSONResponse("Invalid refresh token", null, { message: "Refresh token was expired." }, false)
        );
    }

    // Create a new accessToken and refreshToken
    const accessToken = JWTService.generateAccessToken({ userId: decoded.userId });
    const newRefreshToken = JWTService.generateRefreshToken({ userId: decoded.userId });
    await JWTService.saveRefreshToken(Number(decoded.userId), newRefreshToken, true);

    // Send the accessToken and refreshToken to the client
    return res
      .status(httpStatusCodes.OK)
      .json(
        new JSONResponse(
          "Access token revoked successfully",
          { accessToken, refreshToken: newRefreshToken },
          null,
          true
        )
      );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const msg = (err.message as string) || "Invalid refresh token";
    return res
      .status(httpStatusCodes.UNAUTHORIZED)
      .json(new JSONResponse("Invalid refresh token", null, { message: msg }, false));
  }
};

// -----------------------------------------------------------------------------------------
// Forgot password

// -----------------------------------------------------------------------------------------
// Reset password

// -----------------------------------------------------------------------------------------
// Email verification

// -----------------------------------------------------------------------------------------
// Resend email verification
