# Current rules and Spillway reference audit

Read-only reference audit performed 2026-09-12. Clock checkpoint: 12:44:14 UTC
(15:44:14 Jerusalem). No reference repository files were changed.

## Official competition evidence

The web extractor returned empty page bodies. Direct HTTP inspection recovered
the JavaScript modules used by the current official pages; this is current site
content, not an older-year rules substitution.

| Finding | Official source |
| --- | --- |
| Theme: **Unicorns and Rainbows** | [Announcement](https://js13kgames.com/2026/blog/competition-has-started), [its content module](https://js13kgames.com/2026/blog/competition-has-started.js) |
| Deadline: **2026-09-13 13:00 CEST**, equivalent to **14:00 Jerusalem / 11:00 UTC** | [Rules](https://js13kgames.com/2026/rules), [current rules module](https://js13kgames.com/_/Ci4nRLaX.js) |
| ZIP at most **13,312 bytes**; root `index.html`; immediately playable after extraction; complete readable buildable GitHub source; latest Chrome and Firefox with no console errors | Same rules sources |
| New game required; existing content can enrich it if rights and other rules are satisfied; entrants retain ownership while submission grants organizer publication/use rights | Same rules sources |
| Exactly one organizer-hosted engine exception; no extra assets; engine default dependencies allowed; engine-using games excluded from base Desktop/Mobile categories and overall ranking | [WebXR](https://js13kgames.com/2026/webxr), [WebXR page module](https://js13kgames.com/_/B0SFqVY7.js), base rules |
| A-Frame **1.8.0**, Babylon **9.20.0**, Three **r185**, PlayCanvas **2.21.3** | [2026 library module](https://js13kgames.com/_/CpzzyefZ.js) |

Allowed engine URLs are:

- `https://play.js13kgames.com/2026/webxr/aframe.js`
- `https://play.js13kgames.com/2026/webxr/babylon.js`
- `https://play.js13kgames.com/2026/webxr/three.js`
- `https://play.js13kgames.com/2026/webxr/playcanvas.js`

The A-Frame URL returned HTTP 200, `text/javascript`, 1,323,403 bytes. Three
returned HTTP 200, `text/javascript`, 726,241 bytes, identifying r185. This
does not invalidate the historical engine outage record, but the old failure
was not reproduced today. No engine migration is needed.

The [submission page module](https://js13kgames.com/_/B_lbLyAK.js) explicitly
rejects repositories that are absent or private and expects a standalone
`https://github.com/USER/REPO` URL. It includes rules/privacy acceptance,
registration, contact, team, ZIP, presentation, and final submission. Thumbnail:
PNG **320 x 320, at most 64KB**. Cover: PNG **800 x 500, at most 256KB**.
Readable source must be complete by final submission, including dependencies
needed to build. A private submodule remains a separate source-access concern.

No AI-specific disclosure requirement was found in the inspected rules, WebXR,
announcement, or submission modules, or the bounded official-site search. This
is an absence finding, not a claim that all organizer communications were
searched. Truthful AI-assistance provenance should accompany the source.

No account terms were accepted, repository visibility changed, or game submitted.
Those actions require the user's explicit authorization.

## Actual Spillway source inspected

Reference workspace: `C:/Users/Ariel/Documents/bodycam webgpu`.
Active product: `range/`, an IWSDK 0.5.3 **WebGL** range. Root `src/` preserves
the older WebGPU experiment. Read root/scoped `AGENTS.md`, `docs/START_HERE.md`,
`docs/PROJECT_STATE.md`, `docs/WORK.md`, `docs/COLLABORATION.md`, and weapon guidance.

At inspection: branch `main`, HEAD
`5fa954759c292af9804e1e8a6ba823b961ae1394`, no configured remote, extensive
dirty/untracked changes including the current weapon action. These local files
are the inspected revision; HEAD alone does not reproduce them.

| Source, relative to reference workspace | Useful mechanism |
| --- | --- |
| `range/src/action.ts` and `range/action.test.ts` | Pure state shared by input paths; rear detent at .9, return at .1; insertion separate from priming; single transition events |
| `range/src/range-system.ts:318` | Supporting hand derived opposite actual holder; grip point converted to weapon-local coordinates every frame; displacement drives constrained stroke; spring starts on release |
| `range/src/range-system.ts:335` | Socket capture at .095m with orientation dot above .55; approach haptic at .22m, reset beyond .26m; authoritative seating; reachable spare return |
| `range/src/weapons/rig.ts:121` | Expanded grab volume; separate slide and magazine transforms |
| `range/src/weapon-feedback.ts` and tests | Staged 1.35-second assisted magazine travel and seating |
| `range/src/audio.ts:76` | Synthesized mechanism scrape tracks actual travel velocity; detent and seating have distinct one-shots |

Do not copy Spillway's ability to fire a chambered shot without a magazine into
Rainbow Herd. Its bench-based spare recovery also needs a moving-game affordance.

Provenance: local handoffs identify original project/agent work. No general
repository-wide software license was found. The reference is used for concepts
and timing, with no model, sound asset, renderer, or weapon-framework import.
Record any subsequent literal code reuse separately rather than presuming a
license. Inspected action source SHA-256:
`22cf78968a2a62c39a3d66fd850091417e8f757f0687bb1844dce61368218fa6`.

Reference verification rerun: `npm run range:typecheck` passed and
`npm run range:test` passed **28/28**. No new reference browser or physical
headset testing was performed. Prior screenshots/emulator records remain
historical evidence.
