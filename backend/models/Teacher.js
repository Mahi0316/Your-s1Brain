import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "teacher" }
});

const Model = mongoose.model("Teacher", teacherSchema);
export default Model;
