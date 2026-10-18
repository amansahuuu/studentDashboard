import { db } from "./Firebase";
import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import GetAttendanceStats from "./GetAttendenceStats";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function DailyLogView({ uid, viewMode = "parent" }) {
  const [result, setResult] = useState({
    uid: null,
    logsByDate: null,
    loading: true,
    error: null,
  });
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchDailyLogs() {
      try {
        const dailyLogsRef = collection(db, "students", uid, "dailyLogs");
        const querySnapshot = await getDocs(dailyLogsRef);
        const logsByDate = Object.fromEntries(
          querySnapshot.docs.map((docSnap) => [
            docSnap.id,
            docSnap.data(),
          ]),
        );
        if (cancelled) return;
        setResult({
          uid,
          logsByDate,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching daily logs:", error);
        if (!cancelled) {
          setResult({ uid, logsByDate: null, loading: false, error });
        }
      }
    }

    if (uid) {
      fetchDailyLogs();
    }

    return () => {
      cancelled = true;
    };
  }, [uid]);

  const logsByDate = result.uid === uid ? result.logsByDate : null;
  const selectedDateString = selectedDate ? formatDate(selectedDate) : null;
  const dailyLog = selectedDateString
    ? logsByDate?.[selectedDateString]
    : null;

  return (
    <section
      className="dashboard-card daily-log-card"
      aria-labelledby="daily-log-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            {viewMode === "child" ? "DAILY HOMEWORK" : "ATTENDANCE & HOMEWORK"}
          </p>
          <h2 id="daily-log-title">
            {viewMode === "child" ? "Homework" : "Daily log"}
          </h2>
        </div>
      </div>
      <div className="daily-log-layout">
        <div className="calendar-panel">
          <p className="field-label">Choose a date</p>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={({ date, view }) => {
              if (view !== "month" || !logsByDate) return null;
              return logsByDate[formatDate(date)] ? "class-held" : "no-class";
            }}
          />
          {logsByDate && (
            <div className="calendar-legend" aria-label="Calendar key">
              <span><i className="legend-dot class-dot" /> Class day</span>
              <span><i className="legend-dot no-class-dot" /> No class</span>
            </div>
          )}
        </div>
        <div className="daily-report">
          {result.uid !== uid || result.loading ? (
            <p className="muted-text">Loading daily logs...</p>
          ) : result.error ? (
            <p className="error-txt">Could not load daily logs.</p>
          ) : !selectedDate ? (
            <p className="muted-text">Select a date to see its details.</p>
          ) : !dailyLog ? (
            <p className="muted-text">
              No {viewMode === "child" ? "homework" : "daily log"} found for{" "}
              {selectedDateString}.
            </p>
          ) : (
            <>
              <h3 className="report-date">{selectedDateString}</h3>
              {viewMode === "parent" && (
                <>
                  <p className="report-detail">
                    <strong>Attendance</strong>
                    <span
                      className={`attendance-badge ${
                        dailyLog.attendence === true
                          ? "is-present"
                          : dailyLog.attendence === false
                            ? "is-absent"
                            : ""
                      }`}
                    >
                      {dailyLog.attendence === true
                        ? "Present"
                        : dailyLog.attendence === false
                          ? "Absent"
                          : "No data"}
                    </span>
                  </p>
                  <div className="remarks-block">
                    <strong>Remarks</strong>
                    <p>{dailyLog.Remarks || "No remarks given."}</p>
                  </div>
                </>
              )}
              <h3 className="homework-heading">Homework assignments</h3>
              {dailyLog.homework?.length > 0 ? (
                <ul className="homework-list">
                  {dailyLog.homework.map((hw, index) => (
                    <li key={`${hw.subject}-${index}`} className="homework-item">
                      <div>
                        <strong>{hw.subject}</strong>
                        <p>{hw.title}</p>
                      </div>
                      <span
                        className={`homework-status ${
                          hw.isCompleted ? "is-complete" : "is-pending"
                        }`}
                      >
                        {hw.isCompleted ? "Completed" : "Pending"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted-text">No homework assigned for this date.</p>
              )}
            </>
          )}
        </div>
      </div>
      {viewMode === "parent" && (
        <div className="attendance-stats">
          <GetAttendanceStats studentUid={uid} />
        </div>
      )}
    </section>
  );
}
