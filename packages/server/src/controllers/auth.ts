import bcrypt from "bcrypt";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import httpStatusCodes from "http-status-codes";
import jsonwebtoken from "jsonwebtoken";
import pino from "pino";

import { prisma } from "@votewise/prisma";
// -----------------------------------------------------------------------------------------
import type { RegisterUserPayload } from "@votewise/types";

// -----------------------------------------------------------------------------------------
import { JSONResponse } from "../lib";
import { validateRegisterUserSchema } from "../zodValidation";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.JWT_SALT_ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_SALT_REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  pino().error("Missing JWT_SALT_ACCESS_TOKEN_SECRET or JWT_SALT_REFRESH_TOKEN_SECRET");
  process.exit(1);
}

// -----------------------------------------------------------------------------------------
export const register = async (req: Request, res: Response) => {
  const payload: RegisterUserPayload = req.body;
  const isValid = validateRegisterUserSchema(payload);

  // Validate the request body
  if (!isValid.success) {
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .json(new JSONResponse("Validation failed", null, { message: isValid.message }, false));
  }

  // Check if the user already exists or not
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (user) {
    return res.status(httpStatusCodes.CONFLICT).json(
      new JSONResponse(
        "User already exists",
        null,
        {
          message: "User already exists",
        },
        false
      )
    );
  }

  // Create the user
  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const newUser = await prisma.user.create({
    data: {
      email: payload.email,
      password: hashedPassword,
    },
  });

  // Generate the JWT tokens, access token and refresh token
  const accessToken = jsonwebtoken.sign(
    {
      userId: newUser.id,
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );
  const refreshToken = jsonwebtoken.sign(
    {
      userId: newUser.id,
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );

  // Save the refresh token in the database
  const data = await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      user_id: newUser.id,
    },
  });

  pino().info(data);

  // Send the response
  return res
    .status(httpStatusCodes.CREATED)
    .json(new JSONResponse("User created successfully", { accessToken, refreshToken }, null, true));
};
