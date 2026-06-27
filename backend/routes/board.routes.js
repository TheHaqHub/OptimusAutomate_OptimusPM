import express from "express";
import {
  getBoards, createBoard, getBoardById,
  updateBoard, deleteBoard, addMember,
} from "../controllers/board.controller.js";
import { boardValidator } from "../validators/board.validator.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.get("/", getBoards);
router.post("/", boardValidator, createBoard);
router.get("/:id", getBoardById);
router.put("/:id", updateBoard);
router.delete("/:id", deleteBoard);
router.post("/:id/members", addMember);

export default router;