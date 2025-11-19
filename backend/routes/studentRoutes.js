import express from "express";
import { registerStudent, loginStudent } from "../controllers/studentController.js";
import { aptitudeQuestions } from "../data/aptitudeQuestions.js";
import { protect } from "../middleware/authMiddleware.js";
import Student from "../models/Student.js";
import Classroom from "../models/Classroom.js";

const router = express.Router();

// ⭐ Leave classroom
router.post("/leave-classroom", protect, async (req, res) => {
  try {
    const { classroomId } = req.body;

    if (!classroomId) {
      return res.status(400).json({ message: "Classroom ID missing" });
    }

    // Remove classroom from student's list
    await Student.findByIdAndUpdate(req.user._id, {
      $pull: { classrooms: classroomId },
    });

    // Remove student from classroom list
    await Classroom.findByIdAndUpdate(classroomId, {
      $pull: { students: req.user._id },
    });

    return res.json({ message: "Left classroom successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});




router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.get("/aptitude/:level", (req, res) => {
  const { level } = req.params;

  if (!aptitudeQuestions[level]) {
    return res.status(400).json({ message: "Invalid level" });
  }

  const qs = aptitudeQuestions[level];

  // pick random 5
  const randomFive = qs.sort(() => 0.5 - Math.random()).slice(0, 5);

  res.json(randomFive);
});
export default router;
