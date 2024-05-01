import type { GetServerSideProps, GetServerSidePropsContext } from "next";

import { getOnboardingStatus } from "server/services/onboarding";
import { revokeAccessToken } from "server/services/revokeToken";

import { clearCookies } from "./clearCookies";
import { decodeJwt } from "./decodeJwt";
import { getCookie } from "./getCookie";
import { setAuthCookies } from "./setAuthCookies";

/**
 * Decode access token
 * @param token Access token
 */
export const decodeToken = (token: string) => {
  try {
    const decoded = decodeJwt(token) as { userId: number };
    return {
      userId: decoded.userId,
      accessToken: token,
      error: null,
    };
  } catch (err: any) {
    return {
      userId: null,
      accessToken: null,
      error: err,
    };
  }
};

export const authGuard =
  (getServerSidePropsCallBack: GetServerSideProps) => async (context: GetServerSidePropsContext) => {
    const token = getCookie(context.req, "ACCESS_TOKEN");

    if (!token) {
      return {
        redirect: {
          destination: "/signin",
          permanent: false,
        },
      };
    }

    const decodedToken = decodeToken(token);

    if (decodedToken.error.message === "jwt expired") {
      const refreshToken = getCookie(context.req, "REFRESH_TOKEN");
      if (!refreshToken) {
        clearCookies(context.res);
        return {
          redirect: {
            destination: "/signin",
            permanent: false,
          },
        };
      }

      try {
        const response = await revokeAccessToken(refreshToken);
        setAuthCookies(context.res, {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });
      } catch (err: any) {
        clearCookies(context.res);
        return {
          redirect: {
            destination: "/signin",
            permanent: false,
          },
        };
      }
    }

    const onboarded = getCookie(context.req, "IS_ONBOARDED");
    if (!onboarded) {
      return {
        redirect: {
          destination: "/onboarding",
          permanent: false,
        },
      };
    }

    try {
      const isOnboarded = await getOnboardingStatus(decodedToken.accessToken as string);

      if (!isOnboarded) {
        return {
          redirect: {
            destination: "/onboarding",
            permanent: false,
          },
        };
      }
    } catch (err) {
      clearCookies(context.res);
      return {
        redirect: {
          destination: "/signin",
          permanent: false,
        },
      };
    }

    const result = await getServerSidePropsCallBack(context);
    return result;
  };
