import { email, currentUsername, username } from "@users/controllers/buyer/get";
import express, { Router } from "express";

const router: Router = express.Router();

router.get("/email", email);
router.get("/username", currentUsername);
router.get("/:username", username);

export { router as buyerRouter};
