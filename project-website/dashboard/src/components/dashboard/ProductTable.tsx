export default function ProductTable({ products }: any) {
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
          </tr>
        </thead>
        <tbody>
          {products.map((p: any) => (
            <tr key={p.id} className="border-b">
              <td>{p.name}</td>
              <td>${p.currentPrice}</td>
              <td>${p.aiPrice}</td>
              <td>{p.margin}%</td>
              <td>{p.risk}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}