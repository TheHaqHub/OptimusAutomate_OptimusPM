import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";
import Card from "../models/Card.js";
import Comment from "../models/Comment.js";
import Board from "../models/Board.js";
import List from "../models/List.js";

const checkBoardAccess = async (boardId, userId) => {
  const board = await Board.findById(boardId);
  if (!board) return null;
  const isMember =
    board.owner.toString() === userId.toString() ||
    board.members.some((m) => m.user.toString() === userId.toString());
  return isMember ? board : null;
};

// POST /api/cards
export const createCard = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { title, listId, boardId, description, priority, dueDate, assignedTo } = req.body;

  const board = await checkBoardAccess(boardId, req.user._id);
  if (!board) {
    res.status(403);
    throw new Error("Board not found or not authorized");
  }

  const list = await List.findById(listId);
  if (!list) {
    res.status(404);
    throw new Error("List not found");
  }

  const lastCard = await Card.findOne({ list: listId }).sort({ position: -1 });
  const position = lastCard ? lastCard.position + 1 : 0;

  const card = await Card.create({
    title,
    description: description || "",
    board: boardId,
    list: listId,
    priority: priority || "medium",
    dueDate: dueDate || null,
    assignedTo: assignedTo || null,
    position,
  });

  await card.populate("assignedTo", "name avatarUrl");

  res.status(201).json({
    success: true,
    message: "Card created successfully",
    data: { card },
  });
});

// GET /api/cards/:id
export const getCardById = asyncHandler(async (req, res) => {
  const card = await Card.findById(req.params.id)
    .populate("assignedTo", "name avatarUrl")
    .populate("list", "title")
    .populate("board", "title");

  if (!card) {
    res.status(404);
    throw new Error("Card not found");
  }

  const board = await checkBoardAccess(card.board._id, req.user._id);
  if (!board) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const comments = await Comment.find({ card: card._id })
    .populate("author", "name avatarUrl")
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    message: "Card fetched successfully",
    data: { card, comments },
  });
});

// PUT /api/cards/:id
export const updateCard = asyncHandler(async (req, res) => {
  const card = await Card.findById(req.params.id);
  if (!card) {
    res.status(404);
    throw new Error("Card not found");
  }

  const board = await checkBoardAccess(card.board, req.user._id);
  if (!board) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const { title, description, listId, priority, dueDate, assignedTo, position } = req.body;

  if (title) card.title = title;
  if (description !== undefined) card.description = description;
  if (listId) card.list = listId;
  if (priority) card.priority = priority;
  if (dueDate !== undefined) card.dueDate = dueDate;
  if (assignedTo !== undefined) card.assignedTo = assignedTo;
  if (position !== undefined) card.position = position;

  await card.save();
  await card.populate("assignedTo", "name avatarUrl");

  res.status(200).json({
    success: true,
    message: "Card updated successfully",
    data: { card },
  });
});

// DELETE /api/cards/:id
export const deleteCard = asyncHandler(async (req, res) => {
  const card = await Card.findById(req.params.id);
  if (!card) {
    res.status(404);
    throw new Error("Card not found");
  }

  const board = await checkBoardAccess(card.board, req.user._id);
  if (!board) {
    res.status(403);
    throw new Error("Not authorized");
  }

  await Comment.deleteMany({ card: card._id });
  await card.deleteOne();

  res.status(200).json({
    success: true,
    message: "Card deleted successfully",
    data: null,
  });
});

// GET /api/cards/:id/comments
export const getComments = asyncHandler(async (req, res) => {
  const card = await Card.findById(req.params.id);
  if (!card) {
    res.status(404);
    throw new Error("Card not found");
  }

  const comments = await Comment.find({ card: req.params.id })
    .populate("author", "name avatarUrl")
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    message: "Comments fetched successfully",
    data: { comments },
  });
});

// POST /api/cards/:id/comments
export const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    res.status(400);
    throw new Error("Comment content is required");
  }

  const card = await Card.findById(req.params.id);
  if (!card) {
    res.status(404);
    throw new Error("Card not found");
  }

  const board = await checkBoardAccess(card.board, req.user._id);
  if (!board) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const comment = await Comment.create({
    card: req.params.id,
    author: req.user._id,
    content: content.trim(),
  });

  await comment.populate("author", "name avatarUrl");

  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    data: { comment },
  });
});

// DELETE /api/comments/:id
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  if (comment.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this comment");
  }

  await comment.deleteOne();

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
    data: null,
  });
});