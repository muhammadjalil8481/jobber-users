import express from "express";
import { startServer } from "./server";
import { initializeGlobalMiddleware } from "./middleware/globals.middleware";
import router from "./routes";

const app = express();

initializeGlobalMiddleware(app);

startServer(app);

app.use(router);

export default app;
