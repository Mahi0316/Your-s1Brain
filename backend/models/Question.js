import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  text: String,
  options: [String],
  correctIndex: Number,
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: false,
    default: "beginner"   // optional
  }
});

export default mongoose.model("Question", QuestionSchema);
