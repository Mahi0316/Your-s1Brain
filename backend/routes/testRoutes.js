import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createTest,
  getTestsByClassroom,
} from "../controllers/testController.js";

const router = express.Router();

// CREATE TEST
router.post("/create", protect, createTest);

// GET ALL TESTS FOR CLASSROOM
router.get("/:id", protect, getTestsByClassroom);

export default router;
