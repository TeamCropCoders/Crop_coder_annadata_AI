export default function InsightBox({ text, bestCrop, confidenceScore, confidenceLabel, confidenceReason, copy }) {
  return (
    <section className="rounded-[2rem] bg-harvest/25 p-5 shadow-soft ring-1 ring-harvest/40">
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-mud/70">{copy.bestSuggestion}</p>
      <h2 className="text-3xl font-bold text-leaf">{bestCrop}</h2>
      <p className="mt-3 leading-7 text-mud">{text}</p>
      <div className="mt-4 rounded-2xl bg-white/70 px-4 py-3">
        <p className="text-sm font-bold text-mud">
          {copy.confidence}: {confidenceLabel} ({confidenceScore}%)
        </p>
        <p className="mt-1 text-sm text-mud/75">{confidenceReason}</p>
      </div>
    </section>
  );
}
