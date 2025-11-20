import express from "express";
import {
  registerTeacher,
  loginTeacher,
  getStudentsOfTeacher,
  getTeacherResults
} from "../controllers/teacherController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerTeacher);
router.post("/login", loginTeacher);

router.get("/students", protect, getStudentsOfTeacher);
router.get("/results/all", protect, getTeacherResults);


export default router;
