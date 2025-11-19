import mongoose from "mongoose";

const TestRoomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, unique: true },

  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },

  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    }
  ],

  tests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
    }
  ]
},
{ timestamps: true }
);

export default mongoose.model("TestRoom", TestRoomSchema);
