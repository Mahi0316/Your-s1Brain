import mongoose from "mongoose";

const classroomSchema = new mongoose.Schema({
  name: String,
  code: { type: String, unique: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  tests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Test" }], // REQUIRED
});

export default mongoose.model("Classroom", classroomSchema);
