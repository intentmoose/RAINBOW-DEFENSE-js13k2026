# Whole-game interaction and quality pass — 2026-09-13 Jerusalem

The user asked to revisit guns, unicorns, towers, scenery and the first-time experience after correcting the RAM/ZIP confusion, specifically including magazines that can actually be thrown. This implements that request in the existing combined game. Prior live version 12 was 13,298 bytes; the new live version14 is 13,025. Exact publication receipt and hosted verification: RELEASE_RECEIPT.md and evidence/whole-game/deployment.json.

## Player-facing changes

- **Magazine handling:** a removed magazine follows the supporting hand's world position and rotation. Release carries measured hand velocity into a gravity arc, rotation and damped floor bounce. Moving the gun/player does not drag it around. Pick it up where it lands, insert into the highlighted socket, then prime. A/X, supporting trigger or desktop R recalls it through assisted reload. The old automatic teleport below the gun is removed.
- **Gun handover and guidance:** grip near the ready gun's pistol grip to transfer it without changing ammunition. Nearby parts glow, with TAKE GUN / REMOVE MAGAZINE cues. Empty-energy guidance takes precedence. Blue pull / green RELEASE GRIP, 8cm stroke, partial-pull rejection and held-trigger latch remain. Runs start loaded and primed; waves cannot start during an unfinished reload.
- **Weapon identity:** trigger guard, fore-end ribs, two shotgun barrels and a sniper scope distinguish modes. Shotgun beams fan from the barrels instead of appearing as parallel rays beside the gun. Default pitch remains 6 degrees downward, adjustable in 6-degree steps. Actual A-Frame animated controller hands remain; these are not optical finger tracking.
- **Unicorns:** brighter violet coat/mane, stronger hit flash and a shared nod/recoil transform for head, eyes, ears and horns, keeping facial parts attached during motion. Speed-linked gait, slowing and wings remain; shields are rounder. Canonical anatomy stays pinned to `24c889d61af2cbe95e06fdb0c62d8fb57676e649`.
- **Towers/scenery:** smoother pads and upgrade plinths, aiming prism crystals, orbiting slow crystals and firing pulse. Twilight sky, warm sun glow, larger smoother rainbow, luminous lanes and 64 side-bank spires frame a clear approach. Visual QA caught and removed a horizon artifact. Crystal damage produces a message, tone and haptic feedback.
- **First-time flow:** objective and BUILD TOWER → START WAVE → FIRE sequence, loaded start and magazine recall are explicit. First VR purchase is centered, with point-at-pad/trigger guidance. Unavailable early options stay hidden; a FIRE reminder fills unused board space. Shared world/gun display is now 768×320. Direct pad selection still builds/upgrades.

## ZIP budget and changed compression decision

| Artifact | ZIP bytes |
| --- | ---: |
| Prior live version 12 | 13,298 |
| Same new source with Terser + Zopfli only | 14,069 |
| Final new source with bundled decoder | **13,025** |
| Official cap | 13,312 |

The new build is **273 bytes smaller**, with **287 free**. Packing recovers 1,044 bytes for this exact source; no runtime RAM reduction is claimed. SHA256: `f99676583cca6f1235e4055de5fcd706cdf298e31000268789a9d26fdd9cc798`. ZIP contains only root `index.html`; its decoder counts in full. Evidence: `evidence/whole-game/budget.json`.

This supersedes the historical no-runtime-unpacker choice. Exact-pinned development dependency `roadroller@2.1.0` follows Terser and precedes Zopfli. Text mode reconstructs the complete minified first-party program byte for byte, with explicit strict mode. Each build executes the generated decoder in an isolated Node context, intercepts evaluation and checks equality before emitting. Tests inspect reconstructed source/HTML for external resources and runtime WebAssembly, so packing cannot hide them from the audit. `competition/dist/unpacked.js` and `packing.json` expose reconstruction/options outside the ZIP; readable originals remain in `competition/` and the pinned submodule.

Parameters are fixed, global-variable pollution disabled, and release builds skip the optimizer. Reproducibility testing caught that the pinned library's `optimize(0)` falls back to random level-1 optimization. Removing the call makes separate-process builds byte-identical. HTML line endings are normalized to LF so checkout style cannot change the ZIP. Generated evaluation consumes only packaged build-generated code. There is no new external engine, asset service or runtime WebAssembly.

The organizer's [resource list](https://github.com/js13kGames/resources/blob/main/README.md) includes Roadroller. [Roadroller documentation](https://github.com/lifthrasiir/roadroller) explains the startup tradeoff; the compressor is MIT and generated decoder public domain. This is provenance/rules analysis, not organizer acceptance of this entry.

## Verification and limits

`npm test` rebuilt the actual competition payload and Sites Worker, verified Worker/manifest, and passed **50/50 tests**. Separate-process archive reproduction passed. New tests cover world-space throws in both hands, pickup/seating, recall/interruption/reset, safe handover, wave gating and exact reconstruction including Unicode/HTML-sensitive strings.

- **Extracted final ZIP:** Chrome 153.0.8010.36 and Firefox 155.0 pass normal tower purchase, first cleanse and held-trigger reload with zero errors. Requests are only the local extracted page and official engine URL. `evidence/final/browser.json` records the final hash. Cover/thumbnail come from this artifact.
- **Touch:** native CDP touch at 390×844 verifies canceled taps do not spend points, a tap buys, and cancellation/rotation/reload recover input. Emulated touch, not physical phone.
- **XR:** IWER 2.3 runs packed instrumented production source with controller poses/buttons and actual default hand GLBs. It verifies throw momentum/recall, physical handover, both manual reload hands, partial/full stroke, board purchase/start, locomotion/snap, one-controller assist and cached model reuse. Instrumentation/IWER are absent from the ZIP; this is not an unmodified-artifact headset test.
- **Visual/lifecycle:** inspected desktop, phone and stereo screenshots. Deterministic 1/16/40-enemy fixtures have zero errors; 40 enemies render in 46 calls / 25,466 triangles. All 13 unicorn batches empty correctly. After 100 resets, geometry/texture counts stay 23/2. These are desktop renderer measurements, not whole-app RAM or headset frame rate.
- **Startup:** three loads per variant/browser measured game-script initialization only, excluding engine/network. Chrome plain 24–82.8ms, packed 651.8–680.2ms; Firefox plain 148–223ms, packed 590–605ms. Median overhead is about 640ms / 427ms. Decoder model setting is 16MiB; reported model arrays are about 9.16MiB, transient startup work rather than whole-app memory. Private route had no CSP restricting the decoder at inspection. All runs: `evidence/whole-game/startup.json`.

Final review also reproduced magazine shrinkage after repeated desktop assisted reloads: world-space attachment preserved the desktop gun's 0.6 scale, which compounded when reseated. Seating now restores local scale to 1. A regression test fails before the fix and passes through three reloads and entry into VR afterward. The full build/50 tests and final extracted browser/touch/packed-XR checks were refreshed. Startup and renderer measurements above were made immediately before this scale-only correction, with identical decoder settings and scene design.

Physical Quest startup, gun feel/hand clearance, HUD readability and sustained performance remain hardware checks. Full normal human campaign and physical phone evaluation also remain open. Six-wave campaign, unlocks, economy and endless remain, with prior balance tests passing. No source visibility, access, terms or competition submission action is included.
