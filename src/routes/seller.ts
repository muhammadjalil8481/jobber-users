import { seller as createSeller } from "@users/controllers/seller/create";
import { id, random, username } from "@users/controllers/seller/get";
import { seller as updateSeller } from "@users/controllers/seller/update";
import express, { Router } from "express";

const router: Router = express.Router();

router.get('/id/:sellerId', id);
router.get('/username/:username', username);
router.get('/random/:size', random);
router.post('/create', createSeller);
router.put('/:sellerId', updateSeller);
// router.put('/seed/:count', seed);

export { router as sellerRouter };
