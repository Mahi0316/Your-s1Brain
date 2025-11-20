// src/components/dashboard/student/JoinClassroom.jsx

import React, { useEffect, useState } from "react";
import { Loader2, ClipboardList, GraduationCap } from "lucide-react";
import API from "../../../api/axiosConfig";

export default function JoinClassroom({ user }) {
  const [code, setCode] = useState("");
  const [joined, setJoined] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Correct useEffect (ONLY load joined classrooms)
  useEffect(() => {
    if (!user?._id) return;
    fetchJoined();
  }, [user?._id]);

  // ----------------------------------------------------
  // FETCH JOINED CLASSROOMS
  // ----------------------------------------------------
  async function fetchJoined() {
    try {
      setLoading(true);
      const res = await API.get("/classrooms/student");
      setJoined(res.data || []);
    } catch (e) {
      console.error("Error loading joined classrooms", e);
      setJoined([]);
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------
  // JOIN CLASSROOM BY CODE
  // ----------------------------------------------------
  async function joinByCode(e) {
    e.preventDefault();
    if (!code.trim()) return alert("Enter a code!");

    try {
      setLoading(true);
      await API.post("/classrooms/join", { code });

      alert("Joined classroom!");
      setCode("");
      fetchJoined();
    } catch (err) {
      alert("Join failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // ----------------------------------------------------
  // OPEN CLASSROOM → LOAD TESTS
  // ----------------------------------------------------
  async function openClassroom(c) {
    setSelectedClassroom(c);

    try {
      const res = await API.get(`/classrooms/${c._id}`);
      setTests(res.data.tests || []);
    } catch (e) {
      console.error("Failed to load tests");
      setTests([]);
    }
  }

  // ----------------------------------------------------
  // START TEST
  // ----------------------------------------------------
  async function startTest(test) {
    if (!test?._id) {
      alert("Test ID missing!");
      return;
    }

    try {
      const res = await API.get(`/testrooms/get-test/${test._id}`);

      sessionStorage.setItem(
        "assigned_test",
        JSON.stringify({
          testId: test._id,
          classroomId: selectedClassroom._id,
          title: test.title,
          duration: test.durationSeconds,
          questions: res.data.questions,
        })
      );

      window.location.href = "/student-test";
    } catch (err) {
      alert("Unable to load test questions.");
    }
  }

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------
  return (
    <div className="bg-white p-6 mt-6 rounded-2xl shadow">
      <h3 className="text-lg font-bold flex gap-2 items-center">
        <GraduationCap /> Join Classroom
      </h3>

      <form onSubmit={joinByCode} className="flex gap-2 mt-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border p-2 flex-1 rounded"
          placeholder="Classroom code"
        />
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" /> : "Join"}
        </button>
      </form>

      <div className="mt-4">
        <h4 className="font-semibold flex items-center gap-2">
          <ClipboardList className="w-4" /> My Classrooms ({joined.length})
        </h4>

        {joined.map((c) => (
          <div
            key={c._id}
            className="border p-3 rounded mt-2 flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-xs text-gray-500">Code: {c.code}</div>
            </div>

            <button
              className="text-indigo-600"
              onClick={() => openClassroom(c)}
            >
              Open
            </button>
          </div>
        ))}
      </div>

      {selectedClassroom && (
        <div className="mt-6 border-t pt-4">
          <h4 className="text-lg font-bold text-indigo-700">
            Tests in {selectedClassroom.name}
          </h4>

          {tests.map((t) => (
            <div
              key={t._id}
              className="border p-3 rounded mt-2 flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-gray-500">
                  Duration: {t.durationSeconds}s
                </div>
              </div>

              <button
                onClick={() => startTest(t)}
                className="bg-indigo-600 text-white px-3 py-1 rounded"
              >
                Attempt
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
