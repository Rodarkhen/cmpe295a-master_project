export function riskColor(risk: string) {
  if (risk === "Low") return "text-green-500";
  if (risk === "Medium") return "text-yellow-500";
  return "text-red-500";
}