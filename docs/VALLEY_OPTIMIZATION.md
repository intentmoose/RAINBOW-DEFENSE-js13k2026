# Seated controls and crystal valley — 2026-09-12

User requested easier remote turning/movement and another visual/memory pass on unicorns, scenery, guns and towers. This extends the combined defense game; gameplay progression and physical reload remain intact. Baseline source: 0c02d14f4d7af9cf4aa2697da62096abbe2ef558 (Site version 9).

## Controls

With two tracked controllers, left stick translates relative to headset direction and right stick snaps 30 degrees horizontally. Turning pivots around the headset's actual world position, preventing a room-offset player from orbiting the rig origin. A held deflection triggers once; return below 0.3 before another turn. Turn threshold 0.7; movement dead zone 0.18 and diagonal normalization. With one controller, vertical stick moves and horizontal stick turns. Controller roles do not change when swapping gun hands. Disconnect, session interruption and new runs reset the turn latch. Physical turning still works.

Uses live WebXR input-source gamepads and the standard thumbstick slots, with two-axis fallback; no new input library ([W3C mapping](https://www.w3.org/TR/webxr-gamepads-module-1/#xr-standard-gamepad-mapping)). Actual IWER axes, not simulated keyboard substitutes, exercised movement and latched turning before the physical reload sequence. Unit coverage additionally verifies offset-head pivot, dead zones, diagonal speed, one-controller fallback, disconnect and reset.

## Visual changes

A night-blue crystal valley replaces the plain cone ring. Forty faceted spires share one octahedron geometry with the defended crystal, tower heads and gun emitter. A single procedural ground shader replaces the ground-plus-road pair, with luminous lane borders and distance shading. No new texture or model asset. Rainbow arc segments drop 48 to 32.

Towers gain raised plinths and three crystal heads, colored by function and oriented toward the most recent target. The gun has a cleaner dark-metal receiver, pale trim and two fewer decorative meshes; physical sights, mode-specific barrel, cartridge and rack remain. Unicorns retain pinned canonical anatomy, with a lighter coat/mane for silhouette readability and single enlarged emissive-style eye meshes replacing duplicate transparent eye glows. Warden shields use a faceted icosahedron.

Gait phase advances with actual movement speed, including slows; heading follows lane convergence. Flyers bob gently. Head motion follows the stride, and each unicorn's sine/cosine heading is computed once per render sync instead of once per anatomical part.

## Measured memory and render work

Controlled fixtures use the same 1 / 16 / 40 enemy layout and six upgraded towers. Data from evidence/defense/pre-valley.json, valley.json and valley-fallback.json:

| Retained payload | Before | New browser with Float16Array | Float32 fallback |
| --- | ---: | ---: | ---: |
| Geometry + instance arrays | 104,334 B | 56,364 B | 79,468 B |
| Reduction | — | 46.0% | 23.8% |
| Simulation typed arrays | 3,045 B | 2,189 B | 2,189 B |
| Shared HUD base RGBA | 245,760 B | 245,760 B | 245,760 B |
| Other particle state | 2,560 B | 2,560 B | 2,560 B |

These are identified retained arrays and base pixels, not total browser heap, GPU memory or whole-app memory. Textures, engine overhead, backing canvases, buffers and framebuffers remain. No total-memory or physical Quest FPS claim.

The enemy pool drops from 48 to 40, matching the existing maximum wave queue; overflow waits for a slot rather than losing spawns. Horn capacity is N+2 because production has at most one three-horn boss. Removed redundant kind/vx/cheer arrays, duplicate eye glows and excess spark color precision. Native Float16Array halves creature matrix storage; browsers without it retain ordinary Float32Array without a polyfill. Native Three r184 supports both. Render transforms are reduced precision; simulation and physical gun transforms remain full precision. Against the same full-precision fixture, maximum stored matrix-element error was 0.003563; this is not an all-scenes visual-error bound.

At 40 creatures, triangles fall 24,100 → 22,566 and desktop draw calls 45 → 41. At 1 / 16 creatures, triangles are 2,646 / 10,338. Uploaded geometry/texture counts remain 21 / 2 after 100 resets. Local sync timing samples are recorded but are not headset benchmarks. Fallback paths also render without errors.

## Packaging and verification

ZIP: 13,295 / 13,312 bytes, 17 free; SHA256 83db11173aa4d39bae6a09fb18a4d36f884ac5b5efcc03991a7a6bafb3171737. This is 16 bytes more than the previous combined game, including the new controls. ZIP size and runtime allocation savings are different quantities.

Extended the tested private property allowlist to explicit defense-owned fields; dynamic array keys and external APIs are excluded. Source ownership checks and compiled/uncompiled simulation/weapon equivalence guard the transformation. Full review build and 38 tests pass. Final extracted ZIP Chrome/Firefox normal tower purchase, cleanse and reload pass; native emulated touch cancellation/rotation passes. IWER stereo movement/turning, board start, physical cartridge/rack, assist, modes and reentry pass. No new external game request beyond official A-Frame. Shared anatomy stays pinned at 24c889d61af2cbe95e06fdb0c62d8fb57676e649.

Physical Quest ergonomics, comfort, sustained endless performance and normal human campaign balance remain unverified. The existing idealized balance result is unchanged: greedy towers alone lose wave 4; idealized accurate beam plus towers clears wave 6.
