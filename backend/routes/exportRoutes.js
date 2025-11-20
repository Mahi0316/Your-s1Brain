import express from "express";
import Result from "../models/Result.js";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";

const router = express.Router();

/* ================================
   EXPORT CSV
================================ */
router.get("/results/csv", async (req, res) => {
  try {
    const results = await Result.find()
      .populate("studentId", "name email")
      .populate("testId", "title")
      .populate("classroomId", "name");

    const data = results.map(r => ({
      student: r.studentId?.name || "Unknown",
      email: r.studentId?.email || "Unknown",
      test: r.testId?.title || "Unknown",
      classroom: r.classroomId?.name || "Unknown",
      score: r.score,
      total: r.total,
      percentage: ((r.score / r.total) * 100).toFixed(2) + "%",
      date: new Date(r.createdAt).toLocaleString()
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment("results.csv");
    return res.send(csv);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "CSV export failed" });
  }
});

/* ================================
   EXPORT PDF
================================ */
router.get("/results/pdf", async (req, res) => {
  try {
    const results = await Result.find()
      .populate("studentId", "name email")
      .populate("testId", "title")
      .populate("classroomId", "name");

    const doc = new PDFDocument({ margin: 30 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=results.pdf");

    doc.fontSize(18).text("Student Test Results", { underline: true });
    doc.moveDown(1);

    results.forEach((r, i) => {
      doc.fontSize(12).text(`Student: ${r.studentId?.name || "Unknown"}`);
      doc.text(`Email: ${r.studentId?.email || "Unknown"}`);
      doc.text(`Test: ${r.testId?.title || "Unknown"}`);
      doc.text(`Classroom: ${r.classroomId?.name || "Unknown"}`);
      doc.text(`Score: ${r.score}/${r.total}`);
      doc.text(
        `Percentage: ${((r.score / r.total) * 100).toFixed(2)}%`
      );
      doc.text(`Date: ${new Date(r.createdAt).toLocaleString()}`);
      doc.moveDown(1);

      if (i !== results.length - 1) {
        doc.moveDown(0.5).text("------------------------------");
      }
    });

    doc.end();
    doc.pipe(res);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "PDF export failed" });
  }
});

export default router;
