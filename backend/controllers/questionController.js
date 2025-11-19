import Question from "../models/Question.js";
export const deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------
// CREATE QUESTION
// --------------------------------------
export const createQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------
// GET ALL QUESTIONS
// --------------------------------------
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------
// GET QUESTIONS BY LEVEL
// --------------------------------------
export const getQuestionsByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const questions = await Question.find({ level });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------------------------
// GET QUESTIONS BY IDS
// --------------------------------------
export const getQuestionsByIds = async (req, res) => {
  try {
    const { ids } = req.body;
    const questions = await Question.find({ _id: { $in: ids } });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
