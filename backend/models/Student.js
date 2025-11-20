import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // CLASSROOMS JOINED BY STUDENT
  classrooms: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Classroom" }
  ],
},
{ timestamps: true });

export default mongoose.model("Student", studentSchema);
