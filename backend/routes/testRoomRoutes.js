// backend/routes/testRoomRoutes.js

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  joinRoom,
  getMyRooms,
  getRoomById,
  addTestToRoom,
  getFullTest
} from "../controllers/testRoomController.js";

const router = express.Router();

// Student joins classroom
router.post("/join", protect, joinRoom);

// Student → get classrooms joined
router.get("/my", protect, getMyRooms);

// Teacher → add test
router.post("/add-test", protect, addTestToRoom);

// Get a single full test for attempting
router.get("/get-test/:testId", protect, getFullTest);

// Get full room info including tests
router.get("/:id", protect, getRoomById);

export default router;
