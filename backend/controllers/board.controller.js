import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";
import Board from "../models/Board.js";
import List from "../models/List.js";
import Card from "../models/Card.js";
import User from "../models/User.js";

// GET /api/boards — get all boards where user is owner or member
export const getBoards = asyncHandler(async (req, res) => {
  const boards = await Board.find({
    $or: [
      { owner: req.user._id },
      { "members.user": req.user._id },
    ],
  })
    .populate("owner", "name avatarUrl")
    .populate("members.user", "name avatarUrl")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Boards fetched successfully",
    data: { boards },
  });
});

// POST /api/boards — create board
export const createBoard = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { title, description } = req.body;

  const board = await Board.create({
    title,
    description: description || "",
    owner: req.user._id,
    members: [{ user: req.user._id, role: "owner" }],
  });

  await board.populate("owner", "name avatarUrl");
  await board.populate("members.user", "name avatarUrl");

  res.status(201).json({
    success: true,
    message: "Board created successfully",
    data: { board },
  });
});

// GET /api/boards/:id — get board with all lists and cards
export const getBoardById = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id)
    .populate("owner", "name avatarUrl")
    .populate("members.user", "name avatarUrl");

  if (!board) {
    res.status(404);
    throw new Error("Board not found");
  }

  // Check access
  const isMember =
    board.owner._id.toString() === req.user._id.toString() ||
    board.members.some((m) => m.user._id.toString() === req.user._id.toString());

  if (!isMember) {
    res.status(403);
    throw new Error("Not authorized to access this board");
  }

  // Get lists with cards
  const lists = await List.find({ board: board._id }).sort({ position: 1 });

  const cards = await Card.find({ board: board._id })
    .populate("assignedTo", "name avatarUrl")
    .sort({ position: 1 });

  // Attach cards to their lists
  const listsWithCards = lists.map((list) => ({
    ...list.toObject(),
    cards: cards.filter((c) => c.list.toString() === list._id.toString()),
  }));

  res.status(200).json({
    success: true,
    message: "Board fetched successfully",
    data: { board, lists: listsWithCards },
  });
});

// PUT /api/boards/:id — update board
export const updateBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);

  if (!board) {
    res.status(404);
    throw new Error("Board not found");
  }

  if (board.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the board owner can update it");
  }

  const { title, description } = req.body;
  if (title) board.title = title;
  if (description !== undefined) board.description = description;

  await board.save();

  res.status(200).json({
    success: true,
    message: "Board updated successfully",
    data: { board },
  });
});

// DELETE /api/boards/:id — delete board + all lists + cards
export const deleteBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);

  if (!board) {
    res.status(404);
    throw new Error("Board not found");
  }

  if (board.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the board owner can delete it");
  }

  await Card.deleteMany({ board: board._id });
  await List.deleteMany({ board: board._id });
  await board.deleteOne();

  res.status(200).json({
    success: true,
    message: "Board deleted successfully",
    data: null,
  });
});

// POST /api/boards/:id/members — add member
export const addMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body;

  const board = await Board.findById(req.params.id);
  if (!board) {
    res.status(404);
    throw new Error("Board not found");
  }

  if (board.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the board owner can add members");
  }

  const userToAdd = await User.findOne({ email });
  if (!userToAdd) {
    res.status(404);
    throw new Error("No user found with that email");
  }

  const alreadyMember = board.members.some(
    (m) => m.user.toString() === userToAdd._id.toString()
  );
  if (alreadyMember) {
    res.status(400);
    throw new Error("User is already a member of this board");
  }

  board.members.push({
    user: userToAdd._id,
    role: role || "editor",
  });

  await board.save();
  await board.populate("members.user", "name avatarUrl");

  res.status(200).json({
    success: true,
    message: "Member added successfully",
    data: { board },
  });
});