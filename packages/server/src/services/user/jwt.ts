import jsonwebtoken from "jsonwebtoken";

import dotenv from "dotenv";

import { prisma } from "@votewise/prisma";

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
    return jsonwebtoken.verify(token, ACCESS_TOKEN_SECRET as string);
  }

  verifyRefreshToken(token: string) {
    return jsonwebtoken.verify(token, REFRESH_TOKEN_SECRET as string);
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

  async checkIfRefreshTokenExists(userId: number, token: string) {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: {
        user_id: userId,
      },
    });

    if (!refreshToken) {
      return false;
    }

    return refreshToken.token === token;
  }
}

export default new JWTService();
