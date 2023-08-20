import jsonwebtoken, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import dotenv from "dotenv";

import { prisma } from "@votewise/prisma";

import ServerError from "@/src/classes/ServerError";
import { DB_ERROR_CODE, UNAUTHORIZED_MSG } from "@/src/utils";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.JWT_SALT_ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_SALT_REFRESH_TOKEN_SECRET;

class JWTService {
  generateAccessToken(payload: object, config: jsonwebtoken.SignOptions = { expiresIn: "15m" }) {
    return jsonwebtoken.sign(payload, ACCESS_TOKEN_SECRET as string, config);
  }

  generateRefreshToken(payload: object, config: jsonwebtoken.SignOptions = { expiresIn: "7d" }) {
    return jsonwebtoken.sign(payload, REFRESH_TOKEN_SECRET as string, config);
  }

  verifyAccessToken(token: string) {
    try {
      return jsonwebtoken.verify(token, ACCESS_TOKEN_SECRET as string);
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new ServerError(401, UNAUTHORIZED_MSG);
      }

      if (err instanceof JsonWebTokenError) {
        throw new ServerError(401, UNAUTHORIZED_MSG);
      }

      // If something else, throw unauthorized
      throw new ServerError(401, UNAUTHORIZED_MSG);
    }
  }

  verifyRefreshToken(token: string) {
    try {
      return jsonwebtoken.verify(token, REFRESH_TOKEN_SECRET as string);
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new ServerError(401, UNAUTHORIZED_MSG);
      }

      if (err instanceof JsonWebTokenError) {
        throw new ServerError(401, UNAUTHORIZED_MSG);
      }

      // If something else, throw unauthorized
      throw new ServerError(401, UNAUTHORIZED_MSG);
    }
  }

  async saveRefreshToken(userId: number, token: string, isUpdate = false) {
    if (isUpdate) {
      await this.updateRefreshToken(userId, token);
    } else {
      await this.insertRefreshToken(userId, token);
    }
  }

  private async insertRefreshToken(userId: number, token: string) {
    try {
      await prisma.refreshToken.create({
        data: {
          token,
          user_id: userId,
        },
      });
    } catch (err) {
      throw new ServerError(DB_ERROR_CODE, "Error while inserting refresh token");
    }
  }

  private async updateRefreshToken(userId: number, token: string) {
    try {
      await prisma.refreshToken.update({
        where: {
          user_id: userId,
        },
        data: {
          token,
        },
      });
    } catch (err) {
      throw new ServerError(DB_ERROR_CODE, "Error while updating refresh token");
    }
  }

  async checkIfRefreshTokenExists(userId: number, token: string) {
    try {
      const refreshToken = await prisma.refreshToken.findUnique({
        where: {
          user_id: userId,
        },
      });

      if (!refreshToken) {
        return false;
      }

      return refreshToken.token === token;
    } catch (err) {
      throw new ServerError(DB_ERROR_CODE, "Error while checking refresh token");
    }
  }
}

export default new JWTService();
