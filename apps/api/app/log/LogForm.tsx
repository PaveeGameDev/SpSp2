"use client";

import { OUTCOMES, type ActivityTypeDTO, type CreateLogResponse, type OutcomeKey } from "@sponsor/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = "pick" | "detail";

const emptyForm = { companyName: "", contactName: "", outcome: "" as OutcomeKey | "", notes: "" };

export function LogForm({ activityTypes }: { activityTypes: ActivityTypeDTO[] }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("pick");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [companies, setCompanies] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const selected = activityTypes.find((a) => a.key === selectedKey) ?? null;
  const online = activityTypes.filter((a) => a.category === "online");
  const inPerson = activityTypes.filter((a) => a.category === "in_person");

  function pick(key: string) {
    setSelectedKey(key);
    setStep("detail");
  }

  async function onCompanyChange(value: string) {
    setForm((f) => ({ ...f, companyName: value }));
    if (value.trim().length < 2) {
      setCompanies([]);
      return;
    }
    const res = await fetch(`/api/logs/companies?q=${encodeURIComponent(value.trim())}`);
    if (res.ok) setCompanies(await res.json());
  }

  async function submit(after: "home" | "another") {
    if (!selected) return;
    if (!form.companyName.trim() || !form.outcome) {
      setError("Company name and outcome are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityType: selected.key,
          companyName: form.companyName.trim(),
          contactName: form.contactName.trim() || undefined,
          outcome: form.outcome,
          notes: form.notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      const result = data as CreateLogResponse;
      setToast(`+${result.log.points} points${result.tierCrossed ? ` 🎉 ${result.tierCrossed} tier!` : ""}`);

      if (after === "home") {
        router.push("/");
        router.refresh();
      } else {
        setForm(emptyForm);
        setCompanies([]);
        setSelectedKey(null);
        setStep("pick");
        setTimeout(() => setToast(null), 2500);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "pick") {
    return (
      <div>
        {toast && <p style={{ color: "#16a34a", fontWeight: 600, marginBottom: 16 }}>{toast}</p>}
        <h2 style={{ marginBottom: 8 }}>Online</h2>
        <div className="activity-grid" style={{ marginBottom: 24 }}>
          {online.map((a) => (
            <button key={a.key} className="activity-card" onClick={() => pick(a.key)}>
              <span>{a.label}</span>
              <span className="badge">{a.points} pts</span>
            </button>
          ))}
        </div>
        <h2 style={{ marginBottom: 8 }}>In Person</h2>
        <div className="activity-grid">
          {inPerson.map((a) => (
            <button key={a.key} className="activity-card" onClick={() => pick(a.key)}>
              <span>{a.label}</span>
              <span className="badge">{a.points} pts</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="muted" style={{ marginBottom: 16, background: "none", border: "none", cursor: "pointer" }} onClick={() => setStep("pick")}>
        ← Back
      </button>
      <h2 style={{ marginBottom: 16 }}>
        {selected?.label} · {selected?.points} pts
      </h2>

      <div className="form-field">
        <label htmlFor="companyName">Company / organization *</label>
        <input
          id="companyName"
          list="company-suggestions"
          value={form.companyName}
          onChange={(e) => onCompanyChange(e.target.value)}
        />
        <datalist id="company-suggestions">
          {companies.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div className="form-field">
        <label htmlFor="contactName">Contact name</label>
        <input
          id="contactName"
          value={form.contactName}
          onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
        />
      </div>

      <div className="form-field">
        <label htmlFor="outcome">Outcome *</label>
        <select
          id="outcome"
          value={form.outcome}
          onChange={(e) => setForm((f) => ({ ...f, outcome: e.target.value as OutcomeKey }))}
        >
          <option value="">Select an outcome…</option>
          {OUTCOMES.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          rows={3}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>

      {error && <p className="error-text" style={{ marginBottom: 12 }}>{error}</p>}

      <div style={{ display: "flex", gap: 12 }}>
        <button className="button button-primary" disabled={submitting} onClick={() => submit("home")}>
          Save & Home
        </button>
        <button className="button" disabled={submitting} onClick={() => submit("another")}>
          Save & Log Another
        </button>
      </div>
    </div>
  );
}
