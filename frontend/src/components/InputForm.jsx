import { useState } from "react";

const initialForm = {
  soil: "loamy",
  location: "UP",
  season: "kharif",
  current_crop: "Wheat"
};

export default function InputForm({ onSubmit, disabled }) {
  const [form, setForm] = useState(initialForm);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={submit} className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-mud/10">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-field text-xl" aria-hidden="true">
          🌾
        </span>
        <div>
          <h2 className="text-xl font-bold text-mud">Your Crop</h2>
          <p className="text-sm text-mud/60">Tell us about your farm conditions.</p>
        </div>
      </div>

      <div className="grid gap-4">
        <Field label="Soil Type" name="soil" value={form.soil} onChange={updateField} />
        <Field label="Location" name="location" value={form.location} onChange={updateField} />
        <Field label="Season" name="season" value={form.season} onChange={updateField} />
        <Field label="Current Crop" name="current_crop" value={form.current_crop} onChange={updateField} />
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="mt-6 w-full rounded-2xl bg-leaf px-5 py-4 text-base font-bold text-white shadow-soft transition hover:bg-leaf/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {disabled ? "Analyzing your farm..." : "Find Best Suggestion"}
      </button>
    </form>
  );
}

function Field({ label, name, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-mud">{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-mud/15 bg-beige/60 px-4 py-3 text-mud outline-none transition focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/10"
      />
    </label>
  );
}
