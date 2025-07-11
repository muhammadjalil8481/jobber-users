import mongoose from "mongoose";
import { log } from "./logger";
import { config } from "./config";

async function databaseConnection(): Promise<void> {
  try {
    await mongoose.connect(config.DATABASE_URL);
    log.info("Users Service database connected successfully");
  } catch (err) {
    log.error("Users Service databaseConnection() method error", err);
  }
}

export { databaseConnection };
