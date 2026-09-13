> Current rendering, movement controls and memory figures are in [VALLEY_OPTIMIZATION.md](VALLEY_OPTIMIZATION.md). The design below records the initial combined release; progression and economy remain current, while pool size, visuals, controls and budget have changed.

# Combined defense design and verification — 2026-09-12

The approved loop is cleanse → points → towers and weapon upgrades → harder wave → endless. This replaces allied AI/riding/flight/draft, keeping the canonical unicorns, rainbow effects and physical gun. The old game is preserved on origin/codex/legacy-herd-bd4319a; its exact ZIP is evidence/baseline/pre-defense.zip.

## Progression

| Available | Content |
| --- | --- |
| Start | Rainbow beam, six pads, prism tower,70 points |
| After wave2 / before wave3 | Shotgun and slow towers |
| After wave4 / before wave5 | Sniper |
| Complete wave6 | Endless horde menu unlock |

Purchase between waves. Tower prices35/55, upgrades50/75; gun upgrades55/80. Maxlevel3. Mode unlocks are free; points buy damage upgrades. New runs restart the economy and earn mode unlocks again. Endless continues beyond6 with every sixth wave an Alicorn. Early enemies approach a single northern corridor, later lanes spread from the same direction. No pathfinding or enemy projectiles.

Rainbow supports sustained aim at.8DPS with12 seconds energy. Shotgun is a10m cone, multi-target damage with falloff, .7-second interval and1.5energy/pulse. Sniper reaches36m, single-target2.7damage,1.2-second interval and2.4energy/pulse. Upgrades add35% base damage perlevel. Visible barrel width/length changes with mode. Assisted reload takes1.3sec and uses the same guarded state transitions as physical reload.

## Hands and gun

A-Frame default hand controls load separate model assets; they are not zero-memory features ([official hand-controls](https://aframe.io/docs/1.7.0/components/hand-controls.html)). We use two controller-attached procedural gloves,11 box instances each, shared geometry and material. These are grip-driven visuals, not tracked fingers. No new runtime download, A-Frame component, skeleton, physics or model asset.

The gun starts12 degrees above grip orientation and the board/button adjusts by6 degrees. Actual XR aim is derived from the barrel quaternion; no independent aim correction hides a mismatch. Manipulation uses a grip-local fingertip contact offset. Reach targets highlight, and the empty socket has a visible outline. Cartridge release must be within12cm; top bar requires11cm travel and detent/release. Gun recoils without headset movement. Physical comfort and alignment still need Quest evaluation.

## Size and runtime tradeoff

Final ZIP13,279 bytes vs legacy13,183: the whole combined mode adds96 compressed bytes, leaving33. The replaced systems fund the new ones; simply bolting towers onto the old13K game would not fit.

Retained geometry and instance arrays104,334 bytes vs109,022 (4,688 fewer,4.3%). Pads share geometry; towers reuse canonical horn; hands share box; particles drop240→160 and old projectile pool is removed. Simulation typed arrays3,045 bytes. Bounds48 enemies/six towers/160 particles persist through resets.

The one384x160 CanvasTexture used by both the world board and gun display costs245,760 baseRGBA bytes, with mipmaps disabled. Canvas backing, browser/engine objects, GPU copies, buffers and framebuffers add more. Therefore this build is not claimed to use less total runtime memory. The HUD cost buys readable immersive status and build controls. Engine-managed second texture and GPU allocation overhead are not counted in that pixel figure.

Renderer fixture with six towers and1/16/48 mixed enemies:3,116/11,224/28,392 triangles;43/45/45 desktop calls. No growth in uploaded geometry/texture counts after100 resets. See evidence/defense/render.json. Earlier OPTIMIZATION_REPORT.md describes the preserved legacy game and is historical.

## Evidence and limits

Full npm test:35 passed, including actual review Worker build and ZIP reproducibility. Browser script tests extracted archive with normal input in Chrome/Firefox. smoke-touch.mjs tests native touch cancellation, purchase, resize and reload on emulated390x844. smoke-xr.mjs uses IWER event/pose input and test-only production-source observations for hands, physical reload, board start, gun alignment, mode switching and session reentry. It is not physical headset testing.

Run node scripts/audit-balance.mjs to reproduce production-simulation tuning: greedy towers alone losewave4, idealized accurate rainbow beam plus towers clearswave6. The idealized player incurs no target acquisition or movement delay; this is not a human campaign-completion claim. Human difficulty, sustained endless load, optical tracking and physical Quest performance remain unverified or out of scope.
