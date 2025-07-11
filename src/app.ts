import express from "express";
import { startServer } from "./server";

const app = express();

startServer(app)

export default app;
