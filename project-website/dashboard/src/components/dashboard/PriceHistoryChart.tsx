import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function PriceHistoryChart({ data }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Price History</h2>

      <Line
        data={data}
        options={{
          responsive: true,
          scales: {
            y: {
              min: 85,
              max: 100,
            },
          },
        }}
      />
    </div>
  );
}