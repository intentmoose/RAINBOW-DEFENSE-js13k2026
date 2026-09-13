# Hip-pouch reload — 2026-09-13 Jerusalem

Historical version15 record. Mandatory cocking is superseded by automatic chambering; see [AUTO_RELOAD.md](AUTO_RELOAD.md) for current behavior.

User approved the proposed hip ammo pouch and asked whether AR/sniper existed and whether tower cleanses should restore ammunition. Implemented the pouch. Weapons remain rainbow beam, shotgun unlocked at wave3 and sniper at wave5; no assault rifle has been added. Ammo supply remains unlimited, with tower cleanses paying upgrade points. Tower-dependent ammo was discussed but not implemented; it could strand a player whose defenses are struggling.

## Interaction

- A cyan pouch sits 30cm to the supporting-hand side, 22cm forward and 60cm below the headset, clamped above the floor. It mirrors with actual gun ownership, follows player translation/horizontal head facing and adapts to seated height. Looking steeply downward preserves its previous heading. This estimates a reachable body location; it does not track actual hips.
- Grip/remove the empty, release to drop or throw, then grip the pouch within a generous22cm capture radius. Its outline brightens on proximity, and the gun display says GRIP: FRESH MAGAZINE.
- The new magazine follows the supporting hand. Insert/release at the highlighted socket for a click/haptic, then pull/release the blue charging handle. Existing8cm stroke, partial-pull rejection, held-trigger latch, interruption behavior and gun handover remain.
- Reinserting a magazine preserves its remaining energy. An empty no longer refills merely by reseating; pouch supply grants12 energy while unseated, and A/X/R/support-trigger assisted reload explicitly restocks at seating. Loaded guns cannot gain ammo by touching the pouch.
- Current magazines retain world-space throw/pickup behavior. On fresh supply, one reusable visual discarded shell preserves the old magazine's world pose/velocity and falls/bounces. The oldest shell is recycled on subsequent supply. It is a visual discard, not a second interactive inventory. Reset hides it. No unbounded magazine allocation.
- Opening instructions teach drop empty → grip hip ammo → insert → pull/release. Empty/held/fresh states have distinct cues. Desktop/touch retain assisted-reload guidance; the pouch is VR-only.

## Evidence

Final ZIP **13,302 / 13,312 bytes**, **10 free**,277 more than version14. SHA256 **a61f3e8aebc08df8ac5dacd46b272c185791a5ccaa7f1ae6af983c1e880c9bb0**. Single root index.html, unchanged fixed Roadroller settings and canonical anatomy pin24c889d61af2cbe95e06fdb0c62d8fb57676e649. No new external assets/engine. Ordinary build reconstructed exact source and reproduced the ZIP in a separate process.

`npm test` built/verified the real Sites Worker and game, passing **55/55 tests**. Five new pouch tests cover both gun hands, fresh versus empty ammo, loaded-gun protection, seated/translated/rotated placement, look-down stability, desktop guidance,20 supply cycles without scene growth and reset. Existing throw, scale, physical/assisted reload, gameplay and packing tests remain green.

Final extracted ZIP passes Chrome153 / Firefox155 normal tower purchase, first cleanse and reload with zero errors. Native emulated390×844 touch passes cancellation/rotation/purchase/reload. Packed instrumented IWER2.3 passes pouch pickup and manual reload in both hands, old throw/recall, partial/full stroke, handover, locomotion/snap, one-controller assist, weapon unlocks and reentry/model reuse. An initial XR run outpaced its fixed1.45-second wait; the smoke now waits for actual reload/charging completion, then passes. This is simulation evidence, not a headset test. Inspected the stereo pouch screenshot in evidence/xr-hip-pouch.png.

Screenshots: cover800×500 /121,625 bytes; thumbnail320×320 /51,826 bytes. Exact artifact/browser results: evidence/final/browser.json. XR records: evidence/xr-browser.json. Physical Quest reach/comfort and full normal campaign/phone evaluation remain open. Published owner-private as version15 from94ab4c09538207b93d3e462a4845822477c94140 at2026-09-12 23:03:12 UTC. Live ZIP matches; updated instructions and normal purchase/start/assisted reload pass. Exact receipt: RELEASE_RECEIPT.md and evidence/hip-pouch/deployment.json. No visibility, access, terms or competition submission change.
