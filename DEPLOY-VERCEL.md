# Deploy til Vercel

## 1. Opret repo på GitHub
Opret et nyt tomt repo med navnet `namely-voice-cart`.

## 2. Push projektet op
```bash
git init
git add .
git commit -m "Initial commit: namely voice cart"
git branch -M main
git remote add origin https://github.com/DIT-BRUGERNAVN/namely-voice-cart.git
git push -u origin main
```

## 3. Importér i Vercel
- Log ind på Vercel
- Klik **Add New -> Project**
- Vælg repoet `namely-voice-cart`
- Klik **Deploy**

## 4. Tilføj miljøvariabler
Under **Settings -> Environment Variables**:

- `ENABLE_NAMELY_AUTOMATION=false`
- `NAMELY_HEADLESS=true`

## 5. Deploy igen hvis du ændrer env vars
Når du ændrer miljøvariabler, så lav en ny deploy fra Vercel eller push en ny commit.

## 6. Test
- Åbn forsiden på mobilen
- Brug Chrome
- Sig fx: `2 bananer, mælk og rugbrød`
- Tryk `Tilføj til liste`
- Tryk `Send til nemlig.com`
