import { defineHandler } from "h3";
import { clearSession, requireSameOrigin } from "../../../utils/auth";

export default defineHandler((event) => {
  requireSameOrigin(event);
  clearSession(event);
  return { authenticated: false };
});
