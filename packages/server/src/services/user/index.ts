import bcrypt from "bcrypt";

import { prisma } from "@votewise/prisma";
import type { LoginPayload, RegisterUserPayload } from "@votewise/types";

import { getErrorReason } from "@/src/utils";
import { isEmail, validateLoginSchema, validateRegisterUserSchema } from "@/src/zodValidation";

class UserService {
  // Validate the request body for registering new user
  isValidRegisterPayload(user: RegisterUserPayload) {
    return validateRegisterUserSchema(user);
  }

  // Validate the request body for logging in
  isValidLoginPayload(user: LoginPayload) {
    return validateLoginSchema(user);
  }

  // Check if given user already exists or not
  async checkIfUserExists(key: string | number) {
    if (typeof key === "number") {
      // Key is user id
      try {
        const user = await prisma.user.findUnique({
          where: {
            id: key,
          },
        });
        return user;
      } catch (err) {
        throw new Error("Error while fetching user");
      }
    }
    // Key can be a username or email
    const username = key;
    const isValidEmail = isEmail(username);
    if (isValidEmail) {
      try {
        const user = await prisma.user.findUnique({
          where: {
            email: username,
          },
        });
        return user;
      } catch (err) {
        throw new Error("Error while fetching user");
      }
    }
    const user = await this.checkIfUsernameExists(username);
    return user;
  }

  // Create a new user
  async createUser(user: RegisterUserPayload) {
    const hashPassword = await bcrypt.hash(user.password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: user.email,
        password: hashPassword,
      },
    });
    return newUser;
  }

  // Check if given username is already taken or not
  async checkIfUsernameExists(username: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          username,
        },
      });
      return user;
    } catch (err) {
      const msg = getErrorReason(err) || "Error while fetching user";
      throw new Error(msg);
    }
  }

  // Check if password is correct or not
  async validatePassword(password: string, userPassword: string) {
    const isPasswordValid = await bcrypt.compare(password, userPassword);
    return isPasswordValid;
  }

  async updatePassword(password: string, userId: number) {
    const hashPassword = await bcrypt.hash(password, 10);
    try {
      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          password: hashPassword,
        },
      });
      return user;
    } catch (err) {
      throw new Error("Error while updating password");
    }
  }

  async verifyEmail(userId: number) {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        is_email_verify: true,
      },
    });
  }

  async updateLastLogin(userId: number) {
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        last_login: new Date(),
      },
    });
  }

  async getMyDetails(userId: number) {
    try {
      const data = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          username: true,
          about: true,
          cover_image: true,
          profile_image: true,
          name: true,
          email: true,
          facebook: true,
          instagram: true,
          twitter: true,
          updated_at: true,
          last_login: true,
          created_at: true,
          location: true,
          is_email_verify: true,
          gender: true,
          _count: {
            select: {
              followers: true,
              following: true,
              posts: true,
            },
          },
        },
      });
      return {
        ...data,
        followers: data?._count?.followers,
        following: data?._count?.following,
        posts: data?._count?.posts,
        _count: undefined,
      };
    } catch (err) {
      throw new Error("Error while fetching user");
    }
  }
}

export default new UserService();
