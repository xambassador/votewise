import jsonwebtoken from "jsonwebtoken";

import { prisma } from "@votewise/prisma";

import ServerError from "@/src/classes/ServerError";
import { UNAUTHORIZED_MSG } from "@/src/utils";

import env from "@/src/env";

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = env;

class JWTService {
  public generateAccessToken(
    payload: {
      userId: number;
      onboarded: boolean;
    },
    config: jsonwebtoken.SignOptions = { expiresIn: "15m" }
  ) {
    return jsonwebtoken.sign(payload, ACCESS_TOKEN_SECRET, config);
  }

  public generateRefreshToken(
    payload: {
      userId: number;
    },
    config: jsonwebtoken.SignOptions = { expiresIn: "7d" }
  ) {
    return jsonwebtoken.sign(payload, REFRESH_TOKEN_SECRET, config);
  }

  public verifyAccessToken(token: string) {
    try {
      return jsonwebtoken.verify(token, ACCESS_TOKEN_SECRET) as {
        userId: number;
        onboarded: boolean;
      };
    } catch (err) {
      throw new ServerError(401, UNAUTHORIZED_MSG);
    }
  }

  public verifyRefreshToken(token: string) {
    try {
      return jsonwebtoken.verify(token, REFRESH_TOKEN_SECRET) as {
        userId: number;
      };
    } catch (err) {
      throw new ServerError(401, UNAUTHORIZED_MSG);
    }
  }

  public async saveRefreshToken(userId: number, token: string, isUpdate = false) {
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

  public async isRefreshTokenExists(userId: number, token: string) {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: {
        user_id: userId,
      },
    });

    if (!refreshToken) return false;
    return refreshToken.token === token;
  }

  public generateRidToken(data: { rid: string }, config: jsonwebtoken.SignOptions = { expiresIn: 300 }) {
    // TODO: Change access token secret to new rid token secret
    return jsonwebtoken.sign(data, ACCESS_TOKEN_SECRET, config);
  }

  public verifyRidToken(token: string) {
    try {
      // TODO: Change access token secret to new rid token secret
      return jsonwebtoken.verify(token, ACCESS_TOKEN_SECRET) as {
        rid: string;
      };
    } catch (err) {
      throw new ServerError(401, UNAUTHORIZED_MSG);
    }
  }
}

export default new JWTService();
