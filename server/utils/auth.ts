import { createHmac, timingSafeEqual } from "node:crypto";
import type { H3Event } from "h3";
import {
  createError,
  deleteCookie,
  getCookie,
  getHeader,
  getRequestIP,
  getRequestURL,
  setCookie,
} from "h3";

const COOKIE_NAME = "cupi_admin_session";

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET phải có ít nhất 32 ký tự.");
  return secret;
}

function signature(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createSession(event: H3Event, username: string) {
  const ttlHours = Math.min(24, Math.max(1, Number(process.env.SESSION_TTL_HOURS || 8)));
  const expires = Date.now() + ttlHours * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ username, expires })).toString("base64url");
  setCookie(event, COOKIE_NAME, `${payload}.${signature(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && process.env.SESSION_COOKIE_SECURE !== "false",
    sameSite: "strict",
    path: "/",
    maxAge: ttlHours * 60 * 60,
  });
}

export function clearSession(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: "/" });
}

export function getAdminSession(event: H3Event) {
  const token = getCookie(event, COOKIE_NAME);
  if (!token) return null;
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature || !safeEqual(signature(payload), suppliedSignature))
    return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      username?: string;
      expires?: number;
    };
    if (!parsed.username || !parsed.expires || parsed.expires <= Date.now()) return null;
    return { username: parsed.username, expires: parsed.expires };
  } catch {
    return null;
  }
}

export function requireAdmin(event: H3Event) {
  const session = getAdminSession(event);
  if (!session) throw createError({ statusCode: 401, statusMessage: "Vui lòng đăng nhập admin." });
  return session;
}

export function requireSameOrigin(event: H3Event) {
  const origin = getHeader(event, "origin");
  if (!origin) throw createError({ statusCode: 403, statusMessage: "Thiếu Origin hợp lệ." });
  const expectedHost = getRequestURL(event).host;
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    throw createError({ statusCode: 403, statusMessage: "Origin không hợp lệ." });
  }
  if (originHost !== expectedHost) {
    throw createError({ statusCode: 403, statusMessage: "Yêu cầu khác nguồn bị từ chối." });
  }
}

export function requestIp(event: H3Event) {
  return getRequestIP(event, { xForwardedFor: true }) || "unknown";
}
