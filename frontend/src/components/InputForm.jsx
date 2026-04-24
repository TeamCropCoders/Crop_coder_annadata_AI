import { useEffect, useRef, useState } from "react";
import { CropIcon } from "./Icons.jsx";
import MapPlotSelector from "./MapPlotSelector.jsx";
import {
  fieldOrder,
  getFieldHint,
  getFieldLabel,
  getFieldPrompt,
  getOptionLabel,
  getOptionsForField,
  getSpeechLocale,
  getUiCopy,
  initialForm,
  resolveOption
} from "../data/formOptions.js";

export default function InputForm({ onSubmit, disabled, language }) {
  const copy = getUiCopy(language);
  const [form, setForm] = useState(initialForm);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [busyField, setBusyField] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
      window.speechSynthesis?.cancel?.();
    };
  }, []);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  async function handleVoiceField(field) {
    try {
      setBusyField(field);
      const access = await ensureMicrophoneAccess();
      if (!access.ok) {
        setVoiceStatus(access.message);
        return;
      }
      const resolved = await captureFieldByVoice(field);
      if (!resolved) {
        return;
      }
      setVoiceStatus(
        `${copy.voiceMatched}: ${getFieldLabel(field, language)} - ${getOptionLabel(field, resolved, language)}`
      );
    } finally {
      setBusyField("");
    }
  }

  async function handleVoiceForm() {
    setBusyField("all");
    setVoiceStatus("");

    try {
      const access = await ensureMicrophoneAccess();
      if (!access.ok) {
        setVoiceStatus(access.message);
        return;
      }

      for (const field of fieldOrder) {
        const resolved = await captureFieldByVoice(field);
        if (!resolved) {
          setVoiceStatus(copy.voiceCancelled);
          return;
        }
      }
      setVoiceStatus(copy.voiceDone);
    } finally {
      setBusyField("");
    }
  }

  async function captureFieldByVoice(field) {
    if (!supportsVoiceInput()) {
      alert(copy.voiceUnsupported);
      return null;
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const prompt = getFieldPrompt(field, language);
      setVoiceStatus(prompt);
      await speakText(prompt, language);
      await wait(250);

      try {
        setVoiceStatus(`${copy.voiceListening}: ${getFieldLabel(field, language)}`);
        const heardText = await listenForSpeech(language);
        const resolved = resolveOption(field, heardText);
        if (resolved) {
          updateField(field, resolved);
          return resolved;
        }
        setVoiceStatus(copy.voiceRetry);
        await speakText(copy.voiceRetry, language);
      } catch (error) {
        setVoiceStatus(resolveVoiceErrorMessage(error, copy));
        return null;
      }
    }

    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-mud/10">
      <div className="mb-5 flex items-center gap-3">
        <span
          className="grid h-10 w-10 place-items-center rounded-2xl bg-field text-leaf"
          aria-hidden="true"
        >
          <CropIcon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-mud">{copy.formTitle}</h2>
          <p className="text-sm text-mud/60">{copy.formBody}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleVoiceForm}
        disabled={disabled || !!busyField}
        className="mb-5 w-full rounded-2xl border border-leaf/20 bg-field/50 px-5 py-4 text-base font-bold text-leaf transition hover:bg-field/70 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {copy.voiceFill}
      </button>

      {voiceStatus && (
        <div className="mb-5 rounded-2xl bg-beige/70 px-4 py-3 text-sm text-mud">{voiceStatus}</div>
      )}

      <div className="mb-5">
        <MapPlotSelector
          language={language}
          copy={copy}
          locationValue={form.location}
          onLocationChange={(value) => updateField("location", value)}
        />
      </div>

      <div className="grid gap-4">
        {fieldOrder.map((field) => (
          <SelectField
            key={field}
            field={field}
            value={form[field]}
            onChange={(value) => updateField(field, value)}
            options={getOptionsForField(field, language)}
            label={getFieldLabel(field, language)}
            hint={getFieldHint(field, language)}
            onVoice={() => handleVoiceField(field)}
            voiceLabel={copy.voiceField}
            listening={busyField === field || busyField === "all"}
            disabled={disabled || !!busyField}
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={disabled || !!busyField}
        className="mt-6 w-full rounded-2xl bg-leaf px-5 py-4 text-base font-bold text-white shadow-soft transition hover:bg-leaf/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {disabled ? copy.analyzing : copy.analyze}
      </button>
    </form>
  );

  function supportsVoiceInput() {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function listenForSpeech(activeLanguage) {
    return new Promise((resolve, reject) => {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) {
        reject(new Error("Speech recognition unavailable"));
        return;
      }

      recognitionRef.current?.stop?.();

      const recognition = new Recognition();
      recognitionRef.current = recognition;
      recognition.lang = getSpeechLocale(activeLanguage);
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;
      recognition.serviceURI = "";

      const failSafely = window.setTimeout(() => {
        try {
          recognition.stop();
        } catch {}
        reject(new Error("timeout"));
      }, 8000);

      recognition.onresult = (event) => {
        window.clearTimeout(failSafely);
        const transcript = event.results?.[0]?.[0]?.transcript || "";
        resolve(transcript);
      };
      recognition.onerror = (event) => {
        window.clearTimeout(failSafely);
        reject(new Error(event.error || "Speech recognition failed"));
      };
      recognition.onnomatch = () => {
        window.clearTimeout(failSafely);
        reject(new Error("no-speech"));
      };
      recognition.onend = () => {
        window.clearTimeout(failSafely);
        recognitionRef.current = null;
      };

      recognition.start();
    });
  }

  function speakText(text, activeLanguage) {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !text) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getSpeechLocale(activeLanguage);
      utterance.rate = 0.92;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  }

  async function ensureMicrophoneAccess() {
    if (!navigator.mediaDevices?.getUserMedia) {
      return { ok: true };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      return { ok: true };
    } catch {
      return { ok: false, message: copy.voicePermissionDenied };
    }
  }
}

function SelectField({
  value,
  onChange,
  options,
  label,
  hint,
  onVoice,
  voiceLabel,
  listening,
  disabled
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="block text-sm font-bold text-mud">{label}</span>
        <button
          type="button"
          onClick={onVoice}
          disabled={disabled}
          className="rounded-full border border-mud/10 bg-white px-3 py-1 text-xs font-bold text-leaf transition hover:bg-field/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {listening ? `${voiceLabel}...` : voiceLabel}
        </button>
      </div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-2xl border border-mud/15 bg-beige/60 px-4 py-3 text-mud outline-none transition focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="mt-2 block text-xs text-mud/60">{hint}</span>
    </label>
  );
}

function wait(duration) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

function resolveVoiceErrorMessage(error, copy) {
  const value = String(error?.message || "");
  if (value.includes("not-allowed") || value.includes("service-not-allowed")) {
    return copy.voicePermissionDenied;
  }
  if (value.includes("no-speech") || value.includes("audio-capture") || value.includes("timeout")) {
    return copy.voiceNoSpeech;
  }
  return copy.voiceError;
}
