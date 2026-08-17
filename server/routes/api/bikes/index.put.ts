import { createError, defineHandler, readBody } from "h3";
import type { Bike } from "../../../../src/data/bikes";
import { requireAdmin, requireSameOrigin } from "../../../utils/auth";
import { upsertRecord } from "../../../utils/records";
import { bikeSchema } from "../../../utils/schemas";

export default defineHandler(async (event) => {
  requireSameOrigin(event);
  requireAdmin(event);
  const parsed = bikeSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message });
  }
  return upsertRecord(
    "bikes",
    "bike",
    parsed.data as Bike & { createdAt?: Date; updatedAt?: Date },
  );
});
