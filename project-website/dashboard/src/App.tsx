import { useEffect, useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";

export default function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [activePage, setActivePage] = useState("Dashboard");

  async function fetchProducts() {
    const res = await fetch("http://localhost:8000/products");
    const data = await res.json();

    setProducts(data);

    setSelectedProduct((current: any) => {
      if (!current) return data[0];
      return data.find((p: any) => p.id === current.id) || data[0];
    });
  }

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesRisk =
      riskFilter === "All" || product.risk === riskFilter;

    return matchesSearch && matchesRisk;
  });

  function handleSaveLimits(productId: number, minPrice: number, maxPrice: number) {
    const updatedProducts = products.map((product) =>
      product.id === productId ? { ...product, minPrice, maxPrice } : product
    );

    setProducts(updatedProducts);

    const updatedSelected = updatedProducts.find((p) => p.id === productId);
    if (updatedSelected) setSelectedProduct(updatedSelected);
  }

  if (!selectedProduct) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 p-8 overflow-x-hidden">
        {activePage === "Dashboard" && (
          <DashboardPage
            products={products}
            filteredProducts={filteredProducts}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            riskFilter={riskFilter}
            setRiskFilter={setRiskFilter}
            handleSaveLimits={handleSaveLimits}
          />
        )}

        {activePage === "Products" && (
          <ProductsPage products={products} />
        )}
      </main>
    </div>
  );
}