import { createError, defineHandler, readBody } from "h3";
import type { LedService } from "../../../../src/data/led-services";
import { requireAdmin, requireSameOrigin } from "../../../utils/auth";
import { upsertRecord } from "../../../utils/records";
import { ledServiceSchema } from "../../../utils/schemas";

export default defineHandler(async (event) => {
  requireSameOrigin(event);
  requireAdmin(event);
  const parsed = ledServiceSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message });
  }
  return upsertRecord(
    "led_services",
    "led",
    parsed.data as LedService & { createdAt?: Date; updatedAt?: Date },
  );
});
