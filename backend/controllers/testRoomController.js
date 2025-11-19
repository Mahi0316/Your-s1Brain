import TestRoom from "../models/TestRoom.js";
import Test from "../models/Test.js";
import Question from "../models/Question.js";

// ------------------------------
// STUDENT: JOIN ROOM
// ------------------------------
export const joinRoom = async (req, res) => {
  try {
    const { code } = req.body;
    const studentId = req.user.id;

    const room = await TestRoom.findOne({ code });
    if (!room) return res.status(404).json({ message: "Invalid code" });

    if (!room.students.includes(studentId)) {
      room.students.push(studentId);
      await room.save();
    }

    res.json({ message: "Joined", room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------
// STUDENT: GET JOINED ROOMS
// ------------------------------
export const getMyRooms = async (req, res) => {
  try {
    const rooms = await TestRoom.find({ students: req.user.id });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------
// GET ROOM + ALL TESTS + QUESTIONS
// ------------------------------
export const getRoomById = async (req, res) => {
  try {
    const room = await TestRoom.findById(req.params.id)
      .populate({
        path: "tests",
        populate: {
          path: "questions",
          model: "Question",
        },
      });

    if (!room) return res.status(404).json({ message: "Room not found" });

    const transformed = {
      ...room.toObject(),
      tests: room.tests.map((t) => ({
        _id: t._id,
        title: t.title,
        durationSeconds: t.durationSeconds,
        level: t.level,
        questions: t.questions.map((q) => ({
          _id: q._id,
          q: q.text,
          opts: q.options,
          a: q.correctIndex,
        })),
      })),
    };

    res.json(transformed);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------
// TEACHER: ADD TEST TO ROOM
// ------------------------------
export const addTestToRoom = async (req, res) => {
  try {
    const { roomId, title, level, durationSeconds, questionIds } = req.body;

    const room = await TestRoom.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const questions = await Question.find({ _id: { $in: questionIds } });

    const test = await Test.create({
      roomId,
      title,
      level,
      durationSeconds,
      questions: questions.map(q => q._id),
    });

    room.tests.push(test._id);
    await room.save();

    res.json({ message: "Test created", test });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------------------
// STUDENT: GET FULL TEST WITH QUESTIONS (for “Attempt”)
// ------------------------------
// STUDENT: get full test to attempt
// STUDENT: get full test to attempt
export const getFullTest = async (req, res) => {
  try {
    const { testId } = req.params;

    if (!testId)
      return res.status(400).json({ message: "Test ID missing!" });

    const test = await Test.findById(testId).populate("questions");

    if (!test)
      return res.status(404).json({ message: "Test not found" });

    res.json({
      _id: test._id,
      title: test.title,
      durationSeconds: test.durationSeconds,
      level: test.level,
      questions: test.questions.map((q) => ({
        _id: q._id,
        q: q.text,
        opts: q.options,
        a: q.correctIndex,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



