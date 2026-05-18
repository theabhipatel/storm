import type { CookieOptions, Response } from "express";

import type { Config } from "../config.js";

export const REFRESH_COOKIE = "refresh_token";
export const CSRF_COOKIE = "csrf_token";
export const REFRESH_COOKIE_PATH = "/api/auth";

function baseRefreshOptions(config: Config): CookieOptions {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: "strict",
    path: REFRESH_COOKIE_PATH,
    ...(config.cookieDomain ? { domain: config.cookieDomain } : {}),
  };
}

function baseCsrfOptions(config: Config): CookieOptions {
  return {
    httpOnly: false,
    secure: config.cookieSecure,
    sameSite: "strict",
    path: "/",
    ...(config.cookieDomain ? { domain: config.cookieDomain } : {}),
  };
}

export function setAuthCookies(
  res: Response,
  config: Config,
  refreshToken: string,
  csrfToken: string,
): void {
  const maxAgeMs = config.refreshTokenTtlSec * 1000;
  res.cookie(REFRESH_COOKIE, refreshToken, { ...baseRefreshOptions(config), maxAge: maxAgeMs });
  res.cookie(CSRF_COOKIE, csrfToken, { ...baseCsrfOptions(config), maxAge: maxAgeMs });
}

export function clearAuthCookies(res: Response, config: Config): void {
  res.clearCookie(REFRESH_COOKIE, baseRefreshOptions(config));
  res.clearCookie(CSRF_COOKIE, baseCsrfOptions(config));
}
