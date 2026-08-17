import { createError, defineHandler } from "h3";
import { pingMongo } from "../../utils/mongo";

export default defineHandler(async () => {
  try {
    await pingMongo();
    return { status: "ok", database: "connected" };
  } catch {
    throw createError({ statusCode: 503, statusMessage: "Database unavailable" });
  }
});
