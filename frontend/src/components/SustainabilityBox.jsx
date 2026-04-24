export default function SustainabilityBox({ text }) {
  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-soft">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">☘</span>
        <h2 className="text-xl font-bold text-leaf">Sustainability Note</h2>
      </div>
      <p className="leading-7 text-mud/80">{text}</p>
    </section>
  );
}
