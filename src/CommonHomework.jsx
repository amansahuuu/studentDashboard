import { Fragment, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./Firebase";

const getGradeKey = (grade) =>
  String(grade ?? "")
    .trim()
    .toLowerCase()
    .replace(/^(grade|class)\s*/, "");

const toDate = (value) => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (value && typeof value.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
};

const formatDateTime = (date) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

const renderContentWithLinks = (content) => {
  const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const parts = content.split(urlPattern);

  return parts.map((part, index) => {
    if (!/^https?:\/\/|^www\./i.test(part)) {
      return <Fragment key={index}>{part}</Fragment>;
    }

    const trailingPunctuation = part.match(/[.,!?;:]+$/)?.[0] ?? "";
    const url = part.slice(0, part.length - trailingPunctuation.length);
    const href = /^www\./i.test(url) ? `https://${url}` : url;

    return (
      <Fragment key={index}>
        <a href={href} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
        {trailingPunctuation}
      </Fragment>
    );
  });
};

export default function CommonHomework({ student, viewMode }) {
  const gradeKey = getGradeKey(student?.grade);
  const [result, setResult] = useState({
    gradeKey: null,
    homework: [],
    loading: true,
    error: null,
  });
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    if (!gradeKey) return;

    let cancelled = false;

    async function fetchHomework() {
      try {
        const homeworkSnapshot = await getDocs(collection(db, "homeworks"));
        const homework = homeworkSnapshot.docs.flatMap((homeworkDoc) => {
          const data = homeworkDoc.data();
          const dueDate = toDate(data.dueDate);
          const assignedGrades = Array.isArray(data.gradesAssigned)
            ? data.gradesAssigned.map(getGradeKey)
            : [];

          if (!dueDate || !assignedGrades.includes(gradeKey)) {
            return [];
          }

          return [{ id: homeworkDoc.id, ...data, dueDate }];
        });

        if (!cancelled) {
          setResult({ gradeKey, homework, loading: false, error: null });
        }
      } catch (error) {
        console.error("Error fetching common homework:", error);
        if (!cancelled) {
          setResult({
            gradeKey,
            homework: [],
            loading: false,
            error: "Could not load extra homework.",
          });
        }
      }
    }

    fetchHomework();
    return () => {
      cancelled = true;
    };
  }, [gradeKey]);

  useEffect(() => {
    const timerId = window.setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => window.clearInterval(timerId);
  }, []);

  if (!gradeKey) {
    return null;
  }

  if (result.gradeKey !== gradeKey || result.loading) {
    return (
      <section className="extra-homework-card" aria-labelledby="extra-homework-title">
        <h2 id="extra-homework-title">Extra homework</h2>
        <p className="muted-text">Checking for homework...</p>
      </section>
    );
  }

  if (result.error) {
    return (
      <section className="extra-homework-card" aria-labelledby="extra-homework-title">
        <h2 id="extra-homework-title">Extra homework</h2>
        <p role="alert" className="error-txt">
          {result.error}
        </p>
      </section>
    );
  }

  const activeHomework = result.homework
    .filter((item) => item.dueDate.getTime() > currentTime)
    .sort((first, second) => first.dueDate.getTime() - second.dueDate.getTime());

  if (activeHomework.length === 0) {
    return null;
  }

  return (
    <section
      className={`extra-homework-card ${
        viewMode === "child" ? "is-child-view" : ""
      }`}
      aria-labelledby="extra-homework-title"
    >
      <div className="extra-homework-heading">
        <div>
          <p className="eyebrow">FOR YOUR GRADE</p>
          <h2 id="extra-homework-title">Extra homework</h2>
        </div>
        <span className="extra-homework-alert">
          <span className="alert-dot" aria-hidden="true" />
          New
        </span>
      </div>
      <ul className="extra-homework-list">
        {activeHomework.map((item) => (
          <li key={item.id} className="extra-homework-item">
            <h3>{item.title || "Homework"}</h3>
            {item.content && (
              <p className="extra-homework-content">
                {renderContentWithLinks(item.content)}
              </p>
            )}
            <p className="extra-homework-due">
              Due {formatDateTime(item.dueDate)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}