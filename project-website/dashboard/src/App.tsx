import { useState } from "react";
import { products as initialProducts} from "./data/mockData";
import Sidebar from "./components/layout/Sidebar";
import KpiCard from "./components/dashboard/KpiCard";
import ProductTable from "./components/dashboard/ProductTable";
import AlertsPanel from "./components/dashboard/AlertsPanel";
import PriceHistoryChart from "./components/dashboard/PriceHistoryChart";
import AIExplanationPanel from "./components/dashboard/AIExplanationPanel";
import PriceControls from "./components/dashboard/PriceControls"

export default function App() {
  const [products, setProducts] = useState(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState(initialProducts[0]);

  function handleSaveLimits(productId: number, minPrice: number, maxPrice: number) {
    const updatedProducts = products.map((product) =>
      product.id === productId
        ? { ...product, minPrice, maxPrice }
        : product
    );

    setProducts(updatedProducts);

    const updatedSelectedProduct = updatedProducts.find(
      (product) => product.id === productId
    );

    if (updatedSelectedProduct) {
      setSelectedProduct(updatedSelectedProduct);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6">
        <h2 className="text-3xl font-bold mb-6">Dynamic Pricing Dashboard</h2>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <KpiCard title="Revenue" value="$124,690" />
          <KpiCard title="Avg Margin" value="34.2%" />
          <KpiCard title="Win Rate" value="68.4%" />
          <KpiCard title="At Risk" value="12" danger />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <ProductTable
            products={products}
            selectedProduct={selectedProduct}
            onSelectProduct={setSelectedProduct}
          />
          <AlertsPanel />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <PriceHistoryChart product={selectedProduct} />
          <AIExplanationPanel product={selectedProduct} />
        </div>

        <div className="mt-6">
          <PriceControls
            product={selectedProduct}
            onSaveLimits={handleSaveLimits}
          />
        </div>
      </main>
    </div>
  );
}