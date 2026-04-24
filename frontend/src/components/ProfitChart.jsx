import { SunIcon } from "./Icons.jsx";

export default function ProfitChart({ rows, language, copy }) {
  const maxProfit = Math.max(...rows.map((row) => row.expected_profit), 1);

  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-mud">{copy.expectedProfitTitle}</h2>
          <p className="text-sm text-mud/60">{copy.profitShown}</p>
        </div>
        <SunIcon className="h-5 w-5 text-harvest" />
      </div>

      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.crop}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-bold">{row.crop_label || row.crop}</span>
              <span>{formatCurrency(row.expected_profit, language)} {copy.perHectare}</span>
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

function formatCurrency(value, language) {
  return `₹${new Intl.NumberFormat(toLocale(language), { maximumFractionDigits: 0 }).format(value)}`;
}

function toLocale(language) {
  if (language === "hi") return "hi-IN";
  if (language === "pa") return "pa-IN";
  return "en-IN";
}
