import bcrypt from "bcrypt";
import type { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";

/* ----------------------------------------------------------------------------------------------- */
import dotenv from "dotenv";

/* ----------------------------------------------------------------------------------------------- */
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

/* ----------------------------------------------------------------------------------------------- */
import { JSONResponse } from "@/src/lib";
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
  SOMETHING_WENT_WRONG_MSG,
  TOKEN_REQUIRED_MSG,
  UNAUTHORIZED_MSG,
  USER_ALREADY_EXISTS_MSG,
  USER_CREATED_SUCCESSFULLY_MSG,
  USER_NOT_FOUND_MSG,
  VALIDATION_FAILED_MSG,
  getErrorReason,
} from "@/src/utils";
import { isEmail } from "@/src/zodValidation/auth";

dotenv.config();

/* -----------------------------------------------------------------------------------------------
 * Global Variables & Constants
 * -----------------------------------------------------------------------------------------------*/
const { FRONTEND_URL } = process.env;

/* -----------------------------------------------------------------------------------------------
 * @function: register
 * -----------------------------------------------------------------------------------------------*/
export const register = async (req: Request, res: Response, next: NextFunction) => {
  const payload: RegisterUserPayload = req.body;
  const isValid = UserService.isValidRegisterPayload(payload);

  if (!isValid.success) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, {
        reason: isValid.message,
      })
    );
  }

  try {
    const user = await UserService.checkIfUserExists(payload.email);

    if (user) {
      return next(createError(StatusCodes.CONFLICT, USER_ALREADY_EXISTS_MSG));
    }

    const newUser = await UserService.createUser(payload);

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

    return res.status(StatusCodes.CREATED).json(
      new JSONResponse(
        USER_CREATED_SUCCESSFULLY_MSG,
        {
          accessToken,
          refreshToken,
        },
        null,
        true
      )
    );
  } catch (err) {
    const msg = getErrorReason(err) || "Something went wrong";
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

/* -----------------------------------------------------------------------------------------------
 * @function: login
 * -----------------------------------------------------------------------------------------------*/
export const login = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as LoginPayload;
  const isValid = UserService.isValidLoginPayload(payload);

  if (!isValid.success) {
    return next(createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: isValid.message }));
  }

  try {
    const user = await UserService.checkIfUserExists(payload.username);

    if (!user) return next(createError(StatusCodes.NOT_FOUND, USER_NOT_FOUND_MSG));

    const isPasswordCorrect = await UserService.validatePassword(payload.password, user.password);

    if (!isPasswordCorrect) return next(createError(StatusCodes.UNAUTHORIZED, INVALID_CREDENTIALS_MSG));

    const accessToken = JWTService.generateAccessToken({ userId: user.id });
    const refreshToken = JWTService.generateRefreshToken(
      { userId: user.id },
      {
        expiresIn: payload.rememberMe ? "7d" : "1d",
      }
    );
    await JWTService.saveRefreshToken(user.id, refreshToken, true);
    await UserService.updateLastLogin(user.id);

    return res
      .status(StatusCodes.OK)
      .json(new JSONResponse(LOGIN_SUCCESS_MSG, { accessToken, refreshToken }, null, true));
  } catch (err) {
    const msg = getErrorReason(err) || "Something went wrong";
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

/* -----------------------------------------------------------------------------------------------
 * @function: refreshAccessToken
 * -----------------------------------------------------------------------------------------------*/
export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken } = req.body as RevokeAccessTokenPayload;

  if (!refreshToken)
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, {
        reason: REFRESHTOKEN_REQUIRED_MSG,
      })
    );

  // TODO: need to add validation based on ip address
  // TODO: Add userId to the payload and check if the user is valid user and he/she validate his/her own token

  try {
    const decoded = JWTService.verifyRefreshToken(refreshToken) as { userId: string };

    if (!decoded) return next(createError(StatusCodes.UNAUTHORIZED, INVALID_REFRESHTOKEN_MSG));

    const isRefreshTokenExists = await JWTService.checkIfRefreshTokenExists(
      Number(decoded.userId),
      refreshToken
    );

    if (!isRefreshTokenExists) {
      return next(
        createError(StatusCodes.UNAUTHORIZED, INVALID_REFRESHTOKEN_MSG, {
          reason: "Refresh token was expired.",
        })
      );
    }

    const accessToken = JWTService.generateAccessToken({ userId: decoded.userId });
    const newRefreshToken = JWTService.generateRefreshToken({ userId: decoded.userId });
    await JWTService.saveRefreshToken(Number(decoded.userId), newRefreshToken, true);

    return res
      .status(StatusCodes.OK)
      .json(
        new JSONResponse(ACCESS_TOKEN_REVOKE_MSG, { accessToken, refreshToken: newRefreshToken }, null, true)
      );
  } catch (err) {
    return next(createError(StatusCodes.UNAUTHORIZED, INVALID_REFRESHTOKEN_MSG));
  }
};

/* -----------------------------------------------------------------------------------------------
 * @function: forgotPassword
 * -----------------------------------------------------------------------------------------------*/
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  const payload = req.body as ForgotPasswordPayload;

  if (!payload.email)
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, {
        reason: EMAIL_REQUIRED_MSG,
      })
    );
  if (!isEmail(payload.email))
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, {
        reason: INVALID_EMAIL_MSG,
      })
    );

  try {
    const user = await UserService.checkIfUserExists(payload.email);
    if (!user) return next(createError(StatusCodes.NOT_FOUND, USER_NOT_FOUND_MSG));

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
    return res.status(StatusCodes.OK).json(EMAIL_SENT_RESPONSE);
  } catch (err) {
    const msg = getErrorReason(err) || "Something went wrong";
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

/* -----------------------------------------------------------------------------------------------
 * @function: resetPassword
 * -----------------------------------------------------------------------------------------------*/
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { password } = req.body as ResetPasswordPayload;
  const { token, email } = req.query as ResetPasswordQuery;

  if (!token)
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, {
        reason: TOKEN_REQUIRED_MSG,
      })
    );
  if (!email)
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, {
        reason: EMAIL_REQUIRED_MSG,
      })
    );

  const isValidPayload = UserService.isValidRegisterPayload({
    email,
    password,
  });

  if (!isValidPayload.success) {
    return next(
      createError(StatusCodes.BAD_REQUEST, VALIDATION_FAILED_MSG, { reason: isValidPayload.message })
    );
  }

  try {
    const user = await UserService.checkIfUserExists(email);
    if (!user) return next(createError(StatusCodes.NOT_FOUND, USER_NOT_FOUND_MSG));

    const ip = req.header("X-Forwarded-For") || req.ip;
    const ridKey = `${user.id}${ip}`;
    const { rid } = JWTService.verifyAccessToken(token) as { rid: string };
    const isValidRid = await bcrypt.compare(ridKey, rid);

    if (!isValidRid) return next(createError(StatusCodes.UNAUTHORIZED, UNAUTHORIZED_MSG));

    await UserService.updatePassword(password, user.id);
    const emailData = {
      to: user.email,
      html: `<p>Your password has been reset successfully</p>`,
      subject: "Password reset",
    };
    const transporter = new EmailService(emailData, "NOTIFICATION_MAIL");
    transporter.addToQueue();
    return res.status(StatusCodes.OK).json(PASSWORD_RESET_RESPONSE);
  } catch (err) {
    const msg = getErrorReason(err);

    if (msg === "jwt expired" || msg === "invalid token") {
      return next(createError(StatusCodes.UNAUTHORIZED, UNAUTHORIZED_MSG));
    }

    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

/* -----------------------------------------------------------------------------------------------
 * @function: verifyEmail
 * -----------------------------------------------------------------------------------------------*/
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.query as VerifyEmailQuery;

  if (!token) return next(createError(StatusCodes.BAD_REQUEST, TOKEN_REQUIRED_MSG));

  try {
    const { userId } = JWTService.verifyAccessToken(token) as { userId: number };
    await UserService.verifyEmail(userId);
    return res.status(StatusCodes.OK).json(EMAIL_VERIFIED_RESPONSE);
  } catch (err) {
    const msg = getErrorReason(err);
    if (msg === "jwt expired" || msg === "invalid token") {
      return next(createError(StatusCodes.UNAUTHORIZED, UNAUTHORIZED_MSG));
    }
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};

/* -----------------------------------------------------------------------------------------------
 * @function: resendEmailVerification
 * -----------------------------------------------------------------------------------------------*/
export const resendEmailVerification = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body as ResendEmailVerificationPayload;

  if (!email) return next(createError(StatusCodes.BAD_REQUEST, EMAIL_REQUIRED_MSG));
  if (!isEmail(email)) return next(createError(StatusCodes.BAD_REQUEST, INVALID_EMAIL_MSG));

  try {
    const user = await UserService.checkIfUserExists(email);

    if (!user) return next(createError(StatusCodes.NOT_FOUND, USER_NOT_FOUND_MSG));
    if (user.is_email_verify) return next(createError(StatusCodes.BAD_REQUEST, EMAIL_ALREADY_VERIFIED_MSG));

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

    return res.status(StatusCodes.OK).json(EMAIL_SENT_RESPONSE);
  } catch (err) {
    const msg = getErrorReason(err);
    return next(createError(StatusCodes.INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG_MSG, { reason: msg }));
  }
};
