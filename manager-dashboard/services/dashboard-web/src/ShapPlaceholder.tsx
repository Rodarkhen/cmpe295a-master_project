import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
)

type Props = {
  selectedProductId: string | null
}

export function ShapPlaceholder({ selectedProductId }: Props) {
  const data = {
    labels: [
      'Inventory signal',
      'Competitor price',
      'Volatility penalty (λ)',
      'Churn risk (γ)',
    ],
    datasets: [
      {
        label: 'SHAP value (placeholder)',
        data: [0.38, -0.21, -0.15, 0.09],
        backgroundColor: 'rgba(170, 59, 255, 0.45)',
        borderColor: 'rgba(170, 59, 255, 0.9)',
        borderWidth: 1,
      },
    ],
  }

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Per-decision drivers (sample data)',
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(128,128,128,0.2)' },
      },
      y: {
        grid: { display: false },
      },
    },
  }

  return (
    <div className="shap-panel">
      <p className="shap-panel__lead">
        Placeholder panel for SHAP-style feature contributions (workbook: live
        vectors in Sprint 2).{' '}
        {selectedProductId ? (
          <>
            Selected SKU: <code>{selectedProductId}</code>
          </>
        ) : (
          <>Select a row in the price table to associate context.</>
        )}
      </p>
      <div className="shap-panel__chart">
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}
