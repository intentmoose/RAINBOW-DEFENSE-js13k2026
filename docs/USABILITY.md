> Historical first usability pass. Current engine-hand and second-pass changes are in [RECHECK.md](RECHECK.md).

# Gun handling and onboarding — 2026-09-12

User requested lower gun aim, less confusing cocking, clear tower purchases and opening guidance. Then clarified that "memory" meant competition ZIP bytes, not RAM. Archive size and player experience are the priorities; RAM savings are not competition headroom.

## Behavior

- XR pitch defaults to 0 degrees instead of +12; cycles 0, -6, -12, +12, +6. Front/rear sight heights agree. Ray follows the barrel; desktop presentation is slightly lower too.
- Enlarged charging bar, 8cm full travel, unchanged 85% detent. Only seated/unprimed weapons allow bar pickup. Overlapping capture volumes choose the nearest eligible part, preventing accidental disablement of a ready gun.
- Supporting grip removes/inserts cartridge; green socket guides seating. Blue bar requests PULL BACK with percentage; green bar says RELEASE GRIP at detent. Haptics go to the manipulating hand. Dropped cartridge starts returning after .4 seconds. A/R and supporting trigger retain assisted reload. Partial/interrupted pulls and held triggers cannot bypass safeguards.
- BUILD TOWER buys selected type on the next free pad. TYPE only selects. A tower is required before START WAVE. Direct pad selection still places/upgrades with displayed costs. Thin construction pointer and empty-pad highlights improve aiming.
- Opening explains protect crystal, build, start, fire and earn points. Phase text advances from build to start to defend. Reload guidance takes display priority during manipulation and at empty energy.

## Budget and engine hands

Final 13,309 / 13,312 bytes, 3 free; SHA256 7f56d049c8a0f7b1c957690813100513e38f67e824e56e8fec64718452ee035a: 14 bytes larger than version 10. Shared UI labels, audited private input-property mangling and concise copy fund the guidance. Removed optional half-float matrices/partial-upload bookkeeping, pulsing reticle, button gradient and redundant future-unlock instructions. Cross reticle and in-game unlock messages remain. Conversion uses one chime. No gameplay/progression/reload removal; anatomy pin unchanged.

The [2026 rules](https://js13kgames.com/2026/rules) limit compressed ZIP size, not runtime RAM. The [WebXR exception](https://js13kgames.com/2026/webxr) permits engine default resources; current official page modules were re-read. Installed A-Frame 1.8.0 hand-controls defaults to lowPoly and loads its own hand GLBs. Their RAM cost is not a ZIP-budget objection; our integration code still counts.

This patch retains controller-attached procedural gloves. Default A-Frame hands remain a valid alternative, not prohibited or rejected for RAM use. Standard hand-controls needs integration with this standalone AFRAME.THREE renderer/input; adding markup alone would not activate it. No optical tracking claim.

## Verification

npm test rebuilt the real review Worker and passed 40/40 tests. Extracted ZIP Chrome 153 and Firefox 155 passed build/start, cleanse and reload with zero errors. Native emulated 390x844 touch cancellation/rotation and reload passed. IWER 2.3 passed movement, snap turn, board build/start, aim, cartridge handling, partial/full 8cm stroke, release cue, one-controller assistance, weapon cycling and session reentry. Screenshots inspected. Physical Quest feel and physical phone testing remain open.

New tests cover first-purchase/phase guidance, empty energy, ready-handle protection, nearest capture, partial/full pull, lowered-angle manipulation, correct-hand haptics and minifier ownership. Evidence: final/browser.json, xr-browser.json, defense/touch.json, defense/usability.json.

Renderer audit: full-float transforms on all browsers, 79,468 retained geometry/instance bytes (larger than the previous native half-float path); one context, 41 desktop calls / 22,566 triangles at 40 creatures, stable 21 geometries / 2 textures after 100 resets. This is stability evidence, not whole-app memory or physical performance. No competition submission or access change.
