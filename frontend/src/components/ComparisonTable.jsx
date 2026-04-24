export default function ComparisonTable({ rows, language, copy }) {
  return (
    <section className="overflow-hidden rounded-[2rem] bg-white shadow-soft">
      <div className="border-b border-mud/10 px-5 py-4">
        <h2 className="text-xl font-bold text-mud">{copy.cropComparison}</h2>
        <p className="text-sm text-mud/60">{copy.comparisonNote}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-field text-mud">
            <tr>
              <th className="px-5 py-3">{copy.crop}</th>
              <th className="px-5 py-3">{copy.price}</th>
              <th className="px-5 py-3">{copy.yield}</th>
              <th className="px-5 py-3">{copy.production}</th>
              <th className="px-5 py-3">{copy.risk}</th>
              <th className="px-5 py-3">{copy.sustainabilityLabel}</th>
              <th className="px-5 py-3">{copy.expectedProfit}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.crop} className={row.is_best ? "bg-leaf/10" : "border-t border-mud/10"}>
                <td className="px-5 py-4 font-bold">
                  {row.crop_label || row.crop}
                  {row.is_current && <span className="ml-2 rounded-full bg-mud/10 px-2 py-1 text-xs">{copy.yourCrop}</span>}
                  {row.is_best && <span className="ml-2 rounded-full bg-leaf px-2 py-1 text-xs text-white">{copy.best}</span>}
                </td>
                <td className="px-5 py-4">{formatCurrency(row.price, language)}<div className="text-xs text-mud/60">{copy.perQuintal}</div></td>
                <td className="px-5 py-4">{formatYield(row.yield, language)}<div className="text-xs text-mud/60">{copy.tonnesPerHectare}</div></td>
                <td className="px-5 py-4">{formatProduction(row.production, language)}<div className="text-xs text-mud/60">{copy.productionIndex}</div></td>
                <td className="px-5 py-4">{row.risk_label || row.risk}</td>
                <td className="px-5 py-4">{row.sustainability_score ?? "-"}<div className="text-xs text-mud/60">{copy.scoreOutOf100}</div></td>
                <td className="px-5 py-4 font-bold text-leaf">
                  {formatCurrency(row.expected_profit, language)}
                  <div className="text-xs text-mud/60">{copy.perHectare}</div>
                  {row.price_source && (
                    <div className="text-xs font-normal text-mud/60">
                      {copy.priceSource}: {formatPriceSource(row.price_source, copy)}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatCurrency(value, language) {
  return `₹${new Intl.NumberFormat(toLocale(language), { maximumFractionDigits: 0 }).format(value)}`;
}

function formatYield(value, language) {
  return new Intl.NumberFormat(toLocale(language), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(value);
}

function formatProduction(value, language) {
  if (value === undefined || value === null) return "-";
  return new Intl.NumberFormat(toLocale(language), {
    maximumFractionDigits: 2
  }).format(value);
}

function toLocale(language) {
  if (language === "hi") return "hi-IN";
  if (language === "pa") return "pa-IN";
  return "en-IN";
}

function formatPriceSource(source, copy) {
  if (source === "live_api") return copy.liveApi;
  if (source === "local_snapshot") return copy.localSnapshot;
  return copy.baselinePrice;
}
