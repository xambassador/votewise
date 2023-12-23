import bcrypt from "bcrypt";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { v4 } from "uuid";

import type {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterUserPayload,
  ResendEmailVerificationPayload,
  ResetPasswordPayload,
  ResetPasswordQuery,
  RevokeAccessTokenPayload,
  VerifyEmailQuery,
} from "@votewise/types";

import ServerError from "@/src/classes/ServerError";
import Success from "@/src/classes/Success";
import ValidationError from "@/src/classes/ValidationError";

import EmailService from "@/src/services/email";
import UserService from "@/src/services/user";
import JWTService from "@/src/services/user/jwt";

import {
  ACCESS_TOKEN_REVOKE_MSG,
  EMAIL_ALREADY_VERIFIED_MSG,
  EMAIL_REQUIRED_MSG,
  EMAIL_SENT_RESPONSE,
  EMAIL_VERIFIED_RESPONSE,
  getIp,
  INVALID_CREDENTIALS_MSG,
  INVALID_EMAIL_MSG,
  INVALID_REFRESHTOKEN_MSG,
  LOGIN_SUCCESS_MSG,
  PASSWORD_RESET_RESPONSE,
  REFRESHTOKEN_REQUIRED_MSG,
  TOKEN_REQUIRED_MSG,
  UNAUTHORIZED_MSG,
  USER_ALREADY_EXISTS_MSG,
  USER_CREATED_SUCCESSFULLY_MSG,
  USER_NOT_FOUND_MSG,
} from "@/src/utils";

import { isEmail } from "@/src/zodValidation/auth";

import env from "@/src/env";

const { FRONTEND_URL } = env;

/** Register a new user */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as RegisterUserPayload;
  const validation = UserService.isValidRegisterPayload(payload);

  try {
    if (!validation.success) throw new ValidationError(validation.message);

    const user = await UserService.checkIfUserExists(payload.email);
    if (user) throw new ServerError(StatusCodes.CONFLICT, USER_ALREADY_EXISTS_MSG);

    const newUser = await UserService.createUser(payload);

    // Creating a partial access token to complete onboarding process
    // After onboarding process is completed, we will give a new access token
    const accessToken = JWTService.generateAccessToken({ userId: newUser.id, onboarded: false });
    const refreshToken = JWTService.generateRefreshToken({ userId: newUser.id });
    const csrfToken = v4();
    await JWTService.saveRefreshToken(newUser.id, refreshToken);
    await UserService.updateLastLogin(newUser.id);

    const verifyToken = JWTService.generateAccessToken(
      { userId: newUser.id, onboarded: false },
      {
        expiresIn: 300,
      }
    );
    const url = `${FRONTEND_URL}/verify-email?token=${verifyToken}`;
    // TODO: Replace this with a template
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

    const response = new Success(USER_CREATED_SUCCESSFULLY_MSG, {
      accessToken,
      refreshToken,
      csrfToken,
    });
    return res.status(StatusCodes.CREATED).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Login a user */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as LoginPayload;
  const validation = UserService.isValidLoginPayload(payload);

  if (!validation.success) return next(new ValidationError(validation.message));

  try {
    const user = await UserService.checkIfUserExists(payload.username);

    if (!user) throw new ServerError(StatusCodes.NOT_FOUND, USER_NOT_FOUND_MSG);

    const isPasswordCorrect = await UserService.validatePassword(payload.password, user.password);

    if (!isPasswordCorrect) throw new ServerError(StatusCodes.UNAUTHORIZED, INVALID_CREDENTIALS_MSG);

    const accessToken = JWTService.generateAccessToken({ userId: user.id, onboarded: user.onboarded });
    const refreshToken = JWTService.generateRefreshToken(
      { userId: user.id },
      {
        expiresIn: payload.rememberMe ? "7d" : "1d",
      }
    );
    const csrfToken = v4();
    await JWTService.saveRefreshToken(user.id, refreshToken, true);
    UserService.updateLastLogin(user.id).catch();

    const response = new Success(LOGIN_SUCCESS_MSG, {
      accessToken,
      refreshToken,
      csrfToken,
    });

    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Revoke access token */
export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken, accessToken: token } = req.body as RevokeAccessTokenPayload;

  if (!token) return next(new ValidationError(TOKEN_REQUIRED_MSG));
  if (!refreshToken) return next(new ValidationError(REFRESHTOKEN_REQUIRED_MSG));

  try {
    JWTService.verifyAccessToken(token);
    const decoded = JWTService.verifyRefreshToken(refreshToken);

    const isRefreshTokenExists = await JWTService.isRefreshTokenExists(Number(decoded.userId), refreshToken);

    if (!isRefreshTokenExists) {
      throw new ServerError(StatusCodes.UNAUTHORIZED, INVALID_REFRESHTOKEN_MSG);
    }

    const accessToken = JWTService.generateAccessToken({ userId: decoded.userId, onboarded: false });
    const newRefreshToken = JWTService.generateRefreshToken({ userId: decoded.userId });
    await JWTService.saveRefreshToken(Number(decoded.userId), newRefreshToken, true);

    const response = new Success(ACCESS_TOKEN_REVOKE_MSG, {
      accessToken,
      refreshToken: newRefreshToken,
    });

    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Forgot password */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as ForgotPasswordPayload;

  if (!payload.email) return next(new ValidationError(EMAIL_REQUIRED_MSG));
  if (!isEmail(payload.email)) return next(new ValidationError(INVALID_EMAIL_MSG));

  try {
    const user = await UserService.checkIfUserExists(payload.email);
    if (!user) throw new ServerError(StatusCodes.NOT_FOUND, USER_NOT_FOUND_MSG);

    // We are creating a key using user id and ip address.
    // There is a chance that ip can be null. But user id will always be there.
    // After creating the key, we will hash it and create a jwt token.
    // We will send this token to the user's email address.
    const ip = getIp(req);
    const rid = await bcrypt.hash(`${user.id}${ip}`, 10);
    const token = JWTService.generateRidToken({ rid }, { expiresIn: 300 });
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${user.email}`;
    const emailData = {
      to: user.email,
      html: `<p>Click the link below to reset your password</p><a href="${url}">${url}</a>`,
      subject: "Reset password",
    };
    const transporter = new EmailService(emailData, "REGISTRATION_MAIL");
    transporter.addToQueue();

    const response = new Success(EMAIL_SENT_RESPONSE.message, { message: EMAIL_SENT_RESPONSE.message });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Reset password */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { password } = req.body as ResetPasswordPayload;
  const { token, email } = req.query as ResetPasswordQuery;

  if (!token) return next(new ValidationError(TOKEN_REQUIRED_MSG));
  if (!email) return next(new ValidationError(EMAIL_REQUIRED_MSG));
  if (!isEmail(email)) return next(new ValidationError(INVALID_EMAIL_MSG));

  const validation = UserService.isValidRegisterPayload({
    email,
    password,
  });

  if (!validation.success) return next(new ValidationError(validation.message));

  try {
    const user = await UserService.checkIfUserExists(email);
    if (!user) throw new ServerError(StatusCodes.NOT_FOUND, USER_NOT_FOUND_MSG);

    const ip = getIp(req);
    const ridKey = `${user.id}${ip}`;
    const { rid } = JWTService.verifyRidToken(token);
    const isValidRid = await bcrypt.compare(ridKey, rid);

    if (!isValidRid) throw new ServerError(StatusCodes.UNAUTHORIZED, UNAUTHORIZED_MSG);

    await UserService.updatePassword(password, user.id);

    // TODO: Replace this with a template
    const emailData = {
      to: user.email,
      html: `<p>Your password has been reset successfully</p>`,
      subject: "Password reset",
    };

    const transporter = new EmailService(emailData, "NOTIFICATION_MAIL");
    transporter.addToQueue();

    const response = new Success(PASSWORD_RESET_RESPONSE.message, {
      message: PASSWORD_RESET_RESPONSE.message,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Verify email */
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.query as VerifyEmailQuery;

  if (!token) return next(new ValidationError(TOKEN_REQUIRED_MSG));

  try {
    const { userId } = JWTService.verifyAccessToken(token) as { userId: number };
    await UserService.verifyEmail(userId);
    const response = new Success(EMAIL_VERIFIED_RESPONSE.message, {
      message: EMAIL_VERIFIED_RESPONSE.message,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/** Resend email verification */
export const resendEmailVerification = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body as ResendEmailVerificationPayload;

  if (!email) return next(new ValidationError(EMAIL_REQUIRED_MSG));
  if (!isEmail(email)) return next(new ValidationError(INVALID_EMAIL_MSG));

  try {
    const user = await UserService.checkIfUserExists(email);

    if (!user) throw new ServerError(StatusCodes.NOT_FOUND, USER_NOT_FOUND_MSG);
    if (user.is_email_verify) throw new ServerError(StatusCodes.BAD_REQUEST, EMAIL_ALREADY_VERIFIED_MSG);

    const token = JWTService.generateAccessToken(
      { userId: user.id, onboarded: user.onboarded },
      { expiresIn: 300 }
    );
    const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${user.email}`;

    // TODO: Replace this with a template
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

    const response = new Success(EMAIL_SENT_RESPONSE.message, {
      message: EMAIL_SENT_RESPONSE.message,
    });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};
