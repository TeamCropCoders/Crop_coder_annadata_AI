import { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import InputForm from "./components/InputForm.jsx";
import RecommendationCard from "./components/RecommendationCard.jsx";
import ComparisonTable from "./components/ComparisonTable.jsx";
import ProfitChart from "./components/ProfitChart.jsx";
import InsightBox from "./components/InsightBox.jsx";
import SustainabilityBox from "./components/SustainabilityBox.jsx";
import VoiceButton from "./components/VoiceButton.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const API_URL = `${API_BASE_URL}/api/analyze`;

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze(formData) {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail || "Unable to analyze this farm right now.");
      }

      setResult(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-beige text-mud">
      <Navbar />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-[0.9fr_1.1fr] md:px-8">
        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white/80 p-6 shadow-soft ring-1 ring-mud/10">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-leaf">
              Smart crop guidance
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-mud md:text-5xl">
              Choose the crop that gives your farm a stronger tomorrow.
            </h1>
            <p className="mt-4 text-base leading-7 text-mud/75">
              AnnadataAI compares your current crop with better suggestions using pre-trained models,
              expected profit, risk, and sustainability rules.
            </p>
          </div>

          <InputForm onSubmit={handleAnalyze} disabled={loading} />
        </div>

        <div className="space-y-6">
          {loading && (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-soft">
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-field border-t-leaf" />
              <p className="text-xl font-bold text-leaf">Analyzing your farm...</p>
              <p className="mt-2 text-sm text-mud/70">Checking crop fit, profit, and risk.</p>
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-800 shadow-soft">
              {error}
            </div>
          )}

          {!loading && !result && !error && (
            <div className="rounded-[2rem] bg-white/75 p-8 shadow-soft">
              <p className="text-5xl font-bold text-harvest" aria-hidden="true">Sun</p>
              <h2 className="mt-4 text-2xl font-bold text-leaf">Ready for your first analysis</h2>
              <p className="mt-2 text-mud/70">
                Enter soil, location, season, and your current crop to see the best suggestion.
              </p>
            </div>
          )}

          {result && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {result.recommended.map((crop) => (
                  <RecommendationCard key={crop.crop} crop={crop} bestCrop={result.best_crop} />
                ))}
              </div>

              <InsightBox text={result.insight} bestCrop={result.best_crop} />
              <SustainabilityBox text={result.sustainability} />
              <ProfitChart rows={result.comparison} />
              <ComparisonTable rows={result.comparison} />
              <VoiceButton text={result.voice_text} />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
