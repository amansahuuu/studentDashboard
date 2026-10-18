import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "./Firebase";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function GetAttendanceStats({ studentUid }) {
  const [result, setResult] = useState({
    studentUid: null,
    stats: null,
    error: null,
  });

  useEffect(() => {
    async function fetchAttendanceStats() {
      try {
        const dailyLogsRef = collection(
          db,
          "students",
          studentUid,
          "dailyLogs",
        );
        const querySnapshot = await getDocs(dailyLogsRef);

        let daysPresent = 0;
        querySnapshot.forEach((docSnap) => {
          if (docSnap.data().attendence === true) {
            daysPresent += 1;
          }
        });

        const totalDaysTaught = querySnapshot.size;
        const daysAbsent = totalDaysTaught - daysPresent;

        setResult({
          studentUid,
          stats: {
            totalDaysTaught,
            daysPresent,
            daysAbsent,
            attendancePercentage:
              totalDaysTaught === 0
                ? "0.0"
                : ((daysPresent / totalDaysTaught) * 100).toFixed(1),
          },
          error: null,
        });
      } catch (error) {
        console.error("Error fetching attendance stats:", error);
        setResult({ studentUid, stats: null, error });
      }
    }

    if (studentUid) {
      fetchAttendanceStats();
    }
  }, [studentUid]);

  if (!studentUid || result.studentUid !== studentUid) {
    return <p>Loading attendance stats...</p>;
  }

  if (result.error) {
    return <p>Could not load attendance stats.</p>;
  }

  const { totalDaysTaught, daysPresent, daysAbsent, attendancePercentage } =
    result.stats;
  const chartData = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        data: [daysPresent, daysAbsent],
        backgroundColor: ["#22c55e", "#ef4444"],
        borderColor: ["#16a34a", "#dc2626"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <section>
      <h3>Attendance Statistics</h3>
      <p>Days recorded: {totalDaysTaught}</p>
      <p>Days present: {daysPresent}</p>
      <p>Days absent: {daysAbsent}</p>
      <p>Attendance percentage: {attendancePercentage}%</p>
      {totalDaysTaught > 0 ? (
        <div style={{ width: "100%", maxWidth: "320px" }}>
          <Pie data={chartData} />
        </div>
      ) : (
        <p>No attendance data available for the chart.</p>
      )}
    </section>
  );
}
