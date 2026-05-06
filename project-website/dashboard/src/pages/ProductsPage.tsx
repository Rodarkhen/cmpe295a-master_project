import { useMemo, useState } from "react";

type Product = {
  id: string | number;
  sku?: string;
  name: string;
  category?: string;
  source?: string;
  competitorUrl?: string;
  currentPrice: number;
  competitorPrice?: number;
  aiPrice?: number;
  minPrice: number;
  maxPrice: number;
  lastUpdated?: string;
};

type SortField =
  | "sku"
  | "name"
  | "category"
  | "currentPrice"
  | "competitorPrice"

type SortDirection = "asc" | "desc";

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) return "N/A";
  return `$${value.toFixed(2)}`;
};

export default function ProductsPage({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sources = useMemo(() => {
    return ["All", ...new Set(products.map((p) => p.source ?? "N/A"))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.sku ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category ?? "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSource =
        sourceFilter === "All" || (product.source ?? "N/A") === sourceFilter;

      return matchesSearch && matchesSource;
    });
  }, [products, searchTerm, sourceFilter]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const aValue = a[sortField] ?? "";
      const bValue = b[sortField] ?? "";

      if (aValue === bValue) return 0;

      const result = aValue > bValue ? 1 : -1;
      return sortDirection === "asc" ? result : -result;
    });
  }, [filteredProducts, sortField, sortDirection]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  }

  function sortIcon(field: SortField) {
    if (sortField !== field) return null;

    return (
      <span className="ml-1 text-xs text-gray-400">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-2">Products</h2>
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-2">Products</h2>
      <p className="text-gray-500 mb-6">
        Manage store inventory, categories, store prices, and competitor mappings.
      </p>

      <div className="bg-white p-6 rounded-2xl shadow">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-bold">Product Inventory</h3>
            <p className="text-gray-500 text-sm">
              Store prices are separated from competitor pricing sources.
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="border rounded-xl px-4 py-2 text-sm w-72"
            />

            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
              className="border rounded-xl px-4 py-2 text-sm"
            >
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700">
              Add Product
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[620px]">
          <table className="w-full min-w-[900px] border-separate border-spacing-y-1">
            <thead className="sticky top-0 bg-white z-10">
            <tr className="text-left text-sm text-gray-500">
                <th
                onClick={() => handleSort("sku")}
                className="w-[90px] px-3 py-3 cursor-pointer select-none hover:text-gray-700 transition"
                >
                SKU {sortIcon("sku")}
                </th>

                <th
                onClick={() => handleSort("name")}
                className="w-[25%] px-3 py-3 cursor-pointer select-none hover:text-gray-700 transition"
                >
                Product {sortIcon("name")}
                </th>

                <th
                onClick={() => handleSort("category")}
                className="w-[120px] px-3 py-3 cursor-pointer select-none hover:text-gray-700 transition"
                >
                Category {sortIcon("category")}
                </th>

                <th
                onClick={() => handleSort("currentPrice")}
                className="w-[120px] px-3 py-3 cursor-pointer select-none hover:text-gray-700 transition"
                >
                Store Price {sortIcon("currentPrice")}
                </th>

                <th
                onClick={() => handleSort("competitorPrice")}
                className="w-[140px] px-3 py-3 cursor-pointer select-none hover:text-gray-700 transition"
                >
                Competitor Price {sortIcon("competitorPrice")}
                </th>

                <th className="w-[90px] px-3 py-3">Min</th>
                <th className="w-[90px] px-3 py-3">Max</th>
                <th className="w-[120px] px-3 py-3">Updated</th>
            </tr>
            </thead>

            <tbody>
              {sortedProducts.map((product) => (
                <tr
                  key={product.id}
                  className="bg-gray-50 hover:bg-gray-100 transition"
                >
                  <td className="px-3 py-2 rounded-l-xl text-sm whitespace-nowrap align-middle">
                    {product.sku ?? "N/A"}
                  </td>

                  <td className="px-3 py-2 align-middle">
                    <p className="font-medium leading-5 text-gray-900 text-sm">
                      {product.name}
                    </p>
                  </td>

                  <td className="px-3 py-2 text-sm whitespace-nowrap align-middle">
                    {product.category ?? "N/A"}
                  </td>

                  <td className="px-3 py-2 text-sm whitespace-nowrap align-middle font-medium">
                    {formatCurrency(product.currentPrice)}
                  </td>

                  <td className="px-3 py-2 text-sm whitespace-nowrap align-middle">
                    {product.competitorUrl ? (
                      <a
                        href={product.competitorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        {formatCurrency(product.competitorPrice)}
                      </a>
                    ) : (
                      <p className="text-blue-600 font-semibold">
                        {formatCurrency(product.competitorPrice)}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-0.5">
                      {product.source ?? "N/A"}
                    </p>
                  </td>


                  <td className="px-3 py-2 text-sm whitespace-nowrap align-middle">
                    {formatCurrency(product.minPrice)}
                  </td>

                  <td className="px-3 py-2 text-sm whitespace-nowrap align-middle">
                    {formatCurrency(product.maxPrice)}
                  </td>

                  <td className="px-3 py-2 rounded-r-xl text-sm text-gray-500 whitespace-nowrap align-middle">
                    {product.lastUpdated ?? "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedProducts.length === 0 && (
          <p className="text-gray-500 mt-4">No products found.</p>
        )}

        <p className="text-xs text-gray-400 mt-4">
          <p>Store Price = your listed product price.</p>
          <p>Competitor Price = latest matched external price from the configured source. </p>
        </p>
      </div>
    </div>
  );
}