import { createError, defineHandler, readBody } from "h3";
import type { Bike } from "../../../../src/data/bikes";
import { requireAdmin, requireSameOrigin } from "../../../utils/auth";
import { resetRecords } from "../../../utils/records";
import { resetBikesSchema } from "../../../utils/schemas";

export default defineHandler(async (event) => {
  requireSameOrigin(event);
  requireAdmin(event);
  const parsed = resetBikesSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message });
  }
  return resetRecords(
    "bikes",
    "bike",
    parsed.data.items as Array<Bike & { createdAt?: Date; updatedAt?: Date }>,
  );
});
