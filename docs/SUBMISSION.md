# Submission packet — Rainbow Defense (Rainbow Herd)

**Submission candidate:** 13,297 bytes; fixed -16-degree pitch, no angle cycling. The exact build passes 62 tests plus Chrome, Firefox and packed WebXR smoke checks. Publication pending.

**Previous deployed verdict:** Size-compliant combined candidate, locally verified and privately deployed as version23 with solid unicorn surfaces and magazine clearance. Receipt in RELEASE_RECEIPT.md. Not submitted. Physical Quest/phone playtests and organizer-readable source/CI access remain open.

## Copy

Defend the rainbow crystal from corrupted unicorn hordes. Cleanse enemies into points, build prism and slowing towers, and upgrade your physical rainbow blaster. Unlock the shotgun at wave 3 and sniper at wave 5, defeat the Alicorn in wave 6, and complete the six-wave defense. Drop the empty, grab hip ammo and insert/release; the gun chambers automatically. Let your towers cover the reload.

Category: WebXR only, using the external permitted A-Frame engine. Desktop and touch fallbacks included. Procedural game geometry, animation, audio and effects, plus engine-default hand models. Substantial AI-assisted programming, testing and design; no AI-specific mandatory disclosure field was found in the current official rules/form.

## Controls

- Tower models on the left: select Prism (available immediately) or Slow (wave3), choose a pad, then confirm its nearby BUILD action. A preview does not spend or attack. Point at an owned tower to upgrade through its nearby menu. BUILD also buys the next free pad. Build one tower before starting or upgrading a gun; START WAVE begins combat after preparation/celebration. Max level3.
- Gun models on the right: Pistol starts unlocked; Shotgun unlocks at wave3, Sniper at wave5. Point/click/tap an unlocked model to equip. Its lower price line upgrades between waves. Locked models remain visible with their unlock waves.
- Desktop: click or Space fires one pistol round per fresh press; shotgun/sniper retain held cadence. Drag aims, WASD moves, R reloads, Q cycles guns, U upgrades, Enter starts a wave. H swaps XR gun hand. Touch: left drag moves, right tap/drag fires/aims; large RELOAD button assists. Cancellation and orientation change stop input.
- XR: gun trigger selects cards/pads/nearby actions and fires during combat. Supporting grip removes/grabs magazines; drop the empty, grip the actual full magazine at the supporting hip, insert and release. Throws inherit hand velocity, fall and bounce; pick them up where they land. Reseating preserves remaining ammo. Automatic chambering takes120ms. Grip near the ready gun's handle transfers it. No VR face-button, supporting-trigger, R or hidden-button assisted reload. B/Y cycles unlocked guns; left stick moves, right stick snaps30degrees per flick. With one controller vertical stick moves and horizontal turns; exit VR for desktop reload if the support controller is unavailable.
- Supply is unlimited; only an available fresh magazine is displayed at the hip, after removal and while no magazine is held. One discarded visual shell is reused. Towers award points. OutsideVR, R/RELOAD assists in one second. Release/repress after reloading; firing is blocked during loading/chambering. New runs start loaded, reset economy/upgrades and relock later gear. One six-wave campaign with replay.
- Engine-default animated controller hands are not optical finger tracking. Gun pitch is fixed at16degrees downward relative to the grip. Aim follows the actual XR barrel. Hip reach/physical alignment remain unverified. Sniper optic is open with a reticle, without magnification.

## Artifact and reproduction

competition/rainbow-herd.zip: **13,297 bytes**, 15 free. SHA256 **5b4932db56fcf676bed1fb0e51b19d2ff3980768b0562fc233d42fed79b89fa3**. Root index.html including decoder. Anatomy pin: eb8ff13121219f617dffb66716c213aee5c6f37b. Current source revision will be recorded at publication.

Node22+: clone recursively, npm ci, npm run test:13k. npm test validates the real review Worker and passes63 tests. Install Chrome/Playwright Firefox, run npm run serve:game, then npm run smoke:browser, node scripts/smoke-touch.mjs and npm run smoke:xr. Browser smoke extracts the final ZIP. XR smoke packs instrumented production source and uses IWER; instrumentation/emulator are absent from the artifact. Readable originals: competition/game.js, defense.js, weapon.js and engine-hands.js. Builds decode/compare the full strict minified program before emission; generated unpacked.js/packing.json remain outside ZIP for audit.

Real extracted-candidate screenshots: evidence/final/cover.png (800×500; 124,414 bytes) and thumbnail.png (320×320; 49,394 bytes). They satisfy verified PNG caps. The short smoke covers opening/reload. The final audio ZIP also completed all six waves and replay using normal Chrome input, crystal20/20, score11570, zero runtime errors; see AUDIO.md. Two normal-input automated campaigns on the previous version23 ZIP complete all six waves, tower and gun upgrades, unlocks, victory and replay in Chrome and Firefox with crystal20/20, score11570 and no errors. See COMPLETION_V23.md.

## Provenance

Tiny Unicorn Lab is canonical shared original geometry, pinned/bundled at build time. Canonical anatomy now closes open loft ends without changing any shape points; the guarded tower adapter extracts Prism/Frost compositions from that same pinned source and uses injected engine primitives. Hands use permitted A-Frame default lowPoly models. Prism Keep's concept was adapted without a second engine/runtime. Spillway-inspired handling is independently implemented; no reference model/physics/weapon framework imported. No general license was found in reference game sources; confirm publication rights/desired license before public release. Build tools retain third-party licenses. Roadroller2.1.0 is MIT; its generated public-domain decoder is inside the measured payload. No runtime WebAssembly. Sources/decision: WHOLE_GAME_PASS.md.

The previous source/history scan found no common API/private-key patterns, but is not a forensic guarantee. Git history/metadata can contain personal author or private deployment context. Both game and anatomy repositories remain private; latest source-run34731811177 fails during anatomy checkout. No visibility or credential scope was changed.

## Human release checks

Before the verified September 13, 2026 deadline (13:00 CEST / 14:00 Jerusalem):

1. On Quest, open the direct private game and check startup responsiveness, enable audio, build/start/cleanse. Test seated sticks, barrel alignment, angle/hand clearance, throw/pickup/hip supply/seat, grip handover, automatic chambering and progress feedback, blocked VR button reload, held-trigger latch, controller loss, exit/reentry and permission rejection. Desktop decoder measurements do not establish physical Quest startup time.
2. Play the six-wave campaign normally, buy and upgrade both tower types, unlock and use shotgun/sniper, defeat the boss and start a fresh run. Check board/gun-display readability and sustained horde comfort/performance. Test physical phone movement, aim, reload, tap purchases and rotation.
3. Authorize/review organizer-readable game and anatomy source, resolve CI access and rerun a clean clone. Accept competition terms, upload artifact/source/screenshots and verify receipt/hash. No submission or terms acceptance has been performed.

Historical idealized beam-bot results predate the semi-auto pistol. Previous normal-input campaign evidence is evidence/td-ux/campaign.json; automated success is not a human difficulty guarantee.

The five persistent side model cards show all playable guns/towers with unlock waves and selection/level/price states. Tower actions are on an individual nearby panel; choose a model and pad first, confirm spending second. Wave completion celebrates for three seconds and requires a deliberate next-wave start. The sniper optic is open with a reticle, without magnification. See docs/TD_UX.md.

Canonical Prism/Frost tower recipes are specialized from the pinned Tiny Unicorn Lab source at build time; the anatomy file closes its loft ends while retaining all shape points. Upgrades scale these base forms, rather than importing the whole evolution catalogue. UI HTML/CSS now joins the packed strict source. Physical Quest/phone evaluation remains open.

Submission playtest and keyboard-focus fix: see SUBMISSION_PLAYTEST.md. The game test runner now includes all game suites, including canonical towers. Public-source and physical-device checks remain open.
