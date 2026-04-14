"use client";

import { useEffect, useMemo, useState } from "react";
import type { MatchResult } from "@/lib/types";

export default function ReviewPage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("namelyMatches");
    if (!raw) return;
    try {
      setMatches(JSON.parse(raw));
    } catch {
      setMatches([]);
    }
  }, []);

  const readyCount = useMemo(() => matches.filter((m) => m.confidence !== "low").length, [matches]);

  async function automateCart() {
    try {
      setBusy(true);
      setMessage("Starter browser-automation...");
      const response = await fetch("/api/namely/automate-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matches, email, password })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Automation mislykkedes");
      setMessage(result.message || "Kurv-forløb startet.");
      if (result.checkoutUrl) window.open(result.checkoutUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ukendt fejl");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: 20, display: "grid", gap: 16 }}>
      <section style={{ display: "grid", gap: 8 }}>
        <h1 style={{ fontSize: 34, margin: 0 }}>Gennemgå dine match</h1>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
          Her ser du forslag til nemlig.com. Varer med lav sikkerhed bør du åbne manuelt og tjekke først.
        </p>
      </section>

      <section style={{ background: "white", padding: 18, borderRadius: 20, boxShadow: "0 10px 30px rgba(15,23,42,0.06)", display: "grid", gap: 12 }}>
        <div style={{ color: "#334155" }}>{readyCount} af {matches.length} varer har medium eller høj sikkerhed.</div>
        {matches.map((match, index) => (
          <div key={`${match.requestedName}-${index}`} style={{ border: "1px solid #e2e8f0", borderRadius: 18, padding: 14, display: "grid", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <strong>{match.quantity} x {match.requestedName}</strong>
              <span style={{ color: match.confidence === "high" ? "#166534" : match.confidence === "medium" ? "#92400e" : "#991b1b" }}>
                {match.confidence.toUpperCase()}
              </span>
            </div>
            <div>Forslag: {match.suggestedProductName}</div>
            {match.note && <div style={{ color: "#64748b" }}>{match.note}</div>}
            <a href={match.searchUrl} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>
              Åbn søgning på nemlig.com
            </a>
          </div>
        ))}
      </section>

      <section style={{ background: "white", padding: 18, borderRadius: 20, boxShadow: "0 10px 30px rgba(15,23,42,0.06)", display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>Optional: forsøg automatisk kurv</h2>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
          Denne del kræver live selectors og kan ændre sig, hvis nemlig.com ændrer layout. Brug helst en testkonto først.
        </p>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nemlig e-mail" style={inputStyle} />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nemlig password" type="password" style={inputStyle} />
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={automateCart} disabled={!matches.length || !email || !password || busy} style={buttonPrimary}>
            {busy ? "Arbejder..." : "Forsøg automatisk kurv"}
          </button>
          <a href="/" style={buttonLink}>Tilbage</a>
        </div>
        {message && <div style={{ color: "#334155" }}>{message}</div>}
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1px solid #cbd5e1",
  borderRadius: 16,
  padding: "12px 14px"
};

const buttonPrimary: React.CSSProperties = {
  border: 0,
  borderRadius: 16,
  padding: "12px 16px",
  background: "#0f172a",
  color: "white",
  cursor: "pointer"
};

const buttonLink: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 16,
  padding: "12px 16px",
  background: "#e2e8f0",
  color: "#0f172a"
};
