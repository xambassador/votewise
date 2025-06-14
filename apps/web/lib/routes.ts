export const routes = {
  auth: {
    signIn: () => "/auth/signin",
    signUp: () => "/auth/signup",
    verify: () => "/auth/verify",
    forgot: () => "/auth/forgot-password",
    resetPassword: () => "/auth/reset-password",
    logout: (prop?: { redirect?: string }) => {
      if (prop && prop.redirect) {
        return `/auth/logout?redirect=${encodeURIComponent(prop.redirect)}`;
      }
      return "/auth/logout";
    },
    verify2FA: () => "/factors/verify"
  },
  onboard: {
    root: () => "/onboard",
    step1: () => "/onboard/what-should-we-call",
    step2: () => "/onboard/tell-us-about-you",
    step3: () => "/onboard/your-photos-shine",
    step4: () => "/onboard/your-profile-stands-out",
    step5: () => "/onboard/connect-your-socials",
    step6: () => "/onboard/pick-topics",
    step7: () => "/onboard/secure-your-account"
  },
  app: { root: () => "/" },
  feeds: {
    root: () => "/feeds",
    view: (id: string) => `/feeds/${id}`
  },
  user: {
    profile: (id: string) => `/profile/${id}`
  }
};
