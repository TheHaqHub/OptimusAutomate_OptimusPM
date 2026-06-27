import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";
import List from "../models/List.js";
import Card from "../models/Card.js";
import Board from "../models/Board.js";

const checkBoardAccess = async (boardId, userId) => {
  const board = await Board.findById(boardId);
  if (!board) return null;
  const isMember =
    board.owner.toString() === userId.toString() ||
    board.members.some((m) => m.user.toString() === userId.toString());
  return isMember ? board : null;
};

// POST /api/lists
export const createList = asyncHandler(async (req, res) => {
  const { title, boardId } = req.body;

  if (!title || !boardId) {
    res.status(400);
    throw new Error("Title and boardId are required");
  }

  const board = await checkBoardAccess(boardId, req.user._id);
  if (!board) {
    res.status(403);
    throw new Error("Board not found or not authorized");
  }

  // Set position to end of list
  const lastList = await List.findOne({ board: boardId }).sort({ position: -1 });
  const position = lastList ? lastList.position + 1 : 0;

  const list = await List.create({ title, board: boardId, position });

  res.status(201).json({
    success: true,
    message: "List created successfully",
    data: { list },
  });
});

// PUT /api/lists/:id
export const updateList = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) {
    res.status(404);
    throw new Error("List not found");
  }

  const board = await checkBoardAccess(list.board, req.user._id);
  if (!board) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const { title, position } = req.body;
  if (title) list.title = title;
  if (position !== undefined) list.position = position;

  await list.save();

  res.status(200).json({
    success: true,
    message: "List updated successfully",
    data: { list },
  });
});

// DELETE /api/lists/:id
export const deleteList = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) {
    res.status(404);
    throw new Error("List not found");
  }

  const board = await checkBoardAccess(list.board, req.user._id);
  if (!board) {
    res.status(403);
    throw new Error("Not authorized");
  }

  await Card.deleteMany({ list: list._id });
  await list.deleteOne();

  res.status(200).json({
    success: true,
    message: "List deleted successfully",
    data: null,
  });
});