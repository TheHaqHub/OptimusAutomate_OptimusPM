import { body } from "express-validator";

export const boardValidator = [
  body("title").trim().notEmpty().withMessage("Board title is required"),
  body("description").optional().trim(),
];