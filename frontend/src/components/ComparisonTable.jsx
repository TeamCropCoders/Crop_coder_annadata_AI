export default function ComparisonTable({ rows }) {
  return (
    <section className="overflow-hidden rounded-[2rem] bg-white shadow-soft">
      <div className="border-b border-mud/10 px-5 py-4">
        <h2 className="text-xl font-bold text-mud">Crop Comparison</h2>
        <p className="text-sm text-mud/60">Price, yield, risk, and expected profit.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-field text-mud">
            <tr>
              <th className="px-5 py-3">Crop</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Yield</th>
              <th className="px-5 py-3">Risk</th>
              <th className="px-5 py-3">Expected Profit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.crop} className={row.is_best ? "bg-leaf/10" : "border-t border-mud/10"}>
                <td className="px-5 py-4 font-bold">
                  {row.crop}
                  {row.is_current && <span className="ml-2 rounded-full bg-mud/10 px-2 py-1 text-xs">Your Crop</span>}
                  {row.is_best && <span className="ml-2 rounded-full bg-leaf px-2 py-1 text-xs text-white">Best</span>}
                </td>
                <td className="px-5 py-4">{formatNumber(row.price)}</td>
                <td className="px-5 py-4">{row.yield}</td>
                <td className="px-5 py-4">{row.risk}</td>
                <td className="px-5 py-4 font-bold text-leaf">{formatNumber(row.expected_profit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(value);
}
