import { useEffect, useRef, useState } from "react";

export default function VoiceButton({
  text,
  language,
  playLabel,
  pauseLabel,
  resumeLabel,
  unsupportedMessage
}) {
  const synthRef = useRef(null);
  const sessionRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    synthRef.current = window.speechSynthesis || null;
    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  useEffect(() => {
    synthRef.current?.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, [language, text]);

  async function handlePlay() {
    const synth = synthRef.current;
    if (!synth) {
      alert(unsupportedMessage);
      return;
    }

    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    const script = String(text || "").trim();
    if (!script) {
      return;
    }

    sessionRef.current += 1;
    const sessionId = sessionRef.current;
    setIsPlaying(true);
    setIsPaused(false);

    const voices = await loadVoices(synth);
    const selectedVoice = pickVoice(voices, language);
    const segments = splitIntoSegments(script);

    synth.cancel();

    for (const segment of segments) {
      if (sessionId !== sessionRef.current) {
        return;
      }

      await speakSegment(synth, segment, language, selectedVoice, sessionId, sessionRef);
    }

    if (sessionId === sessionRef.current) {
      setIsPlaying(false);
      setIsPaused(false);
    }
  }

  function handlePause() {
    const synth = synthRef.current;
    if (!synth || !isPlaying || isPaused) {
      return;
    }

    synth.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }

  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-soft ring-1 ring-mud/10">
      <div className="grid gap-3 md:grid-cols-2">
        <button
          onClick={handlePlay}
          className="w-full rounded-2xl bg-mud px-5 py-4 font-bold text-beige transition hover:bg-mud/90"
        >
          {isPaused ? resumeLabel : playLabel}
        </button>
        <button
          onClick={handlePause}
          disabled={!isPlaying}
          className="w-full rounded-2xl border border-mud/15 bg-beige/55 px-5 py-4 font-bold text-mud transition hover:bg-beige disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pauseLabel}
        </button>
      </div>
    </div>
  );
}

function loadVoices(synth) {
  return new Promise((resolve) => {
    const startedAt = Date.now();

    const tryResolve = () => {
      const voices = synth.getVoices();
      if (voices.length > 0 || Date.now() - startedAt > 3000) {
        synth.removeEventListener("voiceschanged", tryResolve);
        resolve(voices);
        return;
      }
      window.setTimeout(tryResolve, 250);
    };

    synth.addEventListener("voiceschanged", tryResolve);
    tryResolve();
  });
}

function pickVoice(voices, language) {
  if (!voices.length) {
    return null;
  }

  const target = String(language || "").toLowerCase();
  const exact = voices.find((voice) => voice.lang?.toLowerCase() === target);
  if (exact) {
    return exact;
  }

  const prefix = target.split("-")[0];
  const familyMatch = voices.find((voice) => voice.lang?.toLowerCase().startsWith(prefix));
  if (familyMatch) {
    return familyMatch;
  }

  const nameHint = prefix === "hi" ? "hindi" : prefix === "pa" ? "punjabi" : null;
  if (nameHint) {
    const byName = voices.find((voice) => voice.name?.toLowerCase().includes(nameHint));
    if (byName) {
      return byName;
    }
  }

  return null;
}

function splitIntoSegments(text) {
  return text
    .replace(/[:]/g, ". ")
    .split(/(?<=[.!?।])\s+|,\s+/u)
    .map((part) => normalizeSpeechText(part, text))
    .flatMap((part) => splitLongSegment(part))
    .filter(Boolean);
}

function speakSegment(synth, text, language, voice, sessionId, sessionRef) {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language || "en-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    if (voice) {
      utterance.voice = voice;
    }
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    if (sessionId !== sessionRef.current) {
      resolve();
      return;
    }

    synth.speak(utterance);
  });
}

function normalizeSpeechText(text, fullText) {
  const sample = String(fullText || "");
  const percentWord = containsPunjabi(sample) ? "ਪ੍ਰਤੀਸ਼ਤ" : containsHindi(sample) ? "प्रतिशत" : "percent";
  const rupeeWord = containsPunjabi(sample) ? "ਰੁਪਏ" : containsHindi(sample) ? "रुपये" : "rupees";
  const hectareWord = containsPunjabi(sample) ? "ਹੈਕਟੇਅਰ" : containsHindi(sample) ? "हेक्टेयर" : "hectare";

  return String(text || "")
    .replace(/%/g, ` ${percentWord} `)
    .replace(/₹/g, ` ${rupeeWord} `)
    .replace(/\bINR\b/gi, ` ${rupeeWord} `)
    .replace(/\bha\b/gi, ` ${hectareWord} `)
    .replace(/\s+/g, " ")
    .trim();
}

function splitLongSegment(text) {
  const words = String(text || "").split(" ").filter(Boolean);
  if (words.length <= 10) {
    return [text];
  }

  const segments = [];
  for (let index = 0; index < words.length; index += 10) {
    segments.push(words.slice(index, index + 10).join(" "));
  }
  return segments;
}

function containsHindi(text) {
  return /[\u0900-\u097F]/u.test(String(text || ""));
}

function containsPunjabi(text) {
  return /[\u0A00-\u0A7F]/u.test(String(text || ""));
}
