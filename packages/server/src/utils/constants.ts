export const VALIDATION_FAILED_MSG = "Validation failed";
export const INTERNAL_SERVER_ERROR_MSG = "Internal server error";
export const USER_ALREADY_EXISTS_MSG = "User already exists";
export const USER_CREATED_SUCCESSFULLY_MSG = "User created successfully";
export const USER_NOT_FOUND_MSG = "User not found";
export const INVALID_CREDENTIALS_MSG = "Invalid credentials";
export const REFRESHTOKEN_REQUIRED_MSG = "Refresh token is required";
export const INVALID_REFRESHTOKEN_MSG = "Invalid refresh token";
export const ACCESS_TOKEN_REVOKE_MSG = "Access token revoked successfully";
export const INVALID_EMAIL_MSG = "Invalid email";
export const EMAIL_SENT_MSG = "Email sent successfully";
export const EMAIL_QUEUE_MSG = "Request is queued for process. Check your mail box..";
export const UNAUTHORIZED_MSG = "Unauthorized";
export const PASSWORD_RESET_MSG = "Password reset successfully";
export const EMAIL_VERIFIED_MSG = "Email verified successfully";
export const EMAIL_ALREADY_VERIFIED_MSG = "Email already verified";
export const LOGIN_SUCCESS_MSG = "Login successful";
export const EMAIL_REQUIRED_MSG = "Email is required";
export const TOKEN_REQUIRED_MSG = "Token is required";

export const USER_ALREADY_EXISTS_RESPONSE = {
  message: USER_ALREADY_EXISTS_MSG,
  data: null,
  error: {
    message: USER_ALREADY_EXISTS_MSG,
  },
  success: false,
};

export const USER_NOT_FOUND_RESPONSE = {
  message: USER_NOT_FOUND_MSG,
  data: null,
  error: {
    message: USER_NOT_FOUND_MSG,
  },
  success: false,
};

export const INVALID_CREDENTIALS_RESPONSE = {
  message: INVALID_CREDENTIALS_MSG,
  data: null,
  error: {
    message: INVALID_CREDENTIALS_MSG,
  },
  success: false,
};

export const INVALID_REFRESHTOKEN_RESPONSE = {
  message: INVALID_REFRESHTOKEN_MSG,
  data: null,
  error: {
    message: INVALID_REFRESHTOKEN_MSG,
  },
  success: false,
};

export const UNAUTHORIZED_RESPONSE = {
  message: UNAUTHORIZED_MSG,
  data: null,
  error: {
    message: UNAUTHORIZED_MSG,
  },
  success: false,
};

export const PASSWORD_RESET_RESPONSE = {
  message: PASSWORD_RESET_MSG,
  data: {
    message: PASSWORD_RESET_MSG,
  },
  error: null,
  success: true,
};

export const EMAIL_VERIFIED_RESPONSE = {
  message: EMAIL_VERIFIED_MSG,
  data: {
    message: EMAIL_VERIFIED_MSG,
  },
  error: null,
  success: true,
};

export const EMAIL_SENT_RESPONSE = {
  message: EMAIL_SENT_MSG,
  data: {
    message: EMAIL_QUEUE_MSG,
  },
  error: null,
  success: true,
};

export const EMAIL_REQUIRED_RESPONSE = {
  message: VALIDATION_FAILED_MSG,
  data: null,
  error: {
    message: EMAIL_REQUIRED_MSG,
  },
  success: false,
};

export const INVALID_EMAIL_RESPONSE = {
  message: VALIDATION_FAILED_MSG,
  data: null,
  error: {
    message: INVALID_EMAIL_MSG,
  },
  success: false,
};

export const TOKEN_REQUIRED_RESPONSE = {
  message: VALIDATION_FAILED_MSG,
  data: null,
  error: {
    message: TOKEN_REQUIRED_MSG,
  },
  success: false,
};

export const EMAIL_ALREADY_VERIFIED_RESPONSE = {
  message: EMAIL_ALREADY_VERIFIED_MSG,
  data: null,
  error: {
    message: EMAIL_ALREADY_VERIFIED_MSG,
  },
  success: false,
};
