import mongoose from "mongoose";

const TestSchema = new mongoose.Schema({
  classroomId: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom" },
  title: String,
  level: String,
  durationSeconds: Number,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
});

const Test = mongoose.model("Test", TestSchema);
export default Test;
