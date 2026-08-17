import { createError, defineHandler, readBody } from "h3";
import { requireAdmin, requireSameOrigin } from "../../../utils/auth";
import { vehicleOptionUpdateSchema } from "../../../utils/schemas";
import { renameVehicleOption } from "../../../utils/vehicle-options";

export default defineHandler(async (event) => {
  requireSameOrigin(event);
  requireAdmin(event);
  const parsed = vehicleOptionUpdateSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message });
  }
  try {
    const updated = await renameVehicleOption(parsed.data.slug, parsed.data.name);
    if (!updated) throw createError({ statusCode: 404, statusMessage: "Không tìm thấy danh mục." });
    return updated;
  } catch (error) {
    if (error && typeof error === "object" && "statusCode" in error) throw error;
    throw createError({
      statusCode: 409,
      statusMessage: error instanceof Error ? error.message : "Không thể đổi tên danh mục.",
    });
  }
});
