# Gun and onboarding recheck — 2026-09-12

The user repeated the request after the first pass. We replayed the actual private Site and local game rather than treating prior test results as a usability verdict. The earlier checks missed a starting-economy trap: upgrading the gun for 55 out of 70 points left only 15, below the required 35-point tower. The main hand's grip also bought towers despite the documented trigger-only selection flow.

Added actual A-Frame default low-poly animated controller hands via the pinned component, with no second renderer or custom model URL. Lowered default gun pitch another 6 degrees and moved the support contact point 7cm toward the visible palm. Kept the 8cm stroke, blue pull/green release cue and trigger safeguards; auto-reload stays visible during manual steps. Fixed first-gun-upgrade spending that could leave too few points for the required tower. Hid unavailable early controls, centered the initial VR build action, added world-board purchase feedback and removed main-hand squeeze purchases.

## Hands and controls

competition/engine-hands.js adapts the pinned hand-controls component's default loader, WebXR orientation, animation clips and tick method to the existing AFRAME.THREE grip groups. Standard lowPoly left/right GLBs load once on first XR controller use. Reconnection and changed controller order reuse two cached hands. The component's own model URLs remain external under the engine-default-resource exception. We neither embed models nor load arbitrary external assets.

Actual observed requests: official 2026 aframe.js and cdn.aframe.io/controllers/hands/leftHandLow.glb plus rightHandLow.glb. Both contain a skinned mesh and Fist/Open clips. Controller grip changes animate the support hand; the gun hand uses the closed pose. This is controller animation, not optical finger tracking. Raw prototype integration is pinned to the tested A-Frame 1.8.0 component; rerun real XR/model checks before changing that engine.

First prototype comparison was 13,420 bytes against 13,309 for the previous custom hands: 111 extra ZIP bytes. Final integrated release is 13,298 / 13,312 bytes, 14 free; SHA256 31a7e5f4bc9aa47ebb2f9670f1328bd8de74274e4baa4b4d6f7ae4a2b8f1dfce, 11 bytes smaller than version 11. Static simulation-field initialization permits audited private-name compression; geometry key compression preserves every canonical position/normal/index buffer in tests. Anatomy pin remains 24c889d61af2cbe95e06fdb0c62d8fb57676e649. Shared labels and standards-permitted HTML tag omission fund the UX and hands. No gameplay/unlock removal. Runtime RAM is not the competition budget; previous renderer RAM reports are historical.

## Player flow

1. START DEFENSE or ENTER VR. BUILD TOWER 35 buys the next empty pad automatically. The initial VR board presents one centered build action across the whole primary row. Direct pad selection remains available.
2. START WAVE becomes available after the first purchase. Advanced desktop/touch choices appear as relevant. Gun upgrades cannot consume the starting tower funds, including via keyboard U.
3. Fire at incoming corrupted unicorns and earn points. Between waves, select a tower's base pad to upgrade; TYPE changes prism/slow and the weapon button cycles unlocked guns.
4. Manual reload: support grip removes the cartridge; return it to the green slot and release. Grip the blue top bar, pull back until green, then release. A/X or supporting trigger auto-reloads. Main-hand grip does not select purchases. The gun angle starts at -6 degrees and remains adjustable.

## Verification

Real npm test build and 42 tests pass. Final extracted ZIP passes Chrome 153 / Firefox 155 normal purchase, first cleanse and reload with zero errors. Native emulated 390x844 touch cancellation/rotation/reload pass. IWER 2.3 verifies real default hand GLBs/animation clips, both gun hands completing manual reload, movement/snap turn, central board purchase/start, main-grip non-purchase, assisted reload, weapon cycling, reentry and reuse of the same two hand objects/models. Browser screenshots inspected. Physical Quest comfort/feel and physical phone/full human campaign tests remain open.

Evidence: evidence/final/browser.json, evidence/defense/touch.json, evidence/xr-browser.json and corresponding screenshots. Node hand fixtures use a model-loader double for physics/lifecycle tests; real IWER verifies the actual engine models. No physical-headset feel claim. No competition submission, terms, visibility or credential-scope changes.
