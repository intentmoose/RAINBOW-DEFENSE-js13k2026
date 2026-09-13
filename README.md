# Rainbow Defense (Rainbow Herd)

A six-wave WebXR tower-defense game for js13kGames2026. Defend the crystal, cleanse corrupted unicorns for points, build and upgrade towers, and unlock weapons.

## Play

Choose a **Prism** tower model on the left, select a pad and confirm **BUILD**, then **START WAVE**. The build button also buys the next free pad. Select built towers for nearby upgrades. **Slow** towers and **Shotgun** unlock atwave3; **Sniper** atwave5. All five actual gun/tower models remain displayed on the sides, with lock/equipment/price states. Choose a gun on the right; its lower upgrade line buys the next level between waves. Beat wave6 and replay with fresh unlocks.

Pistol: tap trigger, click, touch or Space for one round; holding does not repeat. Shotgun/sniper use their own firing cadence. Desktop: drag to aim, WASD move, R reload, Q cycle guns, U upgrade, Enter next wave. Touch: left drag moves; right drag aims; tap to fire pistol. RELOAD assists only outsideVR.

VR: left stick moves, right stick snaps30degrees. Grip the magazine with the supporting hand, pull/drop it, grip the full rainbow magazine at the supporting hip, then insert/release. The bolt chambers automatically. There is **no button-assisted VR reload**. Magazine supply is unlimited; partial reseating preserves ammo. A supporting grip near the pistol grip hands the gun over; B/Y cycles unlocked guns. Engine-default animated controller hands are included; optical hand tracking is not.

## Build and verify

Node22+, recursive clone, npm ci. npm test builds the game and real private review Worker and runs62 tests. npm run test:13k builds/tests the competition game alone. npm run serve:game starts the local static server; npm run smoke:browser, node scripts/smoke-touch.mjs, npm run smoke:xr and npm run playtest:campaign exercise the browser, touch, IWER and full campaign. XR/visual fixture instrumentation is not shipped.

competition/rainbow-herd.zip: **13,297 /13,312 bytes**, root index.html only. Uses the official2026 A-Frame exception and its default hand resources. Generated game models/audio need no custom external assets. Gun pitch is fixed at -16 degrees. Distinct procedural gun, reload, tower and wave cues clarify the action. See docs/AUDIO.md, docs/SOLID_MODELS.md, docs/TD_UX.md and docs/SUBMISSION.md for evidence and remaining physical-device/public-source checks. Not submitted.

Canonical unicorn anatomy and Prism/Frost recipes come only from pinned vendor/tiny-unicorn-lab. Source modules: competition/game.js, defense.js, weapon.js, engine-hands.js and index.html. Fixed Roadroller packing includes its decoder and is verified byte-for-byte. ZIP bytes are the competition limit; physical headset startup/performance is a separate test. The legacy allied-herd game remains on codex/legacy-herd-bd4319a.
