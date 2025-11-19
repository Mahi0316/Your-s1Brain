import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "student" }
});

const Model = mongoose.model("Student", studentSchema);
export default Model;
