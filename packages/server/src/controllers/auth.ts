import bcrypt from "bcrypt";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import httpStatusCodes from "http-status-codes";

// -----------------------------------------------------------------------------------------
import type {
  RegisterUserPayload,
  LoginPayload,
  RevokeAccessTokenPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ResetPasswordQuery,
  VerifyEmailQuery,
  ResendEmailVerificationPayload,
} from "@votewise/types";

// -----------------------------------------------------------------------------------------
import { JSONResponse } from "../lib";
// -----------------------------------------------------------------------------------------
import EmailService from "../services/email";
import UserService from "../services/user";
import JWTService from "../services/user/jwt";
// -----------------------------------------------------------------------------------------
import { logger } from "../utils";
import { isEmail } from "../zodValidation/auth";

dotenv.config();

const { FRONTEND_URL } = process.env;

if (!FRONTEND_URL) {
  logger("FRONTEND_URL is not defined in .env file", "error");
  process.exit(1);
}

const { BAD_REQUEST, CONFLICT, CREATED, NOT_FOUND, UNAUTHORIZED, OK } = httpStatusCodes;

// -----------------------------------------------------------------------------------------
// Register a new user
export const register = async (req: Request, res: Response) => {
  const payload: RegisterUserPayload = req.body;
  const isValid = UserService.isValidRegisterPayload(payload);

  // Validate the request body
  if (!isValid.success) {
    return res
      .status(BAD_REQUEST)
      .json(new JSONResponse("Validation failed", null, { message: isValid.message }, false));
  }

  // Check if the user already exists
  const user = await UserService.checkIfUserExists(payload.email);

  if (user) {
    return res
      .status(CONFLICT)
      .json(new JSONResponse("User already exists", null, { message: "User already exists" }, false));
  }

  // Create a new user
  const newUser = await UserService.createUser(payload);

  // Create a new accessToken and refreshToken
  const accessToken = JWTService.generateAccessToken({ userId: newUser.id });
  const refreshToken = JWTService.generateRefreshToken({ userId: newUser.id });
  await JWTService.saveRefreshToken(newUser.id, refreshToken);
  await UserService.updateLastLogin(newUser.id);

  const verifyToken = JWTService.generateAccessToken(
    { userId: newUser.id },
    {
      expiresIn: 300,
    }
  );
  const url = `${FRONTEND_URL}/verify-email?token=${verifyToken}`;
  const emailData = {
    to: newUser.email,
    subject: "Verify your email address",
    html: `
          <h1>Verify your email address</h1>
          <p>Click on the link below to verify your email address</p>
          <a href="${url}">${url}</a>
      `,
  };

  const transporter = new EmailService(emailData, "REGISTRATION_MAIL");
  transporter.addToQueue();

  // Send the accessToken and refreshToken to the client
  return res.status(CREATED).json(
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
      .status(BAD_REQUEST)
      .json(new JSONResponse("Validation failed", null, { message: isValid.message }, false));
  }

  // Check if user is exists or not
  const user = await UserService.checkIfUserExists(payload.username);

  // If user is not exists
  if (!user) {
    return res
      .status(NOT_FOUND)
      .json(new JSONResponse("User not found", null, { message: "User not found" }, false));
  }

  // Check if the password is correct or not
  const isPasswordCorrect = await UserService.validatePassword(payload.password, user.password);

  if (!isPasswordCorrect) {
    return res
      .status(UNAUTHORIZED)
      .json(new JSONResponse("Invalid credentials", null, { message: "Invalid credentials" }, false));
  }

  // Create a new accessToken and refreshToken
  const accessToken = JWTService.generateAccessToken({ userId: user.id });
  const refreshToken = JWTService.generateRefreshToken({ userId: user.id });
  await JWTService.saveRefreshToken(user.id, refreshToken, true);
  await UserService.updateLastLogin(user.id);

  // Send the accessToken and refreshToken to the client
  return res.status(OK).json(new JSONResponse("Login successful", { accessToken, refreshToken }, null, true));
};

// -----------------------------------------------------------------------------------------
// Refresh the access token
export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body as RevokeAccessTokenPayload;

  // Validate the refreshToken
  if (!refreshToken) {
    return res
      .status(BAD_REQUEST)
      .json(new JSONResponse("Validation failed", null, { message: "Refresh token is required" }, false));
  }

  try {
    // Verify the refreshToken
    const decoded = JWTService.verifyRefreshToken(refreshToken) as { userId: string };

    if (!decoded) {
      return res
        .status(UNAUTHORIZED)
        .json(new JSONResponse("Invalid refresh token", null, { message: "Invalid refresh token" }, false));
    }

    // Check if the refreshToken is in the database
    const isRefreshTokenExists = await JWTService.checkIfRefreshTokenExists(
      Number(decoded.userId),
      refreshToken
    );

    if (!isRefreshTokenExists) {
      return res
        .status(UNAUTHORIZED)
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
      .status(OK)
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
      .status(UNAUTHORIZED)
      .json(new JSONResponse("Invalid refresh token", null, { message: msg }, false));
  }
};

// -----------------------------------------------------------------------------------------
// Forgot password: Submit email to get a reset password link
export const forgotPassword = async (req: Request, res: Response) => {
  const payload = req.body as ForgotPasswordPayload;

  if (!payload.email) {
    return res
      .status(BAD_REQUEST)
      .json(new JSONResponse("Validation failed", null, { message: "Email is required" }, false));
  }

  const isValidEmail = isEmail(payload.email);

  if (!isValidEmail) {
    return res
      .status(BAD_REQUEST)
      .json(new JSONResponse("Validation failed", null, { message: "Invalid email" }, false));
  }

  const user = await UserService.checkIfUserExists(payload.email);
  if (!user) {
    return res.status(NOT_FOUND).json(
      new JSONResponse(
        "User not found",
        null,
        {
          message: "User not found",
        },
        false
      )
    );
  }

  const ip = req.header("X-Forwarded-For") || req.ip;
  const rid = await bcrypt.hash(`${user.id}${ip}`, 10);
  const token = JWTService.generateAccessToken({ rid }, { expiresIn: 300 });
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${user.email}`;
  const emailData = {
    to: user.email,
    html: `<p>Click the link below to reset your password</p><a href="${url}">${url}</a>`,
    subject: "Reset password",
  };
  const transporter = new EmailService(emailData, "REGISTRATION_MAIL");
  transporter.addToQueue();
  return res.status(OK).json(
    new JSONResponse(
      "Email sent successfully",
      {
        message: "Request is queued for process. Check your mail box..",
      },
      null,
      true
    )
  );
};

// -----------------------------------------------------------------------------------------
// Reset password: Submit new password with token and email from reset password link
export const resetPassword = async (req: Request, res: Response) => {
  const { password } = req.body as ResetPasswordPayload;
  const { token, email } = req.query as ResetPasswordQuery;

  if (!token) {
    return res
      .status(BAD_REQUEST)
      .json(new JSONResponse("Validation failed", null, { message: "Token is required" }, false));
  }

  if (!email) {
    return res
      .status(BAD_REQUEST)
      .json(new JSONResponse("Validation failed", null, { message: "Email is required" }, false));
  }

  const isValidPayload = UserService.isValidRegisterPayload({
    email,
    password,
  });

  if (!isValidPayload.success) {
    return res.status(BAD_REQUEST).json(
      new JSONResponse(
        "Validation failed",
        null,
        {
          message: isValidPayload.message,
        },
        false
      )
    );
  }

  const user = await UserService.checkIfUserExists(email);

  if (!user) {
    return res.status(NOT_FOUND).json(
      new JSONResponse(
        "User not found",
        null,
        {
          message: "User not found",
        },
        false
      )
    );
  }

  const ip = req.header("X-Forwarded-For") || req.ip;
  const ridKey = `${user.id}${ip}`;
  try {
    const { rid } = JWTService.verifyAccessToken(token) as { rid: string };
    const isValidRid = await bcrypt.compare(ridKey, rid);

    if (!isValidRid) {
      return res.status(UNAUTHORIZED).json(
        new JSONResponse(
          "Unauthorized",
          null,
          {
            message: "Unauthorized",
          },
          false
        )
      );
    }

    await UserService.updatePassword(password, user.id);
    const emailData = {
      to: user.email,
      html: `<p>Your password has been reset successfully</p>`,
      subject: "Password reset",
    };
    const transporter = new EmailService(emailData, "NOTIFICATION_MAIL");
    transporter.addToQueue();
    return res.status(OK).json(
      new JSONResponse(
        "Password reset successfully",
        {
          message: "Password reset successfully",
        },
        null,
        true
      )
    );
  } catch (err) {
    return res.status(UNAUTHORIZED).json(
      new JSONResponse(
        "Unauthorized",
        null,
        {
          message: "Unauthorized",
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
// Email verification: Submit token from email verification link send to user when user registers
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query as VerifyEmailQuery;

  if (!token) {
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .json(new JSONResponse("Validation failed", null, { message: "Token is required" }, false));
  }

  try {
    const { userId } = JWTService.verifyAccessToken(token) as { userId: number };
    await UserService.verifyEmail(userId);
    return res.status(httpStatusCodes.OK).json(
      new JSONResponse(
        "Email verified successfully",
        {
          message: "Email verified successfully",
        },
        null,
        true
      )
    );
  } catch (err) {
    return res.status(httpStatusCodes.UNAUTHORIZED).json(
      new JSONResponse(
        "Unauthorized",
        null,
        {
          message: "Unauthorized",
        },
        false
      )
    );
  }
};

// -----------------------------------------------------------------------------------------
// Resend email verification: Submit email to resend email verification link
export const resendEmailVerification = async (req: Request, res: Response) => {
  const { email } = req.body as ResendEmailVerificationPayload;

  if (!email) {
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .json(new JSONResponse("Validation failed", null, { message: "Email is required" }, false));
  }

  const isValidEmail = isEmail(email);

  if (!isValidEmail) {
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .json(new JSONResponse("Validation failed", null, { message: "Invalid email" }, false));
  }

  const user = await UserService.checkIfUserExists(email);

  if (!user) {
    return res.status(httpStatusCodes.NOT_FOUND).json(
      new JSONResponse(
        "User not found",
        null,
        {
          message: "User not found",
        },
        false
      )
    );
  }

  if (user.is_email_verify) {
    return res.status(httpStatusCodes.BAD_REQUEST).json(
      new JSONResponse(
        "Validation failed",
        null,
        {
          message: "Email already verified",
        },
        false
      )
    );
  }

  const token = JWTService.generateAccessToken({ userId: user.id }, { expiresIn: 300 });
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${user.email}`;
  const emailData = {
    to: user.email,
    subject: "Verify your email address",
    html: `
        <h1>Verify your email address</h1>
        <p>Click on the link below to verify your email address</p>
        <a href="${url}">${url}</a>
    `,
  };

  const transporter = new EmailService(emailData, "REGISTRATION_MAIL");
  transporter.addToQueue();

  return res.status(httpStatusCodes.OK).json(
    new JSONResponse(
      "Email sent successfully",
      {
        message: "Request is queued for process. Check your mail box.",
      },
      null,
      true
    )
  );
};
