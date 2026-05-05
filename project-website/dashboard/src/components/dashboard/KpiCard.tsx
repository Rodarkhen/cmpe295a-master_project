export default function KpiCard({ title, value, danger = false }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className={`text-2xl font-bold ${danger ? "text-red-500" : ""}`}>
        {value}
      </h2>
    </div>
  );
}