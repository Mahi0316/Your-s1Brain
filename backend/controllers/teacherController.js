import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import TestRoom from "../models/TestRoom.js";
import Test from "../models/Test.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Result from "../models/Result.js";

import Classroom from "../models/Classroom.js";
// ---------------------- REGISTER TEACHER -----------------------
export const registerTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await Teacher.findOne({ email });
    if (exists) return res.status(400).json({ message: "Teacher already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const teacher = await Teacher.create({
      name,
      email,
      password: hashed,
    });

    res.json({ message: "Teacher registered", teacher });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------- LOGIN TEACHER -----------------------
export const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    const teacher = await Teacher.findOne({ email });
    if (!teacher)
      return res.status(404).json({ message: "Teacher not found" });

    const match = await bcrypt.compare(password, teacher.password);
    if (!match)
      return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign(
      { id: teacher._id, role: "teacher" },
      process.env.JWT_SECRET
    );

    res.json({
      token,
      user: teacher,
      role: "teacher",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------- GET STUDENTS OF TEACHER -----------------------
export const getStudentsOfTeacher = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // 1️⃣ Get all classrooms created by this teacher
    const classrooms = await Classroom.find({ teacherId });

    // 2️⃣ Collect student IDs from those classrooms
    const allStudentIds = classrooms.flatMap(c => c.students);

    // 3️⃣ Fetch actual student objects
    const students = await Student.find({ _id: { $in: allStudentIds } });

    res.json(students);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ---------------------- GET TEACHER RESULTS -----------------------
// ---------------------- GET TEACHER RESULTS -----------------------
export const getTeacherResults = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Get all classrooms of this teacher
    const classrooms = await Classroom.find({ teacherId });
    const classroomIds = classrooms.map(c => c._id);

    // Fetch ALL results for ALL classrooms owned by this teacher
    const results = await Result.find({ classroomId: { $in: classroomIds } })
      .populate("studentId", "name email")
      .populate("testId", "title");

    res.json(results);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load teacher results" });
  }
};

