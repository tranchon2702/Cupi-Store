import { createError, defineHandler, readBody } from "h3";
import type { LedService } from "../../../../src/data/led-services";
import { requireAdmin, requireSameOrigin } from "../../../utils/auth";
import { resetRecords } from "../../../utils/records";
import { resetLedSchema } from "../../../utils/schemas";

export default defineHandler(async (event) => {
  requireSameOrigin(event);
  requireAdmin(event);
  const parsed = resetLedSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message });
  }
  return resetRecords(
    "led_services",
    "led",
    parsed.data.items as Array<LedService & { createdAt?: Date; updatedAt?: Date }>,
  );
});
