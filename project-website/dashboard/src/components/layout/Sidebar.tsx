type SidebarProps = {
  activePage: string;
  setActivePage: (page: string) => void;
};

const menuItems = [
  "Dashboard",
  "Products",
  "Pricing",
  "Insights",
  "Alerts",
  "History",
  "Settings",
];

export default function Sidebar({ activePage, setActivePage }: SidebarProps) {
  return (
    <aside className="w-64 bg-white shadow p-6">
      <h1 className="text-2xl font-bold mb-8">PriceAI</h1>

      <nav className="space-y-3">
        {menuItems.map((item) => (
          <button
            key={item}
            onClick={() => setActivePage(item)}
            className={`w-full text-left p-3 rounded-lg transition ${
              activePage === item
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}