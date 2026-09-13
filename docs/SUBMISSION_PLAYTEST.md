# Submission playtest — 2026-09-13

The user requested a playtest and submission fixes. Testing uses the extracted competition ZIP and ordinary Playwright mouse/keyboard/button input with DOM observations; it does not inject game state, award points, accelerate time or use an ideal-hit simulation. Aim follows a simple fixed sweep. This is automated play, not a physical headset or human difficulty evaluation.

## Reproduced and fixed

After clicking the reload button, holding Space fired normally but releasing Space activated that focused button and unexpectedly reloaded again. Before-fix browser observation: AMMO 97% became RELOADING 23%. Active gameplay now consumes Space and Enter default button activation. Other browser shortcuts and the opening PLAY button retain their native behavior. A real-browser regression checks the mouse-to-keyboard handoff in Chrome and Firefox, and a unit test covers both keys.

The CI workflow tested only five older files, and test:13k omitted the canonical tower adapter. A shared test:game runner now discovers every game test and excludes only the separate review-Worker test. npm test still builds/tests the real Worker too. This does not resolve the private submodule's CI checkout access.

## Candidate

13,310 / 13,312 ZIP bytes, two spare. SHA256 caba602b67aefafc27f1e17c48436e10ce08cfc1f6dba29f3d06409995b3d53f. One root index.html with the official A-Frame exception. Anatomy/tower pin unchanged at17ec7aee234dc4a6d43904a35375a33d9b02d97c.

Instruction wording now reuses BUILD TOWER FIRST; the opening says to select and confirm. The board's redundant idle PREPARE THEN START WAVE fallback is blank, preserving its mission/start action and transient VR feedback. Fixed Roadroller learning rate1650 replaces1596; selectors, precision, memory settings and strict reconstruction safeguards are unchanged. No guns, tower types, scenery or gameplay rules were removed.

## Evidence so far

- Real build and56 tests pass, including byte-identical reproduction and exact decoder reconstruction.
- Final extracted ZIP passes Firefox155 and Chrome153: purchase, first cleanse, held-trigger reload protection and focused-button regression. No console errors. 320px controls pass.
- Native CDP touch at390x844 passes cancel, free selection, deliberate paid confirmation, rotation and reload. This is emulation, not a physical phone.
- Packed instrumented IWER2.3 passes actual engine hand loading, tower menu targets, both reload hands, throw/recall, movement, snap, handover, weapon switching and reentry. This is not an unmodified ZIP/headset test.
- Baseline full campaign: all six waves, all three guns, four prism plus two slow towers, gun upgrades, victory with crystal20/20, score11570 and clean replay. Evidence: baseline-campaign.json. The initial fixture accidentally clicked the board when requesting zero camera rotation; fixed by skipping zero-distance drags before the completed run. No production change was needed for that fixture issue.
- Final candidate completes all six waves, including ordinary mouse upgrades of Prism and Slow towers through their nearby menus, all three guns, gun upgrades, victory with crystal20/20, score11570,870 remaining credits and a clean replay. Evidence: campaign.json and wave/result screenshots. No game-state injection or time acceleration.
- Decoder-only three-trial medians: Chrome990.5ms baseline versus992.1ms fixed; Firefox735ms versus850ms. Small sample, engine/network/render excluded, no physical startup claim. Both variants use the same reported97.27MiB model arrays. Evidence: decoder.json.

## Official rules and remaining gates

Rechecked current official rules, WebXR and submission JavaScript modules by direct HTTP on2026-09-13; the web text extractor returns empty page bodies. ZIP cap13312, root entry, default engine resources, public source requirement and PNG dimensions/caps remain as recorded. Deadline13September2026 13:00CEST =11:00UTC =14:00Jerusalem. Sources: https://js13kgames.com/2026/rules , https://js13kgames.com/2026/webxr , https://js13kgames.com/_/Ci4nRLaX.js , https://js13kgames.com/_/B0SFqVY7.js , https://js13kgames.com/_/B_lbLyAK.js .

Game and Tiny Unicorn Lab repositories are still PRIVATE. Latest inspected GitHub Actions run34730783053 fails specifically cloning the private submodule (Repository not found). No visibility, token scope, terms acceptance or competition submission was changed. A physical Quest/phone check remains necessary for scope alignment, hip-pouch reach and sustained comfort/startup. Public-source permission and final form/terms are separate from this private test deployment.

## Publication and clean reproduction

Published owner-private as version21 at 2026-09-13T01:59:50.355392+00:00 from bb1dfd7aaad83e90e63e350c55f4d9e25b37f1c5, committed and pushed to origin/main and Sites/main. Version appgprj_6a7e0d3fab40819181f6efdcf97c7716~appgver_7224f6df8c508191a6a9eddea240e2b7; deployment appgdep_6aa6037afa1881919e2fd19c99155520. URL https://cartesius-rainbow-herd.rel-coh3n.chatgpt.site/play/. Live ZIP is byte-identical (13,310 bytes); opening/build/start, reload progress, held-trigger safety and the focused-reload regression pass with no console errors. Sole-owner access is unchanged. Evidence: evidence/submission-playtest/deployment.json. A fresh authenticated recursive clone, npm ci and all55 game tests reproduced this exact ZIP; full local Worker build/tests passed56. This subsequent documentation/evidence receipt is committed and pushed to origin/main without changing the deployed game. Public clone/CI access and physical Quest/phone checks remain open; not submitted.
