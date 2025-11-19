import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  createClassroom,
  joinClassroom,
  getTeacherClassrooms,
  getStudentClassrooms,
  getClassroomById,
  getClassroomFull,
  deleteClassroom,
} from "../controllers/classroomController.js";

import Result from "../models/Result.js";   // ✅ FIX missing import

const router = express.Router();

/* ---------------------------------
      ORDER MATTERS! (Correct)
-----------------------------------*/

// CREATE classroom
router.post("/create", protect, createClassroom);

// JOIN classroom
router.post("/join", protect, joinClassroom);

// TEACHER classrooms
router.get("/teacher", protect, getTeacherClassrooms);

// STUDENT classrooms
router.get("/student", protect, getStudentClassrooms);

// FULL classroom (students + tests + results)
router.get("/full/:id", protect, getClassroomFull);

// CLASSROOM RESULTS
router.get("/results/:classroomId", protect, async (req, res) => {
  try {
    const { classroomId } = req.params;

    const results = await Result.find({ classroomId })
      .populate("studentId")
      .populate("testId")
      .sort({ createdAt: 1 });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load classroom results" });
  }
});

// GET single classroom by ID
router.get("/:id", protect, getClassroomById);

// DELETE a classroom
router.delete("/:id", protect, deleteClassroom);

export default router;
