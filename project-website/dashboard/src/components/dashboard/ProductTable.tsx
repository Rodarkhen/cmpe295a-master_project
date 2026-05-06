import { useMemo, useState, useRef, useEffect } from "react";
import { riskColor } from "../../utils/riskColor";

type Risk = "Low" | "Medium" | "High";
type SortField = "name" | "category" | "currentPrice" | "aiPrice" | "margin" | "risk";
type SortDirection = "asc" | "desc";

type Product = {
  id: string | number;
  name: string;
  category?: string;
  source?: string;
  currentPrice: number;
  aiPrice: number;
  margin: number;
  risk: Risk;
  minPrice: number;
  maxPrice: number;
  lastUpdated?: string;
};

type ProductTableProps = {
  products: Product[];
  selectedProduct?: Product | null;
  onSelectProduct: (product: Product) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  riskFilter: "All" | Risk;
  setRiskFilter: (value: "All" | Risk) => void;
};

const riskRank: Record<Risk, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
};

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

export default function ProductTable({
  products,
  selectedProduct,
  onSelectProduct,
  searchTerm,
  setSearchTerm,
  riskFilter,
  setRiskFilter,
}: ProductTableProps) {
  const [sortField, setSortField] = useState<SortField>("currentPrice");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [hoveredProduct, setHoveredProduct] = useState<Product | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  const hoverTimeoutRef = useRef<number | null>(null)
  const hideTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        window.clearTimeout(hoverTimeoutRef.current);
      }

      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("desc");
  }

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const getValue = (product: Product) => {
        if (sortField === "risk") {
          return riskRank[product.risk];
        }

        return product[sortField];
      };

      const aValue = getValue(a);
      const bValue = getValue(b);

      if (aValue === bValue) return 0;

      const result = aValue > bValue ? 1 : -1;
      return sortDirection === "asc" ? result : -result;
    });
  }, [products, sortField, sortDirection]);

  function sortIcon(field: SortField) {
    if (sortField !== field) return null;

    return (
      <span className="ml-1 text-xs text-gray-400">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  }

  function handleMouseEnter(product: Product) {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
    }

    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }

    hoverTimeoutRef.current = window.setTimeout(() => {
      setHoveredProduct(product);
      setShowTooltip(false);

      requestAnimationFrame(() => {
        setShowTooltip(true);
      });
    }, 250);
  }

  function handleMouseMove(event: React.MouseEvent<HTMLTableRowElement>) {
    const tooltipWidth = 288;
    const tooltipHeight = 220;
    const offset = 16;

    const x = Math.min(
      event.clientX + offset,
      window.innerWidth - tooltipWidth - offset
    );

    const y = Math.min(
      event.clientY + offset,
      window.innerHeight - tooltipHeight - offset
    );

    setTooltipPosition({ x, y });
  }

  function handleMouseLeave() {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
    }

    setShowTooltip(false);

    hideTimeoutRef.current = window.setTimeout(() => {
      setHoveredProduct(null);
    }, 200);
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Product Pricing</h2>
          <p className="text-gray-500 text-sm">
            Monitor live competitors pricing and AI recommendations
          </p>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="border rounded-xl px-4 py-2 text-sm w-72"
          />

          <select
            value={riskFilter}
            onChange={(event) =>
              setRiskFilter(event.target.value as "All" | Risk)
            }
            className="border rounded-xl px-4 py-2 text-sm"
          >
            <option value="All">All Risks</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      <div className="overflow-auto max-h-[420px] xl:max-h-[520px]">
				<table className="w-full min-w-[1100px] border-separate border-spacing-y-1">
					<thead className="sticky top-0 bg-white z-10">
						<tr className="text-left text-sm text-gray-500">
							<th className="w-[225px] px-3 py-3">Product</th>
							
							<th
								onClick={() => handleSort("category")}
								className="w-[130px] px-3 py-3 cursor-pointer select-none hover:text-gray-700 transition"
							>
								Category {sortIcon("category")}
							</th>

							<th
								onClick={() => handleSort("currentPrice")}
								className="w-[110px] px-3 py-3 cursor-pointer select-none hover:text-gray-700 transition"
							>
								Current {sortIcon("currentPrice")}
							</th>

							<th
								onClick={() => handleSort("aiPrice")}
								className="w-[110px] px-3 py-3 cursor-pointer select-none hover:text-gray-700 transition"
							>
								AI Price {sortIcon("aiPrice")}
							</th>

							<th
								onClick={() => handleSort("margin")}
								className="w-[90px] px-3 py-3 cursor-pointer select-none hover:text-gray-700 transition"
							>
								Margin {sortIcon("margin")}
							</th>

							<th
								onClick={() => handleSort("risk")}
								className="w-[90px] px-3 py-3 cursor-pointer select-none hover:text-gray-700 transition"
							>
								Risk {sortIcon("risk")}
							</th>

							<th className="w-[90px] px-3 py-3">Min</th>
							<th className="w-[90px] px-3 py-3">Max</th>
							<th className="w-[120px] px-3 py-3">Updated</th>
						</tr>
					</thead>

          <tbody>
            {sortedProducts.map((product) => {
              const selected = selectedProduct?.id === product.id;

              return (
                <tr
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  onMouseEnter={() => handleMouseEnter(product)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className={`cursor-pointer transition ${
                    selected
                      ? "bg-blue-50 ring-2 ring-blue-200"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >

                  <td className="px-3 py-2 rounded-l-xl align-middle">
                    <div className="relative">
                      <p className="font-medium leading-5 text-gray-900 text-sm">
                        {product.name}
                      </p>

                      {product.source && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {product.source}
                        </p>
                      )}
                    </div>
                  </td>

									<td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 align-middle">
										{product.category ?? "N/A"}
									</td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm align-middle">
                    {formatCurrency(product.currentPrice)}
                  </td>

                  <td
                    className={`px-3 py-2 whitespace-nowrap text-sm font-semibold align-middle ${
                      product.aiPrice > product.currentPrice
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {formatCurrency(product.aiPrice)}
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm align-middle">
                    {product.margin}%
                  </td>

                  <td
                    className={`px-3 py-2 whitespace-nowrap text-sm font-medium align-middle ${riskColor(
                      product.risk
                    )}`}
                  >
                    {product.risk}
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm align-middle">
                    {formatCurrency(product.minPrice)}
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm align-middle">
                    {formatCurrency(product.maxPrice)}
                  </td>

                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 rounded-r-xl align-middle">
                    {product.lastUpdated ?? "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {hoveredProduct && (
          <div
            className={`pointer-events-none fixed z-50 w-72 rounded-xl border bg-white/95 backdrop-blur p-4 shadow-2xl
              transition-all duration-200 ease-out
              ${
                showTooltip
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 translate-y-2"
              }
            `}
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
            }}
          >
            <p className="font-semibold text-gray-900 mb-2">Quick Stats</p>

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Current</span>
                <span>{formatCurrency(hoveredProduct.currentPrice)}</span>
              </div>

              <div className="flex justify-between">
                <span>AI Price</span>
                <span>{formatCurrency(hoveredProduct.aiPrice)}</span>
              </div>

              <div className="flex justify-between">
                <span>Margin</span>
                <span>{hoveredProduct.margin}%</span>
              </div>

              <div className="flex justify-between">
                <span>Risk</span>
                <span className={riskColor(hoveredProduct.risk)}>
                  {hoveredProduct.risk}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Last Updated</span>
                <span>{hoveredProduct.lastUpdated ?? "N/A"}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {products.length === 0 && (
        <p className="text-gray-500 mt-4">No products found.</p>
      )}
    </div>
  );
}