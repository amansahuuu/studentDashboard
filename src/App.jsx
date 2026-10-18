import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "./Firebase";
import "./App.css";
import StudentInfo from "./StudentInfo";
import DailyLogView from "./DailyLogView";
import Marks from "./Marks";
import CommonHomework from "./CommonHomework";

const PARENT_PASSWORD_HASH =
  "154e132c358ac67fd8138cfa23b6605d4fdf7f293857f0636006fc61ffb3e18c";

function App({ currentUser }) {
  const [result, setResult] = useState(null);
  const [viewMode, setViewMode] = useState("child");
  const [showParentPrompt, setShowParentPrompt] = useState(false);
  const [parentPassword, setParentPassword] = useState("");
  const [parentPasswordError, setParentPasswordError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchStudentData() {
      try {
        const studentDocRef = doc(db, "students", currentUser.uid);
        const marksCollectionRef = collection(
          db,
          "students",
          currentUser.uid,
          "marks",
        );
        const [studentDocSnap, marksSnapshot] = await Promise.all([
          getDoc(studentDocRef),
          getDocs(marksCollectionRef),
        ]);

        if (!cancelled) {
          setResult({
            uid: currentUser.uid,
            student: studentDocSnap.exists() ? studentDocSnap.data() : null,
            marks: marksSnapshot.docs.map((markDoc) => ({
              id: markDoc.id,
              ...markDoc.data(),
            })),
            error: null,
          });
        }
      } catch (error) {
        console.error("Error fetching Firestore data:", error);
        if (!cancelled) {
          setResult({
            uid: currentUser.uid,
            student: null,
            marks: [],
            error: "Failed to load student records. Please try again later.",
          });
        }
      }
    }

    fetchStudentData();
    return () => {
      cancelled = true;
    };
  }, [currentUser.uid]);

  if (!result || result.uid !== currentUser.uid) {
    return <p className="loading-txt">Loading your records...</p>;
  }

  if (result.error) {
    return <p className="error-txt">{result.error}</p>;
  }

  if (!result.student) {
    return <p className="empty-state">No student record found for this account.</p>;
  }

  const { student, marks } = result;

  async function handleParentUnlock(event) {
    event.preventDefault();
    setParentPasswordError("");

    try {
      const passwordBytes = new TextEncoder().encode(parentPassword);
      const digest = await window.crypto.subtle.digest("SHA-256", passwordBytes);
      const passwordHash = Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join("");

      if (passwordHash !== PARENT_PASSWORD_HASH) {
        setParentPasswordError("Incorrect password. Please try again.");
        return;
      }

      setViewMode("parent");
      setShowParentPrompt(false);
      setParentPassword("");
    } catch (error) {
      console.error("Could not verify parent-view password:", error);
      setParentPasswordError(
        "Password verification failed. Please use a secure browser connection and try again.",
      );
    }
  }

  return (
    <main className="dashboard-container">
      <header className="dashboard-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          <div>
            <p className="eyebrow">STUDENT DASHBOARD</p>
            <h1>Learning, together</h1>
          </div>
        </div>
        <div className="view-switch" role="group" aria-label="Choose dashboard view">
          <button
            type="button"
            className={viewMode === "parent" ? "active" : ""}
            aria-pressed={viewMode === "parent"}
            onClick={() => {
              if (viewMode !== "parent") {
                setShowParentPrompt(true);
                setParentPasswordError("");
              }
            }}
          >
            Parent view
          </button>
          <button
            type="button"
            className={viewMode === "child" ? "active" : ""}
            aria-pressed={viewMode === "child"}
            onClick={() => setViewMode("child")}
          >
            Child view
          </button>
        </div>
      </header>

      {showParentPrompt && (
        <div
          className="parent-prompt-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowParentPrompt(false);
              setParentPassword("");
              setParentPasswordError("");
            }
          }}
        >
          <form
            className="parent-prompt"
            onSubmit={handleParentUnlock}
            aria-labelledby="parent-prompt-title"
          >
            <h2 id="parent-prompt-title">Parent view</h2>
            <p>Enter the parent password to continue.</p>
            <label htmlFor="parent-password">Password</label>
            <input
              id="parent-password"
              type="password"
              autoComplete="current-password"
              value={parentPassword}
              onChange={(event) => setParentPassword(event.target.value)}
              autoFocus
              required
            />
            {parentPasswordError && (
              <p className="parent-prompt-error" role="alert">
                {parentPasswordError}
              </p>
            )}
            <div className="parent-prompt-actions">
              <button
                type="button"
                className="parent-prompt-cancel"
                onClick={() => {
                  setShowParentPrompt(false);
                  setParentPassword("");
                  setParentPasswordError("");
                }}
              >
                Cancel
              </button>
              <button type="submit" className="parent-prompt-submit">
                Unlock parent view
              </button>
            </div>
          </form>
        </div>
      )}

      {viewMode === "parent" ? (
        <StudentInfo currentUser={currentUser} student={student} />
      ) : (
        <section className="child-welcome">
          <p className="eyebrow">YOUR LEARNING SPACE</p>
          <h2>Welcome back, {student.name || "student"}!</h2>
          <p>Here are your homework and test results.</p>
        </section>
      )}

      <CommonHomework student={student} viewMode={viewMode} />

      <div className="dashboard-content">
        <DailyLogView uid={currentUser.uid} viewMode={viewMode} />
        <Marks marks={marks} />
      </div>

      <footer className="dashboard-footer">
        Made for steady progress, one day at a time.
      </footer>
    </main>
  );
}

export default App;
