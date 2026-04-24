export default function RecommendationCard({ crop, bestCrop }) {
  const isBest = crop.crop.toLowerCase() === bestCrop.toLowerCase();

  return (
    <article className={`rounded-3xl p-5 shadow-soft ${isBest ? "bg-leaf text-white" : "bg-white text-mud"}`}>
      <div className="mb-4 flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${isBest ? "bg-beige text-leaf" : "bg-field text-leaf"}`}>
          {isBest ? "Best Suggestion" : `Rank ${crop.rank}`}
        </span>
        <span className="text-2xl" aria-hidden="true">☘</span>
      </div>
      <h3 className="text-2xl font-bold">{crop.crop}</h3>
      <p className={isBest ? "text-beige/90" : "text-mud/60"}>Compatibility</p>
      <p className="mt-2 text-3xl font-bold">{crop.compatibility_score}%</p>
      {crop.expected_profit && (
        <p className="mt-3 text-sm">
          Expected Profit: <strong>{formatNumber(crop.expected_profit)}</strong>
        </p>
      )}
    </article>
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(value);
}
