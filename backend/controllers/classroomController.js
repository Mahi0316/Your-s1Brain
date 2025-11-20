// backend/controllers/classroomController.js

import Classroom from "../models/Classroom.js";
import Student from "../models/Student.js";
import Test from "../models/Test.js";
import Result from "../models/Result.js";

// ------------------------------------------------------
// CREATE CLASSROOM (TEACHER)
// ------------------------------------------------------
export const createClassroom = async (req, res) => {
  try {
    const { name, code } = req.body;

    const classroom = await Classroom.create({
      name,
      code,
      teacherId: req.user.id,
      students: [],
      tests: []
    });

    res.json(classroom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------------------------------
// STUDENT JOINS CLASSROOM
// ------------------------------------------------------
export const joinClassroom = async (req, res) => {
  try {
    const { code } = req.body;
    const studentId = req.user.id;

    const classroom = await Classroom.findOne({ code });
    if (!classroom) return res.status(404).json({ message: "Invalid code" });

    // 1️⃣ Add student to classroom
    if (!classroom.students.includes(studentId)) {
      classroom.students.push(studentId);
      await classroom.save();
    }

    // 2️⃣ Add classroom to student
    const student = await Student.findById(studentId);

    if (!student.classrooms.includes(classroom._id)) {
      student.classrooms.push(classroom._id);
      await student.save();
    }

    res.json({ message: "Joined classroom successfully", classroom });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------------------------------
// GET TEACHER CLASSROOMS
// ------------------------------------------------------
export const getTeacherClassrooms = async (req, res) => {
  try {
    const classes = await Classroom.find({ teacherId: req.user.id });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------------------------------
// GET STUDENT CLASSROOMS
// ------------------------------------------------------
export const getStudentClassrooms = async (req, res) => {
  try {
    const classes = await Classroom.find({ students: req.user.id });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------------------------------
// FIXED: GET CLASSROOM BY ID + POPULATED TESTS
// ------------------------------------------------------
export const getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate("students", "name email")
      .populate("tests"); // 🔥 THIS FIXES THE TEST ID MISSING

    if (!classroom)
      return res.status(404).json({ message: "Classroom not found" });

    res.json({
      _id: classroom._id,
      name: classroom.name,
      code: classroom.code,
      students: classroom.students,
      tests: classroom.tests, // 🔥 TESTS NOW HAVE FULL DETAILS
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------------------------------
// FULL CLASSROOM DATA (OPTIONAL FOR TEACHER PANEL)
// ------------------------------------------------------
// ------------------------------------------------------
// FULL CLASSROOM DATA (students + tests + attempts)
// ------------------------------------------------------
export const getClassroomFull = async (req, res) => {
  try {
    const id = req.params.id;

    const classroom = await Classroom.findById(id)
      .populate("students", "name email")
      .populate("tests");

    if (!classroom)
      return res.status(404).json({ message: "Classroom not found" });

    const results = await Result.find({ classroomId: id })
      .populate("studentId", "name email")
      .populate("testId", "title");

    res.json({
      classroom,
      students: classroom.students,
      tests: classroom.tests,
      results
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------
// DELETE CLASSROOM
// --------------------------------------
// DELETE CLASSROOM
export const deleteClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom)
      return res.status(404).json({ message: "Classroom not found" });

    // 1. Delete classroom
    await classroom.deleteOne();

    // 2. Remove from students list
    await Student.updateMany(
      { classrooms: classroom._id },
      { $pull: { classrooms: classroom._id } }
    );

    return res.json({ message: "Classroom deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


