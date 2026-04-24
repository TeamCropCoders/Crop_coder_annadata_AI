export default function ComparisonTable({ rows }) {
  return (
    <section className="overflow-hidden rounded-[2rem] bg-white shadow-soft">
      <div className="border-b border-mud/10 px-5 py-4">
        <h2 className="text-xl font-bold text-mud">Crop Comparison</h2>
        <p className="text-sm text-mud/60">Price in INR per quintal, yield in tonnes per hectare, and profit per hectare.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-field text-mud">
            <tr>
              <th className="px-5 py-3">Crop</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Yield</th>
              <th className="px-5 py-3">Production</th>
              <th className="px-5 py-3">Risk</th>
              <th className="px-5 py-3">Sustainability</th>
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
                <td className="px-5 py-4">{formatCurrency(row.price)}<div className="text-xs text-mud/60">per quintal</div></td>
                <td className="px-5 py-4">{formatYield(row.yield)}<div className="text-xs text-mud/60">tonnes/hectare</div></td>
                <td className="px-5 py-4">{formatProduction(row.production)}<div className="text-xs text-mud/60">production index</div></td>
                <td className="px-5 py-4">{row.risk}</td>
                <td className="px-5 py-4">{row.sustainability_score ?? "-"}<div className="text-xs text-mud/60">score / 100</div></td>
                <td className="px-5 py-4 font-bold text-leaf">{formatCurrency(row.expected_profit)}<div className="text-xs text-mud/60">per hectare</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatCurrency(value) {
  return `INR ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
}

function formatYield(value) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(value);
}

function formatProduction(value) {
  if (value === undefined || value === null) return "-";
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2
  }).format(value);
}
