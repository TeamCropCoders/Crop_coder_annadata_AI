export default function ProfitChart({ rows }) {
  const maxProfit = Math.max(...rows.map((row) => row.expected_profit), 1);

  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-mud">Expected Profit</h2>
          <p className="text-sm text-mud/60">Simple crop-wise comparison</p>
        </div>
        <span className="text-2xl" aria-hidden="true">☀</span>
      </div>

      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.crop}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-bold">{row.crop}</span>
              <span>{formatNumber(row.expected_profit)}</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-field">
              <div
                className={`h-full rounded-full ${row.is_best ? "bg-leaf" : "bg-mud/60"}`}
                style={{ width: `${Math.max((row.expected_profit / maxProfit) * 100, 8)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(value);
}
