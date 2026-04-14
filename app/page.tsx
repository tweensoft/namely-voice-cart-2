"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CartItem } from "@/lib/types";

declare global {
  interface Window {
    webkitSpeechRecognition?: {
      new (): SpeechRecognition;
    };
    SpeechRecognition?: {
      new (): SpeechRecognition;
    };
  }

  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onstart: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
  }

  interface SpeechRecognitionEvent {
    resultIndex: number;
    results: {
      [index: number]: {
        isFinal?: boolean;
        0: {
          transcript: string;
        };
      };
      length: number;
    };
  }

  interface SpeechRecognitionErrorEvent {
    error: string;
  }
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[.,;:!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseVoiceInput(text: string): CartItem[] {
  const cleaned = normalizeText(text)
    .replace(/ og /g, ",")
    .replace(/ samt /g, ",")
    .replace(/ plus /g, ",");

  return cleaned
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((raw) => {
      const qtyMatch = raw.match(/^(\d+)\s+(.*)$/);
      if (qtyMatch) {
        return {
          id: crypto.randomUUID(),
          name: qtyMatch[2].trim(),
          quantity: Number(qtyMatch[1]),
          source: "voice" as const
        };
      }

      return {
        id: crypto.randomUUID(),
        name: raw,
        quantity: 1,
        source: "voice" as const
      };
    });
}

export default function HomePage() {
  const router = useRouter();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [message, setMessage] = useState("");
  const [manualItem, setManualItem] = useState("");
  const [items, setItems] = useState<CartItem[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "da-DK";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let next = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        next += `${event.results[i][0].transcript} `;
      }
      setTranscript(next.trim());
    };

    recognition.onstart = () => {
      setListening(true);
      setMessage("Lytter... sig fx: 2 bananer, mælk og rugbrød");
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setListening(false);
      setMessage(`Mikrofonfejl: ${event.error}`);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  const parsedPreview = useMemo(() => parseVoiceInput(transcript), [transcript]);

  function startListening() {
    recognitionRef.current?.start();
    setTranscript("");
  }

  function stopListening() {
    recognitionRef.current?.stop();
  }

  function addPreviewToList() {
    if (!parsedPreview.length) return;
    setItems((current) => [...current, ...parsedPreview]);
    setTranscript("");
    setMessage(`${parsedPreview.length} varelinjer tilføjet.`);
  }

  function addManualItem() {
    const name = manualItem.trim();
    if (!name) return;
    setItems((current) => [...current, { id: crypto.randomUUID(), name, quantity: 1, source: "manual" }]);
    setManualItem("");
  }

  function updateQuantity(id: string, delta: number) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  async function sendToNamely() {
    try {
      setBusy(true);
      setMessage("Matcher varer til nemlig.com...");
      const response = await fetch("/api/namely/search-and-build-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Kunne ikke matche varer.");

      sessionStorage.setItem("namelyMatches", JSON.stringify(result.matches));
      router.push("/review");
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Ukendt fejl";
      setMessage(messageText);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: 20 }}>
      <section style={{ display: "grid", gap: 10, marginBottom: 24 }}>
        <h1 style={{ fontSize: 34, margin: 0 }}>Stemmekurv til nemlig.com</h1>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
          Tal dine varer ind på mobilen, gennemgå dem, og send dem videre til en review-side klar til nemlig.com.
        </p>
      </section>

      {!supported && (
        <div style={{ background: "#fff7ed", color: "#9a3412", padding: 14, borderRadius: 16, marginBottom: 16 }}>
          Din browser understøtter ikke Web Speech API. Brug helst Chrome på mobilen.
        </div>
      )}

      <section style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: "white", padding: 18, borderRadius: 20, boxShadow: "0 10px 30px rgba(15,23,42,0.06)", display: "grid", gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Optag varer</h2>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={listening ? stopListening : startListening} style={buttonPrimary}>
              {listening ? "Stop optagelse" : "Start optagelse"}
            </button>
            <button onClick={addPreviewToList} disabled={!parsedPreview.length} style={buttonSecondary}>
              Tilføj til liste
            </button>
          </div>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 18, padding: 14, minHeight: 90, background: "#fff" }}>
            {transcript || "Din tale vises her..."}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {parsedPreview.length ? parsedPreview.map((item) => (
              <span key={item.id} style={badgeStyle}>{item.quantity} x {item.name}</span>
            )) : <span style={{ color: "#64748b" }}>Ingen varer fundet endnu.</span>}
          </div>
          {message && <div style={{ color: "#334155" }}>{message}</div>}
        </div>

        <div style={{ background: "white", padding: 18, borderRadius: 20, boxShadow: "0 10px 30px rgba(15,23,42,0.06)", display: "grid", gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Tilføj manuelt</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={manualItem} onChange={(e) => setManualItem(e.target.value)} placeholder="Fx avokado" style={inputStyle} />
            <button onClick={addManualItem} style={buttonSecondary}>Tilføj</button>
          </div>
          <p style={{ margin: 0, color: "#64748b", lineHeight: 1.6 }}>
            Tip: Sig fx “2 bananer, havremælk og rugbrød”. Antal foran varen bliver tolket automatisk.
          </p>
        </div>
      </section>

      <section style={{ background: "white", padding: 18, borderRadius: 20, boxShadow: "0 10px 30px rgba(15,23,42,0.06)", display: "grid", gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>Varer klar til match</h2>
        {!items.length && <div style={{ color: "#64748b" }}>Ingen varer endnu.</div>}
        {items.map((item) => (
          <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center", border: "1px solid #e2e8f0", borderRadius: 18, padding: 14 }}>
            <div>
              <div style={{ fontWeight: 600, textTransform: "capitalize" }}>{item.name}</div>
              <div style={{ color: "#64748b", fontSize: 14 }}>Kilde: {item.source === "voice" ? "Tale" : "Manuel"}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => updateQuantity(item.id, -1)} style={smallButton}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, 1)} style={smallButton}>+</button>
            </div>
            <button onClick={() => removeItem(item.id)} style={buttonGhost}>Slet</button>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
          <span style={{ color: "#475569" }}>{items.length} varelinjer klar</span>
          <button onClick={sendToNamely} disabled={!items.length || busy} style={buttonPrimary}>
            {busy ? "Arbejder..." : "Send til nemlig.com"}
          </button>
        </div>
      </section>
    </main>
  );
}

const buttonPrimary: React.CSSProperties = {
  border: 0,
  borderRadius: 16,
  padding: "12px 16px",
  background: "#0f172a",
  color: "white",
  cursor: "pointer"
};

const buttonSecondary: React.CSSProperties = {
  border: "1px solid #cbd5e1",
  borderRadius: 16,
  padding: "12px 16px",
  background: "white",
  color: "#0f172a",
  cursor: "pointer"
};

const buttonGhost: React.CSSProperties = {
  border: 0,
  borderRadius: 12,
  padding: "10px 12px",
  background: "#f1f5f9",
  color: "#0f172a",
  cursor: "pointer"
};

const smallButton: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "white",
  cursor: "pointer"
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  border: "1px solid #cbd5e1",
  borderRadius: 16,
  padding: "12px 14px",
  minWidth: 0
};

const badgeStyle: React.CSSProperties = {
  background: "#e2e8f0",
  color: "#0f172a",
  borderRadius: 999,
  padding: "8px 12px",
  fontSize: 14
};
