import bcrypt from "bcryptjs";
import { createError, defineHandler, readBody } from "h3";
import { createSession, requestIp, requireSameOrigin } from "../../../utils/auth";

type Attempt = { failures: number; blockedUntil: number };
const globalAttempts = globalThis as typeof globalThis & {
  __cupiLoginAttempts?: Map<string, Attempt>;
};
globalAttempts.__cupiLoginAttempts ??= new Map();

export default defineHandler(async (event) => {
  requireSameOrigin(event);
  const ip = requestIp(event);
  const attempt = globalAttempts.__cupiLoginAttempts!.get(ip);
  if (attempt && attempt.blockedUntil > Date.now()) {
    throw createError({ statusCode: 429, statusMessage: "Thử lại sau ít phút." });
  }

  const body = (await readBody<{ username?: string; password?: string }>(event)) || {};
  const expectedUsername = process.env.ADMIN_USERNAME || "admin";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!passwordHash || passwordHash === "PASTE_BCRYPT_HASH_HERE") {
    throw createError({ statusCode: 503, statusMessage: "Tài khoản admin chưa được cấu hình." });
  }

  const usernameMatches = body.username === expectedUsername;
  const passwordMatches = body.password ? await bcrypt.compare(body.password, passwordHash) : false;
  if (!usernameMatches || !passwordMatches) {
    const failures = (attempt?.failures || 0) + 1;
    globalAttempts.__cupiLoginAttempts!.set(ip, {
      failures,
      blockedUntil: failures >= 5 ? Date.now() + 15 * 60 * 1000 : 0,
    });
    throw createError({
      statusCode: 401,
      statusMessage: "Tên đăng nhập hoặc mật khẩu không đúng.",
    });
  }

  globalAttempts.__cupiLoginAttempts!.delete(ip);
  createSession(event, expectedUsername);
  return { authenticated: true, username: expectedUsername };
});
