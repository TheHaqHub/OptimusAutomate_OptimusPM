import express from "express";
import {
  createCard, getCardById, updateCard,
  deleteCard, getComments, addComment, deleteComment,
} from "../controllers/card.controller.js";
import { cardValidator } from "../validators/card.validator.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.post("/", cardValidator, createCard);
router.get("/:id", getCardById);
router.put("/:id", updateCard);
router.delete("/:id", deleteCard);
router.get("/:id/comments", getComments);
router.post("/:id/comments", addComment);

export default router;