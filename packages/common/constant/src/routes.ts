export const auth = {
  paths: {
    register: (base: string) => base + "/auth/register",
    verify: (base: string) => base + "/auth/verify",
    signin: (base: string) => base + "/auth/signin",
    refresh: (base: string) => base + "/auth/refresh",
    forgotPassword: (base: string) => base + "/auth/forgot-password",
    resetPassword: (base: string) => base + "/auth/reset-password",
    logout: (base: string) => base + "/auth/logout",
    factors: {
      enroll: (base: string) => base + "/auth/factors/enroll",
      challengeFactor: (base: string) => base + "/auth/factors/:factor_id/challenge",
      verifyFactor: (base: string) => base + "/auth/factors/:factor_id/verify"
    },
    emailVerificationSession: (base: string) => base + "/auth/verify/:email"
  },
  runtime: {
    register: (base: string) => base + "/auth/register",
    verify: (base: string) => base + "/auth/verify",
    signin: (base: string) => base + "/auth/signin",
    refresh: (base: string) => base + "/auth/refresh",
    forgotPassword: (base: string) => base + "/auth/forgot-password",
    resetPassword: (base: string) => base + "/auth/reset-password",
    logout: (base: string) => base + "/auth/logout",
    factors: {
      enroll: (base: string) => base + "/auth/factors/enroll",
      challengeFactor: (base: string, factorId: string) => base + `/auth/factors/${factorId}/challenge`,
      verifyFactor: (base: string, factorId: string) => base + `/auth/factors/${factorId}/verify`
    },
    emailVerificationSession: (base: string, email: string) => base + `/auth/verify/${email}`
  }
};

export const user = {
  paths: {
    sessions: (base: string) => base + "/users/sessions",
    onboard: {
      getStatus: (base: string) => base + "/me/onboard",
      update: (base: string) => base + "/me/onboard",
      getOnboardSession: (base: string) => base + "/me/onboard/session"
    },
    usernameExists: (base: string) => base + "/users/:username/exists",
    me: {
      get: (base: string) => base + "/me"
    },
    recommendations: {
      get: (base: string) => base + "/users/recommendations"
    }
  },
  runtime: {
    sessions: (base: string) => base + "/users/sessions",
    onboard: {
      getStatus: (base: string) => base + "/me/onboard",
      update: (base: string) => base + "/me/onboard",
      getOnboardSession: (base: string) => base + "/me/onboard/session"
    },
    usernameExists: (base: string, username: string) => base + `/users/${username}/exists`,
    me: {
      get: (base: string) => base + "/me"
    },
    recommendations: {
      get: (base: string) => base + "/users/recommendations"
    }
  }
};

export const topics = {
  paths: {
    all: (base: string) => base + "/topics"
  },
  runtime: {
    all: (base: string) => base + "/topics"
  }
};

export const feeds = {
  paths: {
    all: (base: string) => base + "/feeds",
    create: (base: string) => base + "/feeds"
  },
  runtime: {
    all: (base: string) => base + "/feeds",
    create: (base: string) => base + "/feeds"
  }
};

export const upload = {
  paths: {
    handshake: (base: string) => base + "/upload/handshake",
    upload: (base: string) => base + "/upload",
    status: (base: string) => base + "/upload/:token/status",
    delete: (base: string) => base + "/upload/:token",
    getAvatars: (base: string) => base + "/upload/assets/avatars",
    getBackgrounds: (base: string) => base + "/upload/assets/backgrounds"
  },
  runtime: {
    handshake: (base: string) => base + "/upload/handshake",
    upload: (base: string) => base + "/upload",
    status: (base: string, token: string) => base + `/upload/${token}/status`,
    delete: (base: string, token: string) => base + `/upload/${token}`,
    getAvatars: (base: string) => base + "/upload/assets/avatars",
    getBackgrounds: (base: string) => base + "/upload/assets/backgrounds"
  }
};
