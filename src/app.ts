import express from "express";
import { startServer } from "./server";
import { initializeGlobalMiddleware } from "./middleware/globals.middleware";
import router from "./routes";
import { errorHandlerMiddleware } from "@muhammadjalil8481/jobber-shared";
import { log } from "./logger";


const app = express();

initializeGlobalMiddleware(app);

startServer(app);

app.use(router);

app.use(errorHandlerMiddleware({ log, serviceName: "Users Service" }));


export default app;
