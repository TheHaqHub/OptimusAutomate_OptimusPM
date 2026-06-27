import express from "express";
import { createList, updateList, deleteList } from "../controllers/list.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.post("/", createList);
router.put("/:id", updateList);
router.delete("/:id", deleteList);

export default router;