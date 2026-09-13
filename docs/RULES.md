# js13kGames 2026 — Confirmed Rules

Reverified current official rules, WebXR and submission page modules on 2026-09-13; see SUBMISSION_PLAYTEST.md. Prior detailed audit: see docs/2026-09-12-rules-reference.md for current sources, submission image requirements, public-repository requirement, and AI-policy absence finding. Historical detailed record follows:

- <https://js13kgames.com/2026/>
- <https://js13kgames.com/2026/rules>
- <https://js13kgames.com/2026/webxr>

Only confirmed constraints are recorded here. If an organizer changes a rule, this file and the competition build must be rechecked together.

## Competition

- The 2026 theme is **Unicorns and Rainbows**.
- The competition runs from **13 August 2026, 13:00 CEST** through **13 September 2026, 13:00 CEST**.
- The submitted `.zip` must be **13,312 bytes or smaller** (`13 × 1024`).
- `index.html` must exist at the archive root and the game must run immediately after the archive is unzipped.
- All game code, assets, and data must normally be inside the ZIP.
- The game must be playable in the latest Chrome and Firefox with no console errors.
- A submission needs both:
  - the playable ZIP; and
  - a readable GitHub repository containing the complete source and build process.
- New work is required. Existing content may be incorporated only when we have the legal right to publish it and it complies with every other rule.
- If local storage is used, keys must have a unique game prefix. `localStorage.clear()` is forbidden because entries share an origin.
- Tracking and analytics services are forbidden.
- The submission deadline is **13 September 2026, 13:00 CEST**.
- Unfinished submissions and minor bug-fix PRs remain possible on **14 September 2026** under the official restrictions. Voting runs **14 September–4 October 2026**.

## WebXR category

All base rules apply, with one narrow exception to the external-resource rule.

- A WebXR entry may use **one** organizer-hosted engine outside the ZIP.
- The allowed 2026 versions are:

| Engine | Version | Organizer-hosted file |
| --- | --- | --- |
| A-Frame | 1.8.0 | `https://play.js13kgames.com/2026/webxr/aframe.js` |
| Babylon.js | 9.20.0 | `https://play.js13kgames.com/2026/webxr/babylon.js` |
| PlayCanvas | 2.21.3 | `https://play.js13kgames.com/2026/webxr/playcanvas.js` |
| Three.js | r185 | `https://play.js13kgames.com/2026/webxr/three.js` |

- Rainbow Herd uses **A-Frame 1.8.0** from the organizer-hosted URL above and accesses its bundled Three-compatible renderer through `AFRAME.THREE`.
- A-Frame must not be bundled into the competition ZIP.
- The permitted engine may load its own default resources, but the game must not load any additional external assets.
- Using an external permitted engine makes the entry ineligible for the overall ranking and the base Desktop and Mobile categories. Desktop and touch fallbacks remain part of Rainbow Herd for testing, accessibility, and browser-rule compliance, but the submission targets the **WebXR category only**.
- If the game eventually removes the external engine entirely, it could also enter base categories; that is not the current architecture.
- The category's listed hardware prize is a Meta Quest 3S. Import taxes, if imposed, are the winner's responsibility, and the organizer requests a video of the winning game running on the device.

## Engineering consequences

- `competition/index.html` is the source of truth for the shippable payload.
- The hosted review experience may wrap or copy that payload, but React, Sites, build tooling, documentation, tests, and hosting code are never included in the competition ZIP.
- The CI/build script must fail when the final ZIP exceeds 13,312 bytes.
- The normal engineering target is **12,000 bytes**, preserving 1,312 bytes for late fixes; the automated hard gate remains the official 13,312-byte limit.
- Custom assets must be packaged within the ZIP; the permitted engine's own default resources are exempt as described above. Current game art/audio remains procedural except the two A-Frame default lowPoly hand models, now loaded by the pinned engine component. Integration code still counts toward the archive limit.
- First-party geometry, animation, effects and sound are generated at runtime; engine default hands follow the exception above.
- The direct game route must remain playable outside an iframe because immersive WebXR may be restricted by embedding policy.

## Engine availability audit

On 2026-08-13, the allowed `three.js` entry module imported `./three.core.min.js`, but that companion URL returned HTTP 404. The local review route had initially masked the problem by serving both npm files. Rainbow Herd therefore moved to the equally permitted, self-contained A-Frame 1.8.0 build. Current availability was rechecked in the dated reference above.

## Packed artifact audit — 2026-09-13 Jerusalem

The archive contains one root index.html including a Roadroller JavaScript decoder, whose bytes count in full. Every build reconstructs and compares exact strict-mode minified source; tests inspect reconstructed code/HTML, reject other external URLs, additional fetch/import mechanisms and runtime WebAssembly. Packing does not obscure the resource audit. Default engine hands remain permitted engine resources. Readable originals, exact tooling and pinned anatomy remain in the repository. See WHOLE_GAME_PASS.md for provenance, startup cost and official resource-list reference. No numerical RAM cap was found; startup/performance is a separate engineering consideration.
