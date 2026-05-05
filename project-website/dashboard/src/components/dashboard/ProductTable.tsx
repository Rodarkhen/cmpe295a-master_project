import { riskColor } from "../../utils/riskColor";

export default function ProductTable({
  products,
  selectedProduct,
  onSelectProduct,
}: any) {
  return (
    <div className="col-span-2 bg-white p-4 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Product Pricing</h2>

      <table className="w-full">
        <thead>
          <tr className="text-left border-b">
            <th>Product</th>
            <th>Current</th>
            <th>AI Price</th>
            <th>Margin</th>
            <th>Risk</th>
            <th>Min</th>
            <th>Max</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product: any) => (
            <tr
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className={`border-b cursor-pointer hover:bg-blue-50 ${
                selectedProduct.id === product.id ? "bg-blue-100" : ""
              }`}
            >
              <td>{product.name}</td>
              <td>${product.currentPrice.toFixed(2)}</td>
              <td
                className={
                  product.aiPrice > product.currentPrice
                    ? "text-green-600"
                    : "text-red-500"
                }
              >
                ${product.aiPrice.toFixed(2)}
              </td>
              <td>{product.margin}%</td>
              <td className={riskColor(product.risk)}>{product.risk}</td>
              <td>${product.minPrice.toFixed(2)}</td>
              <td>${product.maxPrice.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}