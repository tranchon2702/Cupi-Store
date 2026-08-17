import { defineHandler } from "h3";
import type { LedService } from "../../../../src/data/led-services";
import { listRecords } from "../../../utils/records";

export default defineHandler(() =>
  listRecords<LedService & { createdAt?: Date; updatedAt?: Date }>("led_services"),
);
