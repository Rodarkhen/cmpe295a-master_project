import { useState, useEffect } from "react";

export default function PriceControls({ product, onSaveLimits }: any) {
  const [minPrice, setMinPrice] = useState(product.minPrice);
  const [maxPrice, setMaxPrice] = useState(product.maxPrice);

  useEffect(() => {
    setMinPrice(product.minPrice);
    setMaxPrice(product.maxPrice);
  }, [product]);

  function handleSave() {
    onSaveLimits(product.id, Number(minPrice), Number(maxPrice));
  }

  const isInvalid = Number(minPrice) >= Number(maxPrice);

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-2">Price Controls</h2>
      <p className="text-gray-500 mb-4">{product.name}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Minimum Price</label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Maximum Price</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>
      </div>

      {isInvalid && (
        <p className="text-red-500 text-sm mb-3">
          Minimum price must be lower than maximum price.
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={isInvalid}
        className={`px-4 py-2 rounded-lg text-white ${
          isInvalid
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        Save Limits
      </button>
    </div>
  );
}