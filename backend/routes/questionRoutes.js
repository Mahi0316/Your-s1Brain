// backend/routes/questionRoutes.js
import Question from "../models/Question.js";

import express from "express";
import {
  createQuestion,
  getAllQuestions,
  getQuestionsByLevel,
  getQuestionsByIds
} from "../controllers/questionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { deleteQuestion } from "../controllers/questionController.js";


const router = express.Router();
router.delete("/:id", protect, deleteQuestion);

// CREATE QUESTION (teacher)
router.post("/", protect, createQuestion);

// GET ALL QUESTIONS
router.get("/", getAllQuestions);

// GET QUESTIONS BY LEVEL
router.get("/level/:level", getQuestionsByLevel);

// GET QUESTIONS BY IDS
router.post("/by-ids", getQuestionsByIds);

export default router;
