import { Request, Response, Router } from "express";
import { log } from "./logger";
import { StatusCodes } from "http-status-codes";
import fs from "fs";
import { GatewayRequestVerification } from "@muhammadjalil8481/jobber-shared";
import { buyerRouter } from "./routes/buyer";
import { health } from "./controllers/health";
import { sellerRouter } from "./routes/seller";

const publicKey = fs.readFileSync("./public.pem", "utf-8");
const gatewayMiddleware = GatewayRequestVerification(log, publicKey);

const BUYER_BASE_PATH = "/api/v1/buyer";
const SELLER_BASE_PATH = "/api/v1/seller";

const router = Router();

router.use(BUYER_BASE_PATH, gatewayMiddleware, buyerRouter);
router.use(SELLER_BASE_PATH, gatewayMiddleware, sellerRouter);

router.get("/user-health", health);

router.use("*", (req: Request, res: Response) => {
  const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  log.error(`Gateway service error: ${url} does not exist`);
  res.status(StatusCodes.NOT_FOUND).json({
    message: "Url Not Found",
  });
});

export default router;
