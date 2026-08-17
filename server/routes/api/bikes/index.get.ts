import { defineHandler } from "h3";
import type { Bike } from "../../../../src/data/bikes";
import { listRecords } from "../../../utils/records";

export default defineHandler(() =>
  listRecords<Bike & { createdAt?: Date; updatedAt?: Date }>("bikes"),
);
