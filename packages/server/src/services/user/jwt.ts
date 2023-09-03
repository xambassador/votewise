import jsonwebtoken from "jsonwebtoken";

import { prisma } from "@votewise/prisma";

import ServerError from "@/src/classes/ServerError";
import { UNAUTHORIZED_MSG } from "@/src/utils";

import env from "@/src/env";

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = env;

class JWTService {
  generateAccessToken(payload: object, config: jsonwebtoken.SignOptions = { expiresIn: "15m" }) {
    return jsonwebtoken.sign(payload, ACCESS_TOKEN_SECRET, config);
  }

  generateRefreshToken(payload: object, config: jsonwebtoken.SignOptions = { expiresIn: "7d" }) {
    return jsonwebtoken.sign(payload, REFRESH_TOKEN_SECRET, config);
  }

  verifyAccessToken(token: string) {
    try {
      return jsonwebtoken.verify(token, ACCESS_TOKEN_SECRET);
    } catch (err) {
      throw new ServerError(401, UNAUTHORIZED_MSG);
    }
  }

  verifyRefreshToken(token: string) {
    try {
      return jsonwebtoken.verify(token, REFRESH_TOKEN_SECRET);
    } catch (err) {
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
    await prisma.refreshToken.create({
      data: {
        token,
        user_id: userId,
      },
    });
  }

  private async updateRefreshToken(userId: number, token: string) {
    await prisma.refreshToken.update({
      where: {
        user_id: userId,
      },
      data: {
        token,
      },
    });
  }

  async isRefreshTokenExists(userId: number, token: string) {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: {
        user_id: userId,
      },
    });

    if (!refreshToken) return false;
    return refreshToken.token === token;
  }
}

export default new JWTService();
