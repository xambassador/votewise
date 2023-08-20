import bcrypt from "bcrypt";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import dotenv from "dotenv";

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

/* ----------------------------------------------------------------------------------------------- */
dotenv.config();

const { FRONTEND_URL } = process.env;

/* ----------------------------------------------------------------------------------------------- */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as RegisterUserPayload;
  const validation = UserService.isValidRegisterPayload(payload);

  try {
    if (!validation.success) throw new ValidationError(validation.message);

    const user = await UserService.checkIfUserExists(payload.email);
    if (user) throw new ServerError(StatusCodes.CONFLICT, USER_ALREADY_EXISTS_MSG);

    const newUser = await UserService.createUser(payload);

    const accessToken = JWTService.generateAccessToken({ userId: newUser.id });
    const refreshToken = JWTService.generateRefreshToken({ userId: newUser.id });
    await JWTService.saveRefreshToken(newUser.id, refreshToken);
    UserService.updateLastLogin(newUser.id).catch();

    const verifyToken = JWTService.generateAccessToken(
      { userId: newUser.id },
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
    });
    return res.status(StatusCodes.CREATED).json(response);
  } catch (err) {
    return next(err);
  }
};

/* ----------------------------------------------------------------------------------------------- */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as LoginPayload;
  const validation = UserService.isValidLoginPayload(payload);

  if (!validation.success) return next(new ValidationError(validation.message));

  try {
    const user = await UserService.checkIfUserExists(payload.username);

    if (!user) throw new ServerError(StatusCodes.NOT_FOUND, USER_NOT_FOUND_MSG);

    const isPasswordCorrect = await UserService.validatePassword(payload.password, user.password);

    if (!isPasswordCorrect) throw new ServerError(StatusCodes.UNAUTHORIZED, INVALID_CREDENTIALS_MSG);

    const accessToken = JWTService.generateAccessToken({ userId: user.id });
    const refreshToken = JWTService.generateRefreshToken(
      { userId: user.id },
      {
        expiresIn: payload.rememberMe ? "7d" : "1d",
      }
    );
    await JWTService.saveRefreshToken(user.id, refreshToken, true);
    UserService.updateLastLogin(user.id).catch();

    const response = new Success(LOGIN_SUCCESS_MSG, {
      accessToken,
      refreshToken,
    });

    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/* ----------------------------------------------------------------------------------------------- */
export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body as RevokeAccessTokenPayload;

  if (!refreshToken) return next(new ValidationError(REFRESHTOKEN_REQUIRED_MSG));

  // TODO: need to add validation based on ip address
  // TODO: Add userId to the payload and check if the user is valid user and he/she validate his/her own token

  try {
    const decoded = JWTService.verifyRefreshToken(refreshToken) as { userId: string };
    if (!decoded) throw new ServerError(StatusCodes.UNAUTHORIZED, INVALID_REFRESHTOKEN_MSG);

    const isRefreshTokenExists = await JWTService.checkIfRefreshTokenExists(
      Number(decoded.userId),
      refreshToken
    );

    if (!isRefreshTokenExists) {
      throw new ServerError(StatusCodes.UNAUTHORIZED, INVALID_REFRESHTOKEN_MSG);
    }

    const accessToken = JWTService.generateAccessToken({ userId: decoded.userId });
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

/* ----------------------------------------------------------------------------------------------- */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as ForgotPasswordPayload;

  if (!payload.email) return next(new ValidationError(EMAIL_REQUIRED_MSG));
  if (!isEmail(payload.email)) return next(new ValidationError(INVALID_EMAIL_MSG));

  try {
    const user = await UserService.checkIfUserExists(payload.email);
    if (!user) throw new ServerError(StatusCodes.NOT_FOUND, USER_NOT_FOUND_MSG);

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

    const response = new Success(EMAIL_SENT_RESPONSE.message, { message: EMAIL_SENT_RESPONSE.message });
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/* ----------------------------------------------------------------------------------------------- */
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

    const ip = req.header("X-Forwarded-For") || req.ip;
    const ridKey = `${user.id}${ip}`;
    const { rid } = JWTService.verifyAccessToken(token) as { rid: string };
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

/* ----------------------------------------------------------------------------------------------- */
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

/* ----------------------------------------------------------------------------------------------- */
export const resendEmailVerification = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body as ResendEmailVerificationPayload;

  if (!email) return next(new ValidationError(EMAIL_REQUIRED_MSG));
  if (!isEmail(email)) return next(new ValidationError(INVALID_EMAIL_MSG));

  try {
    const user = await UserService.checkIfUserExists(email);

    if (!user) throw new ServerError(StatusCodes.NOT_FOUND, USER_NOT_FOUND_MSG);
    if (user.is_email_verify) throw new ServerError(StatusCodes.BAD_REQUEST, EMAIL_ALREADY_VERIFIED_MSG);

    const token = JWTService.generateAccessToken({ userId: user.id }, { expiresIn: 300 });
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
