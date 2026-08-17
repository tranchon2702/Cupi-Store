import { createError, defineHandler, getRouterParam } from "h3";
import { requireAdmin, requireSameOrigin } from "../../../utils/auth";
import { deleteRecord } from "../../../utils/records";

export default defineHandler(async (event) => {
  requireSameOrigin(event);
  requireAdmin(event);
  const slug = getRouterParam(event, "slug") || "";
  if (!/^[a-z0-9-]{3,120}$/.test(slug)) {
    throw createError({ statusCode: 400, statusMessage: "Mã xe không hợp lệ." });
  }
  return { deleted: await deleteRecord("bikes", slug) };
});
