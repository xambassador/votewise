import { checkStrength } from "@votewise/ui/password-strength";

export function isPasswordStrong(password: string): boolean {
  const strength = checkStrength(password);
  const isValid =
    strength.hasLength && strength.hasLowerCase && strength.hasUpperCase && strength.hasNumber && strength.hasSpecial;
  return isValid;
}
