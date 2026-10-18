import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export default function Marks({ marks }) {
  const chartData = {
    labels: marks.map((item) => item.testName || "Unnamed Test"),
    datasets: [
      {
        label: "Scored marks",
        data: marks.map((item) => item.scoredMarks ?? 0),
        borderColor: "#b65e3c",
        backgroundColor: "rgba(182, 94, 60, 0.16)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "#b65e3c",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 100,
        grid: { color: "#eee5da" },
      },
      x: { grid: { display: false } },
    },
  };

  return (
    <section className="dashboard-card marks-card" aria-labelledby="marks-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">ASSESSMENTS</p>
          <h2 id="marks-title">Test results</h2>
        </div>
        <span className="count-pill">{marks.length} tests</span>
      </div>

      {marks.length === 0 ? (
        <p className="empty-state">No test marks recorded yet.</p>
      ) : (
        <>
          <div className="marks-chart">
            <Line data={chartData} options={chartOptions} />
          </div>
          <div className="marks-table-wrap">
            <table className="marks-table">
              <thead>
                <tr>
                  <th scope="col">Test</th>
                  <th scope="col">Score</th>
                  <th scope="col">Out of</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((item) => (
                  <tr key={item.id}>
                    <td>{item.testName || "Unnamed test"}</td>
                    <td>{item.scoredMarks ?? "N/A"}</td>
                    <td>{item.maxMarks ?? "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
