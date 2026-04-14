import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Namely Voice Cart",
  description: "Tal dine varer ind og gør dem klar til nemlig.com"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  );
}
