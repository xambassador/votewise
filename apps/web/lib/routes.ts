export const routes = {
  auth: {
    signIn: () => "/auth/signin",
    signUp: () => "/auth/signup",
    verify: () => "/auth/verify",
    forgot: () => "/auth/forgot",
    resetPassword: () => "/auth/reset-password"
  },
  onboard: {
    root: () => "/onboard",
    step1: () => "/onboard/what-should-we-call",
    step2: () => "/onboard/tell-us-about-you",
    step3: () => "/onboard/your-photos-shine",
    step4: () => "/onboard/your-profile-stands-out",
    step5: () => "/onboard/connect-your-socials"
  },
  app: {
    root: () => "/"
  }
};
