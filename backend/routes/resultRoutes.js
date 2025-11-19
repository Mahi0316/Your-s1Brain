import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  submitTest,
  getMyResults,
  getAllResultsForTeacher
} from "../controllers/resultController.js";

const router = express.Router();

// Student submits test
router.post("/submit", protect, submitTest);

// Teacher: all classroom results
router.get("/teacher/all", protect, getAllResultsForTeacher);

// Student: view own results
router.get("/my", protect, getMyResults);

export default router;
