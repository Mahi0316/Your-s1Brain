import Test from "../models/Test.js";
import Classroom from "../models/Classroom.js";
import Question from "../models/Question.js";

// ---------------------------------------
// CREATE TEST INSIDE CLASSROOM
// ---------------------------------------
export const createTest = async (req, res) => {
  try {
    const { classroomId, title, level, durationSeconds, questionIds } = req.body;

    if (!classroomId)
      return res.status(400).json({ message: "classroomId missing" });

    const classroom = await Classroom.findById(classroomId);
    if (!classroom)
      return res.status(404).json({ message: "Classroom not found" });

    // Fetch selected questions
    const questions = await Question.find({ _id: { $in: questionIds } });

    const test = await Test.create({
      classroomId,
      title,
      level,
      durationSeconds,
      questions: questions.map((q) => q._id),
    });

    // Push test reference into classroom
    classroom.tests.push(test._id);
    await classroom.save();

    res.json({ message: "Test created", test });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------
// GET ALL TESTS OF A CLASSROOM
// ---------------------------------------
export const getTestsByClassroom = async (req, res) => {
  try {
    const { id } = req.params;

    const tests = await Test.find({ classroomId: id }).populate("questions");

    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
