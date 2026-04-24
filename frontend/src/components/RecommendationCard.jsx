export default function RecommendationCard({ crop, bestCrop }) {
  const isBest = crop.crop.toLowerCase() === bestCrop.toLowerCase();

  return (
    <article className={`rounded-3xl p-5 shadow-soft ${isBest ? "bg-leaf text-white" : "bg-white text-mud"}`}>
      <div className="mb-4 flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${isBest ? "bg-beige text-leaf" : "bg-field text-leaf"}`}>
          {isBest ? "Best Suggestion" : `Rank ${crop.rank}`}
        </span>
        <span className="text-sm font-bold uppercase tracking-[0.15em]" aria-hidden="true">Leaf</span>
      </div>
      <h3 className="text-2xl font-bold">{crop.crop}</h3>
      <p className={isBest ? "text-beige/90" : "text-mud/60"}>Compatibility</p>
      <p className="mt-2 text-3xl font-bold">{crop.compatibility_score}%</p>
      {crop.price && (
        <p className="mt-3 text-sm">
          Price: <strong>{formatCurrency(crop.price)}</strong> <span className={isBest ? "text-beige/80" : "text-mud/60"}>per quintal</span>
        </p>
      )}
      {crop.yield && (
        <p className="mt-1 text-sm">
          Yield: <strong>{formatYield(crop.yield)}</strong> <span className={isBest ? "text-beige/80" : "text-mud/60"}>tonnes/hectare</span>
        </p>
      )}
      {crop.expected_profit && (
        <p className="mt-1 text-sm">
          Expected Profit: <strong>{formatCurrency(crop.expected_profit)}</strong> <span className={isBest ? "text-beige/80" : "text-mud/60"}>per hectare</span>
        </p>
      )}
    </article>
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
