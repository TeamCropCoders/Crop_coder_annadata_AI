import { LeafIcon } from "./Icons.jsx";

export default function RecommendationCard({ crop, bestCrop, language, copy }) {
  const isBest = crop.crop.toLowerCase() === bestCrop.toLowerCase();
  const cropName = crop.crop_label || crop.crop;

  return (
    <article className={`rounded-3xl p-5 shadow-soft ${isBest ? "bg-leaf text-white" : "bg-white text-mud"}`}>
      <div className="mb-4 flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${isBest ? "bg-beige text-leaf" : "bg-field text-leaf"}`}>
          {isBest ? copy.bestSuggestion : `${copy.rank} ${crop.rank}`}
        </span>
        <LeafIcon className={`h-5 w-5 ${isBest ? "text-beige" : "text-leaf"}`} />
      </div>
      <h3 className="text-2xl font-bold">{cropName}</h3>
      <p className={isBest ? "text-beige/90" : "text-mud/60"}>{copy.compatibility}</p>
      <p className="mt-2 text-3xl font-bold">{crop.compatibility_score}%</p>
      {crop.price && (
        <p className="mt-3 text-sm">
          {copy.price}: <strong>{formatCurrency(crop.price, language)}</strong>{" "}
          <span className={isBest ? "text-beige/80" : "text-mud/60"}>{copy.perQuintal}</span>
        </p>
      )}
      {crop.price_source && (
        <p className={`mt-1 text-xs ${isBest ? "text-beige/80" : "text-mud/60"}`}>
          {copy.priceSource}: {formatPriceSource(crop.price_source, copy)}
        </p>
      )}
      {crop.yield && (
        <p className="mt-1 text-sm">
          {copy.yield}: <strong>{formatYield(crop.yield, language)}</strong>{" "}
          <span className={isBest ? "text-beige/80" : "text-mud/60"}>{copy.tonnesPerHectare}</span>
        </p>
      )}
      {crop.expected_profit && (
        <p className="mt-1 text-sm">
          {copy.expectedProfit}: <strong>{formatCurrency(crop.expected_profit, language)}</strong>{" "}
          <span className={isBest ? "text-beige/80" : "text-mud/60"}>{copy.perHectare}</span>
        </p>
      )}
    </article>
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
