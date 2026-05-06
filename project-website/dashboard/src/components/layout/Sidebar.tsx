type SidebarProps = {
  activePage: string;
  setActivePage: (page: string) => void;
  dataSource: "Live API" | "Mock Data";
};

export default function Sidebar({
  activePage,
  setActivePage,
  dataSource,
}: SidebarProps) {
  const menuItems = [
    "Dashboard",
    "Products",
    "Pricing",
    "Insights",
    "Alerts",
    "History",
    "Settings",
  ];

  return (
    <aside className="w-64 h-screen shrink-0 bg-white shadow p-6 flex flex-col sticky top-0">
      {/* Top */}
      <div>
        <h1 className="text-2xl font-bold mb-8">PriceAI</h1>

        <nav className="space-y-1.5">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => setActivePage(item)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                activePage === item
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom (Data Source) */}
      <div className="mt-auto pt-4 border-t">
        <p className="text-[10px] text-gray-400 mb-1">DATA SOURCE</p>

        <div
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-small ${
            dataSource === "Live API"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              dataSource === "Live API"
                ? "bg-green-500"
                : "bg-yellow-500"
            }`}
          />
          {dataSource}
        </div>
      </div>
    </aside>
  );
}