---
session_id: SIZ-20260422-1200
date: 2026-04-22
time: 12:00 UTC
project: AtlasOS
agent: SessionCloseoutAgent
version: 1.0
current_phase: Phase 1 — Core Feature Sprint (Complete)
---

# Gemini Context — Atlas OS

Read this at the start of every Atlas OS session.

## Project Identity
Atlas OS is a browser-based desktop OS simulation built by itzzzshxdow for TheSizCorporation. It is a standalone project separate from discord-bot, siznexus-development, and IntellectualOS.

- **Local path:** `/home/itzzzshxdow/atlas-os/`
- **GitHub remote:** `https://github.com/shxdowxxx/AtlasOS.git`
- **Branch:** `main`
- **No build step** — served via `python3 -m http.server 3000`
- **Firebase project:** `atlasos-c61b0`

## Primary Files
- `index.html` — DOM structure, CDN includes (html2canvas, Firebase v10.12.2)
- `system.js` — OS core: desktop icons, keyboard shortcuts, wallpaper/theme persistence, sound engine, presence wiring, auth state handler
- `apps.js` — All app windows: terminal (VFS, commands, tab completion, screenshot), Sentinel Chat, Settings, SysInfo, File Browser, and all others
- `styles.css` — All styling: desktop icons, app windows, Sentinel chat, Settings tabs, dock, hub
- `firebase-config.js` — Firebase initialization, Auth SDK, Firestore Presence system
- `firestore.rules` — Security rules (anonymous presence write allowed via `anon-*` pattern)

## Design Constraints
- **Aesthetic:** Crimson/midnight cyberpunk. Primary accent: `--red-neon: #FF3131`. Dark backgrounds, neon glow, scanline overlays.
- **No external audio files** — all sounds are Web Audio API synthesis only.
- **No bundler, no framework** — vanilla HTML/CSS/JS only. Any new dependency must load via CDN.
- **No email/password auth** — Firebase Auth is Google popup only.

## Current Feature Set (as of 2026-04-22)
1. Wallpaper and theme persistence (localStorage)
2. Global keyboard shortcuts (9 bindings)
3. Desktop icons — 7 shortcuts, left-edge placement
4. Clearance-gated VFS files (EXECUTIVE / ROOT tiers)
5. Sentinel Chat app (keyword-driven neural advisory)
6. Ambient sound engine (Web Audio API)
7. Settings app (Identity / Display / Sound / System tabs)
8. Firebase Auth (Google sign-in, operator name auto-fill)
9. Firebase Presence (anonymous + authenticated, HUD + hub counter)
10. Tab completion (commands + VFS filenames)
11. Screenshot command (html2canvas, PNG download)
12. README (lore-style)

## VFS Clearance Model
Three locked files in the VFS map:
- `encrypted_vault.txt` — requires EXECUTIVE clearance
- `kernel.atlas` — requires ROOT clearance
- `ops_directive.sys` — requires EXECUTIVE clearance

`ls` renders padlock glyphs for locked files. `cat` checks operator clearance before returning content.

## Pending Director Action
Firestore rules must be deployed to Firebase console (project: `atlasos-c61b0`) to enable anonymous presence writes. File is at `firestore.rules` in the repo root.

## What Gemini Should Prioritize Next Session
- Confirm Firestore rules are deployed before attempting any presence debugging.
- If adding new apps: follow the pattern in `apps.js` (register in `APPS` object, wire to dock/hub/desktop icons as appropriate).
- If adding new keyboard shortcuts: wire in `system.js` `initKeyboardShortcuts()`.
- If adding new VFS files: add to the VFS map in `apps.js`, set a `clearance` property if gating is desired.
- Preserve the no-bundler constraint — all new libraries must be CDN-loaded.
- Note: Gemini implemented Features 9–12 this sprint and the two bug fixes. Claude implemented Features 1–8.
