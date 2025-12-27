<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LiberiaStream

A Liberian movies & series streaming app built with React + Vite.

Live: https://liberiastream.vercel.app/

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies
   npm install
2. Set env (optional for AI recommendations)
   - Create .env.local
   - VITE_GEMINI_API_KEY=your_key
3. Run dev server
   npm run dev

## Deploy (Vercel)
- Import the repo in Vercel → New Project
- Framework: Vite; Build: npm run build; Output: dist
- Add Environment Variable (optional): VITE_GEMINI_API_KEY
- PWA: manifest.webmanifest, icons under public/icons, service worker at public/sw.js
- SPA routing: vercel.json rewrites to /

## PWA
- Installable on desktop/mobile; versioned SW auto-updates with banner
- Offline fallback at /offline.html; static and image caching strategies
- Icons: 192/256/384/512 PNGs + 512 maskable; Apple touch icon linked

## Saved (formerly Downloads)
- “Save for later” replaces downloads; menu label is “Saved”
- Saved items stored in localStorage (ls_saved)
- Saved page lists items; remove to unsave
