import express from "express";
import { startServer } from "./server";
import { initializeGlobalMiddleware } from "./middleware/globals.middleware";

const app = express();

initializeGlobalMiddleware(app);

startServer(app);

export default app;
