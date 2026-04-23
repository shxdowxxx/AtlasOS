---
session_id: SIZ-20260423-0000
date: 2026-04-23
time: 00:00 UTC
project: AtlasOS
agent: SessionCloseoutAgent
version: 1.0
current_phase: Phase 1 — Polish & Expansion (Complete — transitioning to Phase 2 ideation)
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
- **Last commit:** `2357b01`

## Primary Files
- `index.html` — DOM structure, CDN includes (html2canvas, Firebase v10.12.2), taskbar div
- `system.js` — OS core: desktop icons, keyboard shortcuts, wallpaper/theme persistence, sound engine, presence wiring, auth state handler, `initTaskbar()`, `initHUD()`, `startDrag()` with snapping
- `apps.js` — All app windows: terminal (VFS, commands, tab completion, screenshot, mission system), Sentinel Chat, Settings, SysInfo, File Browser, and all others
- `styles.css` — All styling: desktop icons, app windows, Sentinel chat, Settings tabs, dock, hub, taskbar, boot progress bar, maximized window overrides
- `firebase-config.js` — Firebase initialization, Auth SDK, Firestore Presence system (caches count to `window.AtlasPresenceCount`)
- `firestore.rules` — Security rules (anonymous presence write allowed via `anon-*` pattern — deployed to Firebase console)

## Design Constraints
- **Aesthetic:** Crimson/midnight cyberpunk. Primary accent: `--red-neon: #FF3131`. Dark backgrounds, neon glow, scanline overlays.
- **No external audio files** — all sounds are Web Audio API synthesis only.
- **No bundler, no framework** — vanilla HTML/CSS/JS only. Any new dependency must load via CDN.
- **No email/password auth** — Firebase Auth is Google popup only.

## Current Feature Set (as of 2026-04-23)

### Phase 1 — Original 12 Features
1. Wallpaper and theme persistence (localStorage)
2. Global keyboard shortcuts (9 bindings)
3. Desktop icons — 7 shortcuts, left-edge placement
4. Clearance-gated VFS files (EXECUTIVE / ROOT tiers)
5. Sentinel Chat app (keyword-driven neural advisory)
6. Ambient sound engine (Web Audio API)
7. Settings app (Identity / Display / Sound / System tabs)
8. Firebase Auth (Google sign-in, operator name auto-fill)
9. Firebase Presence (anonymous + authenticated, HUD + hub counter) — Firestore rules deployed
10. Tab completion (commands + VFS filenames)
11. Screenshot command (html2canvas, PNG download)
12. README (lore-style)

### Phase 1 — Polish & Expansion (this session)
13. Firebase presence counter cached on `window.AtlasPresenceCount` — displays correctly on initial desktop mount
14. Boot sequence expanded to 30 POST-style lines with CPU, cache, memory fill bar, GPU, NVMe, TPM detail
15. Boot progress bar (label + track + percentage) fades in on first boot line, fills to 100%
16. Taskbar (`<div id="taskbar">`) — `initTaskbar()` polls `WM.state.windows` every 200ms, buttons show icon + title, active/minimized states, click to focus/toggle-minimize
17. Window minimize animation: sucks toward taskbar bottom-center, scales to 0.3; restore spring-bounce
18. Window snapping: `startDrag` on mouse-up snaps within 24px of any screen edge
19. Terminal `history` command — numbered session command list
20. Terminal `ping <host>` — 4-packet ICMP sim for 5 lore hosts
21. Terminal `hack <target>` — 5-second multi-stage intrusion sequence
22. Terminal `missions` command — EXECUTIVE/ROOT progression display
23. Terminal `help` rewritten with grouped categories (FILESYSTEM / SYSTEM / NETWORK / INTEL)
24. Mission/clearance progression system — `EXEC_MISSIONS` + `ROOT_MISSIONS` in localStorage (`atlas_missions`), auto-elevation on completion, parallel to `override` backdoor

## VFS Clearance Model
Three locked files in the VFS map:
- `encrypted_vault.txt` — requires EXECUTIVE clearance (also an EXECUTIVE mission target)
- `kernel.atlas` — requires ROOT clearance
- `ops_directive.sys` — requires EXECUTIVE clearance (also an EXECUTIVE mission target)

`ls` renders padlock glyphs for locked files. `cat` checks operator clearance before returning content.

## Mission System
Two mission arrays: `EXEC_MISSIONS` and `ROOT_MISSIONS`. State stored in localStorage key `atlas_missions`. Commands that auto-complete missions: `cat manifest.atlas`, `neofetch`, `sentinel clearance`, `ping sentinel-node`, `cat encrypted_vault.txt`, `hack crimson-net`, `cat ops_directive.sys`. Completing all EXECUTIVE missions auto-elevates to EXECUTIVE; completing all ROOT missions auto-elevates to ROOT.

## Presence Architecture
`firebase-config.js` writes `window.AtlasPresenceCount` on every Firestore `presence` snapshot. `initHUD()` in `system.js` reads this cached value immediately after desktop mount so the counter shows without waiting for the next snapshot.

## Pending Director Actions
1. **Firebase Hosting** — deploy for a public live demo URL. Currently local-only.

## What Gemini Should Prioritize Next Session
- If starting Phase 2: confirm what the director wants to build first (music player, lore/codex, credits screen, or other).
- If adding new apps: follow the pattern in `apps.js` (register in `APPS` object, wire to dock/hub/desktop icons as appropriate).
- If adding new terminal commands: add to the command dispatch in `apps.js` and update the grouped `help` output.
- If adding new VFS files: add to the VFS map in `apps.js`, set a `clearance` property if gating is desired; update `EXEC_MISSIONS` or `ROOT_MISSIONS` if the file should be a mission target.
- If adding new keyboard shortcuts: wire in `system.js` `initKeyboardShortcuts()`.
- Preserve the no-bundler constraint — all new libraries must be CDN-loaded.
- The maximized window `!important` CSS overrides exist for a reason — do not remove them; the HUD `pointer-events:none` is also intentional.
- Note: Gemini implemented Features 9–12 in the original sprint and two bug fixes. Claude implemented the original Features 1–8 and all items in this polish session.
