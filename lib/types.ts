export type CartItem = {
  id: string;
  name: string;
  quantity: number;
  source: "voice" | "manual";
};

export type MatchResult = {
  requestedName: string;
  quantity: number;
  confidence: "high" | "medium" | "low";
  searchUrl: string;
  suggestedProductName: string;
  note?: string;
};
