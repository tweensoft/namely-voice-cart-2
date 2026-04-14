# Namely Voice Cart

Mobilvenlig Next.js-app, hvor brugeren kan tale varer ind, få dem matchet til nemlig.com og derefter gennemgå forslagene før et eventuelt automation-flow.

## Hvad projektet kan nu
- Tale-til-tekst i browseren
- Manuel redigering af varer og antal
- Backend-route som matcher varer til nemlig-søgninger
- Review-side med forslag og direkte søgelinks
- Optional Playwright-route til at prøve automatisk kurv

## Vigtigt før du deployer
- **Det sikre flow er match + review.**
- **Automation-flowet er eksperimentelt** og afhænger af nemlig.coms aktuelle selectors og login-flow.
- Brug helst en testkonto først, hvis du vil tænde automation.

## Krav
- Node.js 20 eller nyere
- npm
- GitHub-konto
- Vercel-konto

## Kør lokalt
```bash
npm install
npx playwright install chromium
npm run dev
```

Åbn derefter `http://localhost:3000`.

## Miljøvariabler
Kopiér `.env.example` til `.env.local` lokalt:

```bash
cp .env.example .env.local
```

Standardværdier:

```bash
ENABLE_NAMELY_AUTOMATION=false
NAMELY_HEADLESS=true
```

## Copy-paste: upload til GitHub
Kør disse kommandoer i projektmappen:

```bash
git init
git add .
git commit -m "Initial commit: namely voice cart"
git branch -M main
git remote add origin https://github.com/DIT-BRUGERNAVN/namely-voice-cart.git
git push -u origin main
```

Erstat `DIT-BRUGERNAVN` med dit GitHub-brugernavn, og opret repoet på GitHub først.

## Trin for trin: deploy til Vercel
1. Log ind på Vercel.
2. Klik **Add New -> Project**.
3. Vælg dit GitHub-repo.
4. Lad framework stå som **Next.js**.
5. Klik **Deploy**.

Når projektet er oprettet, kan du tilføje miljøvariabler i **Project Settings -> Environment Variables**:

- `ENABLE_NAMELY_AUTOMATION=false`
- `NAMELY_HEADLESS=true`

Hvis du vil prøve automation senere, ændrer du `ENABLE_NAMELY_AUTOMATION` til `true` og laver en ny deploy.

## Vercel CLI
Du kan også deploye fra terminalen:

```bash
npm i -g vercel
vercel
```

For at hente miljøvariabler ned lokalt bagefter:

```bash
vercel env pull
```

## API-ruter
- `POST /api/namely/search-and-build-cart`
- `POST /api/namely/automate-cart`

## Projektstruktur
```text
app/
  api/namely/search-and-build-cart/route.ts
  api/namely/automate-cart/route.ts
  review/page.tsx
  page.tsx
lib/
  namely.ts
  types.ts
```

## Kendte begrænsninger
- Web Speech API virker bedst i Chrome på mobil.
- Safari kan være ustabil til taleinput.
- Automation-routen kan kræve selector-justeringer efter første live test.
- Der er ikke koblet et officielt offentligt kurv-API på her.

## Anbefalet næste version
- Brugerprofiler med favoritprodukter
- Bedre matchlogik for generiske varer som "mælk" og "kaffe"
- Manuel godkendelse før automation
- Logging af fejl ved selectors
