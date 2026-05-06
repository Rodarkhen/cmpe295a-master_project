import KpiCard from "../components/dashboard/KpiCard";
import ProductTable from "../components/dashboard/ProductTable";
import AlertsPanel from "../components/dashboard/AlertsPanel";
import PriceHistoryChart from "../components/dashboard/PriceHistoryChart";
import AIExplanationPanel from "../components/dashboard/AIExplanationPanel";
import PriceControls from "../components/dashboard/PriceControls";

export default function DashboardPage({
  products,
  filteredProducts,
  selectedProduct,
  setSelectedProduct,
  searchTerm,
  setSearchTerm,
  riskFilter,
  setRiskFilter,
  handleSaveLimits,
}: any) {
  return (
    <>
      <h2 className="text-3xl font-bold mb-6">
        Dynamic Pricing Dashboard
      </h2>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <KpiCard title="Revenue" value="$124,690" />
        <KpiCard title="Avg Margin" value="34.2%" />
        <KpiCard title="Win Rate" value="68.4%" />
        <KpiCard title="At Risk" value="12" danger />
      </div>

      {/* Alerts */}
      <div className="mb-6">
        <AlertsPanel />
      </div>

      {/* Product Table */}
      <div className="mb-6">
        <ProductTable
          products={filteredProducts}
          selectedProduct={selectedProduct}
          onSelectProduct={setSelectedProduct}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          riskFilter={riskFilter}
          setRiskFilter={setRiskFilter}
        />
      </div>

      {/* Chart + Explanation */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <PriceHistoryChart product={selectedProduct} />
        <AIExplanationPanel product={selectedProduct} />
      </div>

      {/* Price Controls */}
      <div className="mt-6">
        <PriceControls
          product={selectedProduct}
          onSaveLimits={handleSaveLimits}
        />
      </div>
    </>
  );
}