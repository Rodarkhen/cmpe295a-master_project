export default function AIExplanationPanel({ product }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">AI Explanation</h2>

      <p className="text-gray-600 mb-4">
        <span className="font-semibold">{product.name}: </span>
        {product.explanation}
      </p>

      <div className="space-y-3">
        {product.reasons.map((reason: any) => (
          <div key={reason.label} className="flex justify-between border-b pb-2">
            <span>{reason.label}</span>
            <span className="font-semibold text-blue-600">{reason.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}