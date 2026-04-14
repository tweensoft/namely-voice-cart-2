import { MatchResult, CartItem } from "./types";

function normalize(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const preferredMappings: Record<string, { suggestedProductName: string; confidence: MatchResult["confidence"]; note?: string }> = {
  "mælk": { suggestedProductName: "Letmælk 1L", confidence: "medium", note: "Generisk mælk kan betyde flere varianter." },
  "havremælk": { suggestedProductName: "Havredrik 1L", confidence: "high" },
  "bananer": { suggestedProductName: "Bananer, øko", confidence: "high" },
  "rugbrød": { suggestedProductName: "Rugbrød", confidence: "high" },
  "æg": { suggestedProductName: "Æg str. M/L", confidence: "medium" },
  "smør": { suggestedProductName: "Smør", confidence: "medium" },
  "kaffe": { suggestedProductName: "Kaffe 400-500 g", confidence: "medium" }
};

export function buildSearchUrl(name: string) {
  return `https://www.nemlig.com/soeg?query=${encodeURIComponent(name)}`;
}

export function matchItems(items: CartItem[]): MatchResult[] {
  return items.map((item) => {
    const key = normalize(item.name);
    const mapping = preferredMappings[key];

    return {
      requestedName: item.name,
      quantity: item.quantity,
      confidence: mapping?.confidence ?? "low",
      suggestedProductName: mapping?.suggestedProductName ?? item.name,
      searchUrl: buildSearchUrl(mapping?.suggestedProductName ?? item.name),
      note: mapping?.note ?? (mapping ? undefined : "Ingen sikker favorit endnu. Gennemgå søgningen manuelt.")
    };
  });
}
