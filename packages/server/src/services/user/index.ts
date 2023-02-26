import bcrypt from "bcrypt";

import { prisma } from "@votewise/prisma";
import type { RegisterUserPayload, LoginPayload } from "@votewise/types";

import { validateRegisterUserSchema, validateLoginSchema, isEmail } from "../../zodValidation";

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
  async checkIfUserExists(email: string) {
    const isValidEmail = isEmail(email);
    if (isValidEmail) {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      return user;
    }
    // email is username
    const user = await this.checkIfUsernameExists(email);
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
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    return user;
  }

  // Check if password is correct or not
  async validatePassword(password: string, userPassword: string) {
    const isPasswordValid = await bcrypt.compare(password, userPassword);
    return isPasswordValid;
  }
}

export default new UserService();
