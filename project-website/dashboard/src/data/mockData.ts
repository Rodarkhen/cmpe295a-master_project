export const products = [
  { id: 1, name: "Wireless Headphones", currentPrice: 89.99, aiPrice: 94.99, margin: 32, risk: "Low" },
  { id: 2, name: "Smart Watch", currentPrice: 299.99, aiPrice: 279.99, margin: 28, risk: "Medium" },
  { id: 3, name: "USB-C Cable 6ft", currentPrice: 12.99, aiPrice: 14.99, margin: 45, risk: "Low" },
  { id: 4, name: "Laptop Stand", currentPrice: 49.99, aiPrice: 44.99, margin: 30, risk: "High" },
];

export const priceHistoryData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Wireless Headphones Price",
      data: [89.99, 90.99, 92.49, 91.99, 93.99, 94.49, 94.99],
      tension: 0.4,
    },
  ],
};