export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow p-6">
      <h1 className="text-2xl font-bold mb-8">PriceAI</h1>

      <nav className="space-y-3">
        {["Dashboard", "Products", "Pricing", "Insights", "Alerts", "History", "Settings"].map(
          (item) => (
            <div
              key={item}
              className={`p-3 rounded-lg cursor-pointer ${
                item === "Dashboard"
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item}
            </div>
          )
        )}
      </nav>
    </aside>
  );
}