import { body } from "express-validator";

export const cardValidator = [
  body("title").trim().notEmpty().withMessage("Card title is required"),
  body("listId").notEmpty().withMessage("List ID is required"),
  body("boardId").notEmpty().withMessage("Board ID is required"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
];