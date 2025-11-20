import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import exportRoutes from "./routes/exportRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import classroomRoutes from "./routes/classroomRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import testRoomRoutes from "./routes/testRoomRoutes.js";  // ✅ MISSING IMPORT FIXED

dotenv.config();
connectDB();

const app = express();
import cors from "cors";

app.use(cors({
  origin: "*",    // When deployed, replace * with Vercel URL
  credentials: true
}));

app.use(express.json());

// ROUTES
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/testrooms", testRoomRoutes); // ✅ CRITICAL LINE ADDED
app.use("/api/export", exportRoutes);
app.get("/", (req, res) => res.send("Your's Brain API Running ✔"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
