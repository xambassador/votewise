export const auth = {
  paths: {
    /** Register a new user */
    register: (base: string) => base + "/auth/register",
    /** Verify user email  */
    verify: (base: string) => base + "/auth/verify",
    /** Sign in an existing user */
    signin: (base: string) => base + "/auth/signin",
    /** Refresh user session */
    refresh: (base: string) => base + "/auth/refresh",
    /** Request a password reset */
    forgotPassword: (base: string) => base + "/auth/forgot-password",
    /** Reset user password */
    resetPassword: (base: string) => base + "/auth/reset-password",
    /** Log out the user */
    logout: (base: string) => base + "/auth/logout",
    factors: {
      /** Enroll a new factor for multi-factor authentication */
      enroll: (base: string) => base + "/auth/factors/enroll",
      /** Challenge an existing factor for multi-factor authentication */
      challengeFactor: (base: string) => base + "/auth/factors/:factor_id/challenge",
      /** Verify an existing factor for multi-factor authentication */
      verifyFactor: (base: string) => base + "/auth/factors/:factor_id/verify"
    },
    /** Get an active email verification session */
    emailVerificationSession: (base: string) => base + "/auth/verify/:email"
  },
  runtime: {
    /** Register a new user */
    register: (base: string) => base + "/auth/register",
    /** Verify user email  */
    verify: (base: string) => base + "/auth/verify",
    /** Sign in an existing user */
    signin: (base: string) => base + "/auth/signin",
    /** Refresh user session */
    refresh: (base: string) => base + "/auth/refresh",
    /** Request a password reset */
    forgotPassword: (base: string) => base + "/auth/forgot-password",
    /** Reset user password */
    resetPassword: (base: string) => base + "/auth/reset-password",
    /** Log out the user */
    logout: (base: string) => base + "/auth/logout",
    factors: {
      /** Enroll a new factor for multi-factor authentication */
      enroll: (base: string) => base + "/auth/factors/enroll",
      /** Challenge an existing factor for multi-factor authentication */
      challengeFactor: (base: string, factorId: string) => base + `/auth/factors/${factorId}/challenge`,
      /** Verify an existing factor for multi-factor authentication */
      verifyFactor: (base: string, factorId: string) => base + `/auth/factors/${factorId}/verify`
    },
    /** Get an active email verification session */
    emailVerificationSession: (base: string, email: string) => base + `/auth/verify/${email}`
  }
};

export const user = {
  paths: {
    /** List user sessions */
    sessions: (base: string) => base + "/users/sessions",
    onboard: {
      /** Get the onboarding status of the user */
      getStatus: (base: string) => base + "/me/onboard",
      /** Update the onboarding data of the user */
      update: (base: string) => base + "/me/onboard",
      /** Get the current onboarding session */
      getOnboardSession: (base: string) => base + "/me/onboard/session"
    },
    /** Check if a username already exists */
    usernameExists: (base: string) => base + "/users/:username/exists",
    me: {
      /** Get the current user's profile */
      get: (base: string) => base + "/me"
    },
    recommendations: {
      /** Get user recommendations for current user */
      get: (base: string) => base + "/users/recommendations",
      /** Get group recommendations for current user */
      getGroupRecommendations: (base: string) => base + "/users/recommendations/groups"
    }
  },
  runtime: {
    /** List user sessions */
    sessions: (base: string) => base + "/users/sessions",
    onboard: {
      /** Get the onboarding status of the user */
      getStatus: (base: string) => base + "/me/onboard",
      /** Update the onboarding data of the user */
      update: (base: string) => base + "/me/onboard",
      /** Get the current onboarding session */
      getOnboardSession: (base: string) => base + "/me/onboard/session"
    },
    /** Check if a username already exists */
    usernameExists: (base: string, username: string) => base + `/users/${username}/exists`,
    me: {
      /** Get the current user's profile */
      get: (base: string) => base + "/me"
    },
    recommendations: {
      /** Get user recommendations for current user */
      get: (base: string) => base + "/users/recommendations",
      /** Get group recommendations for current user */
      getGroupRecommendations: (base: string) => base + "/users/recommendations/groups"
    }
  }
};

export const topics = {
  paths: {
    /** Get all topics */
    all: (base: string) => base + "/topics"
  },
  runtime: {
    /** Get all topics */
    all: (base: string) => base + "/topics"
  }
};

export const feeds = {
  paths: {
    /** Get all feeds of the user */
    all: (base: string) => base + "/feeds",
    /** Get feed */
    get: (base: string) => base + "/feeds/:id",
    /** Create a new feed */
    create: (base: string) => base + "/feeds"
  },
  runtime: {
    /** Get all feeds of the user */
    all: (base: string) => base + "/feeds",
    /** Get feed */
    get: (base: string, id: string) => base + `/feeds/${id}`,
    /** Create a new feed */
    create: (base: string) => base + "/feeds"
  }
};

export const upload = {
  paths: {
    /** Create handshake for file upload */
    handshake: (base: string) => base + "/upload/handshake",
    /** Upload a file */
    upload: (base: string) => base + "/upload",
    /** Get the status of an upload */
    status: (base: string) => base + "/upload/:token/status",
    /** Delete an upload */
    delete: (base: string) => base + "/upload/:token",
    /** Get avatars */
    getAvatars: (base: string) => base + "/upload/assets/avatars",
    /** Get backgrounds */
    getBackgrounds: (base: string) => base + "/upload/assets/backgrounds"
  },
  runtime: {
    /** Create handshake for file upload */
    handshake: (base: string) => base + "/upload/handshake",
    /** Upload a file */
    upload: (base: string) => base + "/upload",
    /** Get the status of an upload */
    status: (base: string, token: string) => base + `/upload/${token}/status`,
    /** Delete an upload */
    delete: (base: string, token: string) => base + `/upload/${token}`,
    /** Get avatars */
    getAvatars: (base: string) => base + "/upload/assets/avatars",
    /** Get backgrounds */
    getBackgrounds: (base: string) => base + "/upload/assets/backgrounds"
  }
};

export const comments = {
  paths: {
    /** Get all comments for a feed */
    getAll: (base: string) => base + "/feeds/:feedId/comments",
    /** Create a new comment for a feed */
    create: (base: string) => base + "/feeds/:feedId/comments",
    /** Get replies */
    getReplies: (base: string) => base + "/feeds/:feedId/comments/:commentId/replies",
    /** Update comment */
    update: (base: string) => base + "/feeds/:feedId/comments/:commentId"
  },
  runtime: {
    /** Get all comments for a feed */
    getAll: (base: string, feedId: string) => base + `/feeds/${feedId}/comments`,
    /** Create a new comment for a feed */
    create: (base: string, feedId: string) => base + `/feeds/${feedId}/comments`,
    /** Get replies */
    getReplies: (base: string, feedId: string, commentId: string) =>
      base + `/feeds/${feedId}/comments/${commentId}/replies`,
    /** Update comment */
    update: (base: string, feedId: string, commentId: string) => base + `/feeds/${feedId}/comments/${commentId}`
  }
};

export const follow = {
  paths: {
    /** Follow a user */
    followUser: (base: string) => base + "/follow/user/:id",
    /** Unfollow a user */
    unfollowUser: (base: string) => base + "/follow/user/:id"
  },
  runtime: {
    /** Follow a user */
    followUser: (base: string, username: string) => base + `/follow/user/${username}`,
    /** Unfollow a user */
    unfollowUser: (base: string, username: string) => base + `/follow/user/${username}`
  }
};

export const groups = {
  paths: {
    /** Get all groups */
    all: (base: string) => base + "/groups",
    /** Get current user groups */
    myGroups: (base: string) => base + "/me/groups"
  },
  runtime: {
    /** Get all groups */
    all: (base: string) => base + "/groups",
    /** Get current user groups */
    myGroups: (base: string) => base + "/me/groups"
  }
};
