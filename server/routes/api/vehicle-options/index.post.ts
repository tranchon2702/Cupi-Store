import { createError, defineHandler, readBody } from "h3";
import { requireAdmin, requireSameOrigin } from "../../../utils/auth";
import { vehicleOptionCreateSchema } from "../../../utils/schemas";
import { addVehicleOption } from "../../../utils/vehicle-options";

export default defineHandler(async (event) => {
  requireSameOrigin(event);
  requireAdmin(event);
  const parsed = vehicleOptionCreateSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message });
  }
  try {
    return await addVehicleOption(parsed.data.kind, parsed.data.name);
  } catch (error) {
    throw createError({
      statusCode: 409,
      statusMessage: error instanceof Error ? error.message : "Không thể thêm danh mục.",
    });
  }
});
