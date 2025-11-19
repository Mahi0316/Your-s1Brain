import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
    classroomId: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom" },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },

    testTitle: String,
    studentName: String,

    score: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Result", ResultSchema);
