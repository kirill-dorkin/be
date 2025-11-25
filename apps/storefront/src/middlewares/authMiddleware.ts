import { decodeJwt } from "jose";
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from "next/server";

import { AUTH_COOKIE_OPTIONS, COOKIE_KEY } from "@/config";
import { getAuthService } from "@/services/auth";

import { type CustomMiddleware } from "./chain";

const PROTECTED_ROUTES = ["/account"];
const AUTH_COOKIE_PATH = AUTH_COOKIE_OPTIONS.path ?? "/";

export function authMiddleware(middleware: CustomMiddleware) {
  return async (
    request: NextRequest,
    event: NextFetchEvent,
    response: NextResponse,
  ) => {
    const accessToken = request.cookies.get(COOKIE_KEY.accessToken)?.value;
    const redirectToLogin = NextResponse.redirect(
      new URL("/sign-in", request.url),
    );
    let modifiedResponse: NextResponse = response;

    if (!accessToken) {
      if (
        PROTECTED_ROUTES.some((route) =>
          request.nextUrl.pathname.includes(route),
        )
      ) {
        modifiedResponse = redirectToLogin;
      }

      return middleware(request, event, modifiedResponse);
    }

    const decodedAccessToken = decodeJwt(accessToken);

    if (Date.now() < decodedAccessToken.exp! * 1000) {
      return middleware(request, event, modifiedResponse);
    }

    const refreshToken = request.cookies.get(COOKIE_KEY.refreshToken)?.value;

    if (!refreshToken) {
      modifiedResponse = redirectToLogin;
      modifiedResponse.cookies.delete(COOKIE_KEY.accessToken, {
        path: AUTH_COOKIE_PATH,
      });

      return middleware(request, event, modifiedResponse);
    }

    const authService = await getAuthService();
    const resultTokenRefresh = await authService.tokenRefresh({
      refreshToken,
    });

    if (!resultTokenRefresh.ok || !resultTokenRefresh.data.refreshToken) {
      modifiedResponse = redirectToLogin;
      modifiedResponse.cookies.delete(COOKIE_KEY.accessToken, {
        path: AUTH_COOKIE_PATH,
      });
      modifiedResponse.cookies.delete(COOKIE_KEY.refreshToken, {
        path: AUTH_COOKIE_PATH,
      });

      return middleware(request, event, modifiedResponse);
    }

    // Set the new access token (the field is named refreshToken but contains the new access token)
    modifiedResponse.cookies.set(
      COOKIE_KEY.accessToken,
      resultTokenRefresh.data.refreshToken,
      AUTH_COOKIE_OPTIONS,
    );

    return middleware(request, event, modifiedResponse);
  };
}
