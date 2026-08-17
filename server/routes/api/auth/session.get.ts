import { defineHandler } from "h3";
import { getAdminSession } from "../../../utils/auth";

export default defineHandler((event) => {
  const session = getAdminSession(event);
  return session
    ? { authenticated: true, username: session.username }
    : { authenticated: false, username: null };
});
