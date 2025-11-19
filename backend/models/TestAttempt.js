import mongoose from "mongoose";

const testAttemptSchema = new mongoose.Schema({
  testId: String,
  studentId: String,
  score: Number,
  status: String,
});

export default mongoose.model("TestAttempt", testAttemptSchema);
