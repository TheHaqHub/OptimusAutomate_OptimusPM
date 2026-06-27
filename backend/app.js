import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import boardRoutes from "./routes/board.routes.js";
import listRoutes from "./routes/list.routes.js";
import cardRoutes from "./routes/card.routes.js";
import userRoutes from "./routes/user.routes.js";
import commentRoutes from "./routes/comment.routes.js";

const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5175',
    'https://optimus-automate-optimus-pm.vercel.app'  // ← yeh add karo
  ],
  credentials: true
}))
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "OptimusPM API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/lists", listRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);  // ← sirf yeh ek

app.use(notFound);
app.use(errorHandler);

export default app;