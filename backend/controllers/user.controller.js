import asyncHandler from "express-async-handler";
import User from "../models/User.js";

export const searchUsers = asyncHandler(async (req, res) => {
  const q = req.query.q?.trim();

  if (!q || q.length < 2) {
    res.status(400);
    throw new Error("Search query must be at least 2 characters");
  }

  const users = await User.find({
    _id: { $ne: req.user._id },
    name: { $regex: q, $options: "i" },
  })
    .select("name email avatarUrl")
    .limit(10);

  res.status(200).json({
    success: true,
    message: "Users found",
    data: { users },
  });
});