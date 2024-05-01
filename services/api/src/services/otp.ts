import * as otp from "otplib";

export class OTP {
  /**
   * Generate TOTP token.
   *
   * @param secret Secret key for generating TOTP
   * @returns TOTP token
   */
  public totp(secret: string) {
    const token = otp.totp.generate(secret);
    return token;
  }

  public verifyTOTP(secret: string, token: string) {
    return otp.totp.verify({ secret, token });
  }
}
