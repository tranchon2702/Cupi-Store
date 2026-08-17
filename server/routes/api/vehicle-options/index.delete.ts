import { createError, defineHandler, readBody } from "h3";
import { requireAdmin, requireSameOrigin } from "../../../utils/auth";
import { vehicleOptionDeleteSchema } from "../../../utils/schemas";
import { deleteVehicleOption } from "../../../utils/vehicle-options";

export default defineHandler(async (event) => {
  requireSameOrigin(event);
  requireAdmin(event);
  const parsed = vehicleOptionDeleteSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message });
  }
  try {
    return { deleted: await deleteVehicleOption(parsed.data.slug) };
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: error instanceof Error ? error.message : "Không thể xóa danh mục.",
    });
  }
});
