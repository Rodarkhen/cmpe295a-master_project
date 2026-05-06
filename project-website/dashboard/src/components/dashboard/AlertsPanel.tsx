export default function AlertsPanel() {
  return (
    <div className="bg-white p-5 rounded-2xl shadow">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Action Alerts</h2>
          <p className="text-gray-500 text-sm">
            No critical pricing alerts right now.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
          System Healthy
        </span>
      </div>
    </div>
  );
}