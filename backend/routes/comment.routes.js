import express from "express";
import { deleteComment } from "../controllers/card.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(verifyJWT);
router.delete("/:id", deleteComment);

export default router;