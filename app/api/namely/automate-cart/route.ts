import { chromium } from "playwright";
import { z } from "zod";

const RequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  matches: z.array(z.object({
    requestedName: z.string(),
    suggestedProductName: z.string(),
    searchUrl: z.string().url(),
    quantity: z.number().int().positive()
  })).min(1)
});

export async function POST(req: Request) {
  if (process.env.ENABLE_NAMELY_AUTOMATION !== "true") {
    return Response.json({
      ok: false,
      error: "Automation er slået fra. Sæt ENABLE_NAMELY_AUTOMATION=true for at aktivere route'en."
    }, { status: 400 });
  }

  const parsed = RequestSchema.parse(await req.json());
  const browser = await chromium.launch({ headless: process.env.NAMELY_HEADLESS !== "false" });
  const page = await browser.newPage();

  try {
    await page.goto("https://www.nemlig.com/login", { waitUntil: "domcontentloaded" });

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    await emailInput.first().fill(parsed.email);
    await passwordInput.first().fill(parsed.password);

    const submitButton = page.locator('button[type="submit"], button:has-text("Log ind"), button:has-text("Login")').first();
    await submitButton.click();
    await page.waitForLoadState("networkidle");

    for (const match of parsed.matches) {
      await page.goto(match.searchUrl, { waitUntil: "domcontentloaded" });

      const addButton = page.locator('[data-testid="add-to-cart"], button:has-text("Tilføj"), button:has-text("Læg i kurv")').first();
      const buttonCount = await addButton.count();
      if (buttonCount === 0) {
        throw new Error(`Kunne ikke finde tilføj-knap for ${match.requestedName}. Justér selectors i automate-cart route.`);
      }

      for (let i = 0; i < match.quantity; i += 1) {
        await addButton.click();
        await page.waitForTimeout(300);
      }
    }

    return Response.json({
      ok: true,
      message: "Automation gennemført. Åbn nemlig.com og tjek kurven.",
      checkoutUrl: "https://www.nemlig.com/"
    });
  } catch (error) {
    return Response.json({
      ok: false,
      error: error instanceof Error ? error.message : "Automation mislykkedes"
    }, { status: 500 });
  } finally {
    await browser.close();
  }
}
