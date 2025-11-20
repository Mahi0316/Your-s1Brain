// src/components/dashboard/TeacherDashboard.jsx

import React, { useEffect, useState } from "react";
import { Header } from "../layout/Header";
import ClassroomManager from "./teacher/ClassroomManager";
import QuestionManager from "./QuestionManager";
import API from "../../api/axiosConfig";

import PerformanceGraph from "./teacher/PerformanceGraph";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function TeacherDashboard({ user }) {
  const [students, setStudents] = useState([]); // student objects (joined)
  const [results, setResults] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [tab, setTab] = useState("classrooms");
  const [avgScore, setAvgScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // explicit numeric total (avoid relying on students.length alone)
  const [totalStudents, setTotalStudents] = useState(0);

  // ---------- fetch classrooms ----------
  const fetchClassrooms = async () => {
    try {
      const res = await API.get("/classrooms/teacher");
      setClassrooms(res.data || []);
      return res.data || [];
    } catch (err) {
      console.warn("Fetch classrooms failed", err);
      return [];
    }
  };

  // ---------- fetch results ----------
  const fetchResults = async () => {
    try {
      const res = await API.get("/teachers/results/all");
      const data = res.data || [];
      setResults(data);

      if (data.length > 0) {
        const avg =
          data.reduce((sum, r) => sum + (r.score / (r.total || 1)) * 100, 0) /
          data.length;
        setAvgScore(Math.round(avg));
      } else {
        setAvgScore(0);
      }

      return data;
    } catch (err) {
      console.warn("Fetch results failed", err);
      setResults([]);
      setAvgScore(0);
      return [];
    }
  };

  // ---------- fetch students (joined) ----------
  const fetchStudents = async (loadedClassrooms = []) => {
    try {
      const res = await API.get("/teachers/students");
      const allStudents = res.data || [];

      // Build a deduplicated set of student IDs from classrooms
      const classroomStudentIds = loadedClassrooms
        .flatMap((c) => c.students || [])
        .map((id) => id?.toString?.() ?? id);

      const uniqueStudentIds = [...new Set(classroomStudentIds)];

      // Filter student objects that belong to teacher's classrooms
      const joinedStudents = allStudents.filter((stu) =>
        uniqueStudentIds.includes(stu._id.toString())
      );

      setStudents(joinedStudents);
      setTotalStudents(uniqueStudentIds.length);

      return joinedStudents;
    } catch (err) {
      console.warn("Fetch students failed", err);
      setStudents([]);
      setTotalStudents(0);
      return [];
    }
  };

  // ---------- load in correct order ----------
  useEffect(() => {
    if (!user?._id) return;

    const load = async () => {
      setLoading(true);

      // 1) load classrooms first
      const cls = await fetchClassrooms();

      // 2) load results next (so averages will be calculated)
      await fetchResults();

      // 3) load students last using the loaded classrooms
      await fetchStudents(cls);

      setLoading(false);
    };

    load();
  }, [user?._id]);

  // helper: student results
  const getStudentResults = (id) =>
    results.filter((r) => r.studentId?._id === id);

  const chartData = students.map((s) => {
    const res = getStudentResults(s._id);
    const avg =
      res.length > 0
        ? Math.round(
            res.reduce((sum, r) => sum + (r.score / (r.total || 1)) * 100, 0) /
              res.length
          )
        : 0;

    return {
      name: s.name || s.email?.split("@")[0],
      avgScore: avg
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      <section className="text-center py-10 bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg mb-10">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.email?.split("@")[0]}
        </h1>
        <p className="text-sm opacity-90 mt-2">
          Manage classrooms, tests & student progress.
        </p>
      </section>

      <main className="max-w-7xl mx-auto px-6 pb-16">
        {/* TOP CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white shadow-lg rounded-2xl p-5 border-l-4 border-indigo-500">
            <p className="text-sm text-gray-500">Total Students</p>
            <h3 className="text-2xl font-bold">{totalStudents}</h3>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Tests Conducted</p>
            <h3 className="text-2xl font-bold">{results.length}</h3>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 border-l-4 border-pink-500">
            <p className="text-sm text-gray-500">Active Classrooms</p>
            <h3 className="text-2xl font-bold">{classrooms.length}</h3>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-5 border-l-4 border-emerald-500">
            <p className="text-sm text-gray-500">Average Score</p>
            <h3 className="text-2xl font-bold">{avgScore}%</h3>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <a
            href={`${import.meta.env.VITE_API_URL}/export/results/csv`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Export CSV
          </a>

          <a
            href={`${import.meta.env.VITE_API_URL}/export/results/pdf`}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Export PDF
          </a>
        </div>

        {/* TABS */}
        <div className="flex justify-center mb-6 space-x-4">
          {["classrooms", "questions", "performance"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full font-semibold ${
                tab === t
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 border"
              }`}
            >
              {t === "classrooms" && "Classrooms"}
              {t === "questions" && "Manage Questions"}
              {t === "performance" && "Student Performance"}
            </button>
          ))}
        </div>

        {/* CONTENT BOX */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* CLASSROOMS */}
          {tab === "classrooms" && <ClassroomManager teacherId={user?._id} />}

          {/* QUESTIONS */}
          {tab === "questions" && <QuestionManager />}

          {/* PERFORMANCE TAB */}
          {tab === "performance" && (
            <>
              <h2 className="text-xl font-bold mb-6">📊 Student Performance Overview</h2>

              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white p-6 rounded-2xl shadow-md border">
                  <p className="text-gray-500 text-sm">Total Attempts</p>
                  <h2 className="text-3xl font-bold mt-2">{results.length}</h2>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border">
                  <p className="text-gray-500 text-sm">Average Score</p>
                  <h2 className="text-3xl font-bold mt-2">{avgScore}%</h2>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border">
                  <p className="text-gray-500 text-sm">Best Score</p>
                  <h2 className="text-3xl font-bold mt-2">
                    {results.length > 0
                      ? Math.max(...results.map((r) => Math.round((r.score / (r.total || 1)) * 100))) + "%"
                      : "—"}
                  </h2>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border">
                  <p className="text-gray-500 text-sm">Last Test</p>
                  <h2 className="text-xl font-semibold mt-2">
                    {results.length > 0 ? new Date(results[results.length - 1].createdAt).toLocaleString() : "—"}
                  </h2>
                </div>
              </div>

              {/* STUDENT TABLE */}
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-3">Student</th>
                      <th className="p-3">Attempts</th>
                      <th className="p-3">Average %</th>
                      <th className="p-3">Last Test</th>
                      <th className="p-3">View Tests</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((s, idx) => {
                      const res = getStudentResults(s._id);

                      const avgScore =
                        res.length > 0
                          ? Math.round(res.reduce((sum, r) => sum + (r.score / (r.total || 1)) * 100, 0) / res.length)
                          : 0;

                      const last =
                        res.length > 0 ? new Date(res[res.length - 1].createdAt).toLocaleString() : "-";

                      return (
                        <React.Fragment key={s._id}>
                          <tr className="border-b">
                            <td className="p-3 font-medium">{chartData[idx]?.name || s.name || s.email?.split("@")[0]}</td>
                            <td className="p-3">{res.length}</td>
                            <td className="p-3">{avgScore}%</td>
                            <td className="p-3">{last}</td>
                            <td
                              className="p-3 text-indigo-600 cursor-pointer"
                              onClick={() =>
                                setStudents((prev) =>
                                  prev.map((x) =>
                                    x._id === s._id ? { ...x, showTests: !x.showTests } : x
                                  )
                                )
                              }
                            >
                              {s.showTests ? "Hide" : "View"}
                            </td>
                          </tr>

                          {s.showTests && (
                            <tr className="bg-gray-50 border-b">
                              <td colSpan={5} className="p-4">
                                <div className="mb-6">
                                  <PerformanceGraph results={res} />
                                </div>

                                {res.length === 0 ? (
                                  <p className="text-gray-500">No tests attempted.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {res.map((attempt) => (
                                      <div key={attempt._id} className="p-3 bg-white border rounded-xl">
                                        <div className="font-semibold">{attempt.testId?.title}</div>
                                        <div className="text-sm text-gray-600">
                                          Score: {attempt.score}/{attempt.total} ({Math.round((attempt.score / (attempt.total || 1)) * 100)}%)
                                        </div>
                                        <div className="text-xs text-gray-500">{new Date(attempt.createdAt).toLocaleString()}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
