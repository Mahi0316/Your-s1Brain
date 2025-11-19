import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";

export const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (await Student.findOne({ email }))
      return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name,
      email,
      password: hashed,
    });

    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET
    );

    res.json({
      token,
      user: student,
      role: "student"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ message: "Invalid email" });

    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET
    );

    res.json({
      token,
      user: student,
      role: "student"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
