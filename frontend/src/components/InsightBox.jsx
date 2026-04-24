export default function InsightBox({ text, bestCrop }) {
  return (
    <section className="rounded-[2rem] bg-harvest/25 p-5 shadow-soft ring-1 ring-harvest/40">
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-mud/70">Best Suggestion</p>
      <h2 className="text-3xl font-bold text-leaf">{bestCrop}</h2>
      <p className="mt-3 leading-7 text-mud">{text}</p>
    </section>
  );
}
