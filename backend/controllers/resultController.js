// backend/controllers/resultController.js

import Result from "../models/Result.js";
import Test from "../models/Test.js";
import Classroom from "../models/Classroom.js";
import Student from "../models/Student.js";
export const getTeacherResults = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const results = await Result.find({ teacherId })
      .populate("studentId", "name email")
      .populate("testId", "title")
      .populate("classroomId", "name");

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/results/my
 * Student: get own results
 */
export const getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ studentId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("testId", "title durationSeconds")
      .populate("classroomId", "name");

    return res.json(results);
  } catch (err) {
    console.error("getMyResults:", err);
    return res.status(500).json({ message: err.message });
  }
};
export const getAllResultsForTeacher = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Find classrooms created by this teacher
    const classrooms = await Classroom.find({ teacherId }).select("_id");

    const classroomIds = classrooms.map((c) => c._id);

    // Get all results from these classrooms
    const results = await Result.find({
      classroomId: { $in: classroomIds }
    })
      .populate("studentId")
      .populate("testId")
      .sort({ createdAt: 1 });

    res.json(results);
  } catch (err) {
    console.error("Teacher results error", err);
    res.status(500).json({ message: "Failed to load teacher results" });
  }
};

/**
 * POST /api/results/submit
 * Body: { testId, answers }
 *
 * answers can be:
 *  - [{ questionId, selectedIndex }, ...]  (recommended)
 *  - [selectedIndex, selectedIndex, ...]   (legacy: relies on test.questions order)
 */
export const submitTest = async (req, res) => {
  try {
    const { testId, classroomId, answers } = req.body;
    const studentId = req.user.id;

    // Load test including teacherId + questions
    const test = await Test.findById(testId)
      .populate("questions")
      .populate("teacherId");  // ⭐ VERY IMPORTANT

    if (!test) return res.status(404).json({ message: "Test not found" });

    let score = 0;

    test.questions.forEach((q) => {
      const a = answers.find((x) => x.questionId == q._id.toString());
      if (a && Number(a.selectedIndex) === Number(q.correctIndex)) {
        score++;
      }
    });

    const result = await Result.create({
      studentId,
      teacherId: test.teacherId,   // ⭐ FIXED
      classroomId,                 // ⭐ MUST come from frontend
      testId,
      score,
      total: test.questions.length,
    });

    res.json({ success: true, result });
  } catch (err) {
    console.error("submitTest error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/results/teacher
 * Teacher: get results for all tests taught by this teacher
 */
export const getResultsByTeacher = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const results = await Result.find({ teacherId })
      .sort({ createdAt: -1 })
      .populate("studentId", "name email")
      .populate("testId", "title")
      .populate("classroomId", "name");

    return res.json(results);
  } catch (err) {
    console.error("getResultsByTeacher:", err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/results/classroom/:id
 * Get all results inside a classroom (teacher or admin)
 */
export const getResultsByClassroom = async (req, res) => {
  try {
    const classroomId = req.params.id;

    const results = await Result.find({ classroomId })
      .sort({ createdAt: -1 })
      .populate("studentId", "name email")
      .populate("testId", "title");

    return res.json(results);
  } catch (err) {
    console.error("getResultsByClassroom:", err);
    return res.status(500).json({ message: err.message });
  }
};
