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
    step1: () => "/onboard/step-1",
    step2: () => "/onboard/step-2"
  }
};
