import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";
import TestRoom from "../models/TestRoom.js";
import Test from "../models/Test.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

    const rooms = await TestRoom.find({ teacherId }).populate("students");

    const allStudents = rooms.flatMap(r => r.students);

    res.json(allStudents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------- GET TEACHER RESULTS -----------------------
export const getTeacherResults = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const rooms = await TestRoom.find({ teacherId }).populate("tests");

    const allTests = rooms.flatMap(r => r.tests);

    res.json(allTests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
