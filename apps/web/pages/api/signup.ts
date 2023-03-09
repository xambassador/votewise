import axios from "axios";
import type { AxiosResponse } from "axios";
import cookie from "cookie";

import type { NextApiRequest, NextApiResponse } from "next";

import { AUTH_ROUTE_V1, REGISTER_USER_V1 } from "@votewise/lib";
import type { RegisterUserPayload } from "@votewise/types";

const baseUrl = `${process.env.BACKEND_URL}`;
const apiEndpoint = `${baseUrl}${AUTH_ROUTE_V1}${REGISTER_USER_V1}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body as RegisterUserPayload;

  try {
    const response = await axios.post<
      RegisterUserPayload,
      AxiosResponse<{
        message: string;
        error: null;
        data: { accessToken: string; resfreshToken: string };
        success: boolean;
      }>
    >(apiEndpoint, {
      email,
      password,
    });
    cookie.serialize("votewise-utoken", response.data.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(response.status).json(response.data);
  } catch (err: any) {
    const status = err.response.status || 500;
    const data = err.response.data || { message: "Something went wrong" };
    return res.status(status).json(data);
  }
}
