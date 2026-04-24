import { useEffect, useMemo, useRef, useState } from "react";
import { SunIcon } from "./components/Icons.jsx";
import Navbar from "./components/Navbar.jsx";
import InputForm from "./components/InputForm.jsx";
import RecommendationCard from "./components/RecommendationCard.jsx";
import ComparisonTable from "./components/ComparisonTable.jsx";
import ProfitChart from "./components/ProfitChart.jsx";
import InsightBox from "./components/InsightBox.jsx";
import SustainabilityBox from "./components/SustainabilityBox.jsx";
import VoiceButton from "./components/VoiceButton.jsx";
import {
  getSpeechLocale,
  getUiCopy,
  languageOptions
} from "./data/formOptions.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const API_URL = `${API_BASE_URL}/api/analyze`;

export default function App() {
  const [language, setLanguage] = useState("en");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastFormData, setLastFormData] = useState(null);
  const firstLanguageRender = useRef(true);
  const copy = getUiCopy(language);
  const voiceNarration = useMemo(() => {
    if (!result) {
      return "";
    }

    const topCrops = (result.recommended || [])
      .map((crop) => crop.crop_label || crop.crop)
      .join(", ");
    const currentCrop = result.current_crop?.crop_label || result.current_crop?.crop || "";
    const bestCrop = result.best_crop_label || result.best_crop || "";
    const increase = extractIncrease(result.insight);

    if (language === "hi") {
      return [
        "यह आपकी पूरी खेती सलाह है।",
        `आपकी वर्तमान फसल ${currentCrop} है।`,
        `सबसे अच्छा सुझाव ${bestCrop} है।`,
        topCrops ? `शीर्ष सुझाव हैं ${topCrops}।` : "",
        increase ? `अनुमानित मुनाफा लगभग ${increase} प्रतिशत तक बढ़ सकता है।` : "",
        result.insight,
        result.sustainability
      ]
        .filter(Boolean)
        .join(" ");
    }

    if (language === "pa") {
      return [
        "ਇਹ ਤੁਹਾਡੀ ਪੂਰੀ ਖੇਤੀ ਸਲਾਹ ਹੈ।",
        `ਤੁਹਾਡੀ ਮੌਜੂਦਾ ਫਸਲ ${currentCrop} ਹੈ।`,
        `ਸਭ ਤੋਂ ਵਧੀਆ ਸੁਝਾਅ ${bestCrop} ਹੈ।`,
        topCrops ? `ਮੁੱਖ ਸੁਝਾਅ ਹਨ ${topCrops}।` : "",
        increase ? `ਉਮੀਦਿਤ ਨਫਾ ਲਗਭਗ ${increase} ਪ੍ਰਤੀਸ਼ਤ ਤੱਕ ਵੱਧ ਸਕਦਾ ਹੈ।` : "",
        result.insight,
        result.sustainability
      ]
        .filter(Boolean)
        .join(" ");
    }

    return [
      copy.voiceIntro,
      `${copy.voiceTopCrops}: ${topCrops}.`,
      `${copy.voiceCurrentCrop}: ${currentCrop}.`,
      `${copy.voiceBestCrop}: ${bestCrop}.`,
      increase ? `Expected profit may rise by about ${increase} percent.` : "",
      result.insight,
      result.sustainability
    ]
      .filter(Boolean)
      .join(" ");
  }, [copy, result]);

  useEffect(() => {
    document.documentElement.lang = getSpeechLocale(language);
  }, [language]);

  useEffect(() => {
    if (firstLanguageRender.current) {
      firstLanguageRender.current = false;
      return;
    }

    if (lastFormData) {
      handleAnalyze(lastFormData, language, false);
    }
  }, [language]);

  async function handleAnalyze(formData, activeLanguage = language, remember = true) {
    setLoading(true);
    setError("");
    setResult(null);

    if (remember) {
      setLastFormData(formData);
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, language: activeLanguage })
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
      <Navbar
        language={language}
        languages={languageOptions}
        copy={copy}
        onLanguageChange={setLanguage}
      />

      <section className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-8 md:grid-cols-[minmax(20rem,0.92fr)_minmax(0,1.08fr)] md:px-8">
        <div className="space-y-6 self-start">
          <div className="rounded-[2rem] bg-white/80 p-6 shadow-soft ring-1 ring-mud/10">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-leaf">
              {copy.heroTag}
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-mud md:text-5xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-4 text-base leading-7 text-mud/75">
              {copy.heroBody}
            </p>
          </div>

          <InputForm onSubmit={handleAnalyze} disabled={loading} language={language} />
        </div>

        <div className="space-y-6">
          {loading && (
            <div className="rounded-[2rem] bg-white p-8 text-center shadow-soft">
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-field border-t-leaf" />
              <p className="text-xl font-bold text-leaf">{copy.analyzing}</p>
              <p className="mt-2 text-sm text-mud/70">{copy.loadingBody}</p>
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-800 shadow-soft">
              {error}
            </div>
          )}

          {!loading && !result && !error && (
            <div className="rounded-[2rem] bg-white/75 p-8 shadow-soft">
              <div className="text-harvest">
                <SunIcon className="h-10 w-10" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-leaf">{copy.readyTitle}</h2>
              <p className="mt-2 text-mud/70">
                {copy.readyBody}
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {result.recommended.map((crop) => (
                  <RecommendationCard
                    key={crop.crop}
                    crop={crop}
                    bestCrop={result.best_crop}
                    language={language}
                    copy={copy}
                  />
                ))}
              </div>

              <InsightBox
                text={result.insight}
                bestCrop={result.best_crop_label || result.best_crop}
                confidenceScore={result.confidence_score}
                confidenceLabel={result.confidence_label}
                confidenceReason={result.confidence_reason}
                copy={copy}
              />
              <SustainabilityBox text={result.sustainability} copy={copy} />
              <ProfitChart rows={result.comparison} language={language} copy={copy} />
              <ComparisonTable rows={result.comparison} language={language} copy={copy} />
              <VoiceButton
                text={voiceNarration || result.voice_text}
                language={getSpeechLocale(language)}
                playLabel={copy.voicePlay}
                pauseLabel={copy.voicePause}
                resumeLabel={copy.voiceResume}
                unsupportedMessage={copy.voiceUnsupported}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function extractIncrease(text) {
  const match = String(text || "").match(/(\d+(?:\.\d+)?)\s*%/);
  return match?.[1] || "";
}
