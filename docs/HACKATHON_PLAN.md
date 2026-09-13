# Rainbow Herd — 2026 hackathon plan

Latest execution: 2026-09-12 — physical blaster candidate. See PROJECT_STATE.md and docs/SUBMISSION.md for the verified current result, artifact, and remaining hardware/source-access gates. Historical plan/audit follows.

Last historical audit: 2026-09-01
Submission deadline recorded in `docs/RULES.md`: 2026-09-13 13:00 CEST

## Mission

Ship the primary unicorn-and-rainbow entry as the WebXR game judges remember:
the player does not destroy enemies; they recover them, grow a living herd, ride
that herd into flight, reclaim the Nightmare Alicorn, and survive the friends
turning against one another again.

The winning thesis is **conversion with consequences**. Every improvement must
make at least one of these easier to perceive or more satisfying to perform:

1. an enemy visibly becoming a friend;
2. that friend retaining a useful identity and fighting beside the player;
3. the herd becoming the player's health, mobility, and spectacle; or
4. the late game paying off the promise of a rainbow civil war.

Breadth is not the goal. A clear first minute, excellent conversion feedback,
comfortable headset interaction, and a memorable alicorn climax outrank another
system.

## Audited baseline

| Area | Current truth | Assessment |
| --- | --- | --- |
| Competition artifact | Checked-in `competition/rainbow-herd.zip` is **12,300 / 13,312 bytes** | Legal, with **1,012 bytes absolute headroom**; already 300 bytes above the 12,000-byte engineering target |
| Packaged files | Root-level `index.html` and `game.js` only | Correct shape in the checked-in artifact |
| External engine | Organizer-hosted A-Frame 1.8.0 only | Matches the documented WebXR exception |
| Tiny Unicorn Lab | Submodule pinned at `24c889d61af2cbe95e06fdb0c62d8fb57676e649`; imports `createTinyUnicornGeometry` | Correct dependency boundary; no local anatomy fallback found |
| Shared anatomy | 346 vertices / 635 triangles, then batched into herd-level instanced parts | Strong technical and visual identity story |
| Runtime bounds | 48 unicorn slots, 64 projectile slots, 240 spark slots | Allocation is bounded; pool saturation becomes gameplay |
| Gameplay test | `node --test tests/gameplay.test.mjs` passes | The designed happy path is connected |
| Local competition build | `npm run build:game` uses the deterministic Node packager | Reproducible on this Windows host and CI |
| Competition tests on Windows | `npm run test:13k` passes the portable artifact checks | Clean release signal without the WSL-only preview wrapper |
| Budget documentation | `docs/BUDGET.md` says 11,662 bytes; integration doc says 12,302; artifact is 12,300 | Documentation drift must be eliminated by generated reporting |

The repository was clean before this plan was added. No gameplay code was changed
as part of this audit.

## Build 1 result — 2026-08-28

The first focused implementation adds opening-language clarity and a true
in-memory run reset without changing anatomy or adding a new system:

- the start screen now explains that holding the rainbow restores the dark
  unicorn and that recovered friends fight and protect the player;
- the opening phase and idle prompt explicitly direct the player to save and aim
  at the first dark unicorn;
- `HERD` / `LOST` replaces implementation-language `GOOD` / `EVIL` counters;
- targeted progress counts upward as `REMEMBERING 0–100%`;
- the first conversion says that the recovered friend fights with the player;
- loss now resets pools, progression, player pose, prompts, and the opening enemy
  in memory, preserving the best score without reloading the page; and
- the gameplay test proves the opening HUD and complete initial state after a
  restart.

Build 12 keeps the emotional finale payoff, repairs the headset entry path, and
adds an XR comfort pass: controller disconnect releases the beam, locomotion
has a stick-drift dead zone, mounted XR speed is reduced, and head-pitch flight
has a gentler vertical range. It also
gives the opening Charger a learning window and a larger readable silhouette:
its first hit is no longer a one-shot, while every post-recovery Charger remains
lethal. The browser receives the immersive-session request before the landing UI is
hidden or moved, and keeps that control visible while IWE finishes injecting
WebXR rather than trusting an early preflight probe. IWE and physical headsets
retain a valid user gesture. Reclaiming the Alicorn restores the
friends the player had previously saved, while never-recovered minions remain
as the opening threat of the horde. The draft's risk/reward stays legible, and
the charge remains a skill test. VR entry remains available on the loss screen
and creates a clean new run after session acceptance. Either controller can now
take over aiming, firing, and grip mounting; a disconnect only releases the
beam when it is the active controller. Measured deterministic artifact:
**12,645 / 13,312 bytes**, leaving **667 bytes**. SHA-256:
`7A1A519CDFF78ECF4BF1E9FC84C145428CD398F642FC462BB3B4D2172155621A`.
The competition and gameplay checks pass 6/6 on Windows.
The fifth check rebuilds the ZIP and requires byte-for-byte equality, protecting
the deterministic package from timestamp and compressor drift.

IWE paired-tab check, 2026-08-29: the bridge reports status correctly. A VR
session is intentionally not offered until the player presses the in-page
**ENTER VR** control, which is the required browser user gesture; acceptance,
controller lifecycle, select, and squeeze remain pending that gesture.

## Gameplay and UX audit

### What already works in the design

- Sustained rainbow aim cleanses instead of damages; lock strength increases the
  cleanse rate and visibly powers the beam.
- Conversion changes allegiance in the existing slot. Converted Chargers,
  Casters, Wardens, and Pegasi retain their combat behavior and mutation.
- Hostile projectiles can be intercepted and reflected into hostile unicorns.
- The herd is the first health layer. When no friend remains nearby, corruption
  reaches the player and ends the run.
- The first three unique recoveries trigger a physical three-prism draft. The
  selected benefit goes to the player and the rejected mutations enter the enemy
  pool.
- Four unique recoveries unlock mounting; eight awaken wings on the mount;
  twelve summon the three-stage Nightmare Alicorn.
- Alicorn phase transitions create corruption and skyfall events. Reclaiming it
  starts the endless horde, including mass-corruption civil wars.
- Desktop, split-touch, and first-controller WebXR inputs all reach the same loop.
- The headset horizon stays stable while the mount is positioned beneath the rig.
- Procedural geometry, audio, effects, and fixed-size arrays suit the 13 KiB story.

### What is likely costing judge comprehension

- The first screen describes controls and theme, but not the immediate danger,
  the herd-as-health rule, or what a converted archetype will do for the player.
- Archetypes use eye colors and behavior, but their role silhouettes and attack
  telegraphs are not guaranteed to be legible in a busy headset scene.
- The draft is communicated as `RED CHAIN · VIOLET GUARD · GOLD POWER`; the three
  identical prism shapes do not explain the choice or the cost of rejection.
- `GOOD` and `EVIL` counters describe implementation, not player emotion or
  tactics. The player needs to read friend count, immediate threat, and personal
  corruption without decoding labels.
- Important events compete for one short toast channel. Phase attacks, friend
  loss, unlocks, and tutorials can overwrite one another.
- The boss has real mechanics but limited anticipation. A nine-second dark
  rainbow that directly calls `hurt()` needs an unmistakable spatial/audio
  warning to feel fair rather than arbitrary.
- The automated test proves one progression path, but not input/session
  lifecycle, reflected projectiles, mounting loss, pool saturation, restart data,
  or long-run stability.
- Two controllers are wired with last-active hand selection, but there is still
  no emulator or physical-Quest evidence for hand switching, framerate, or
  comfort.

## Priority order

### P0 — Make every byte and release claim trustworthy

Before changing game feel, make one command build and verify the exact artifact
on Windows and CI. Replace shell-only ZIP assumptions or explicitly vendor a
known packaging path. Make archive tests consume valid native paths. Normalize
the hosted A-Frame copy byte-for-byte. Generate the budget value from the final
ZIP so three documents cannot disagree again.

Acceptance checks:

- A fresh clone plus submodule checkout can run the documented install/build/test
  sequence on this host.
- The build regenerates the ZIP rather than silently relying on the checked-in
  artifact.
- Two consecutive builds from unchanged inputs have the same hash and size.
- Tests inspect the regenerated archive, its two root entries, its sole external
  URL, and the exact hosted A-Frame copy.
- The reported size is exactly the filesystem size and remains at most 13,312.

### P1 — Make the first 60 seconds self-explanatory and delightful

The first conversion is the trailer moment. Improve target readability, beam
contact, the corruption-to-friend transition, the new ally's immediate helpful
action, and the HUD wording before adding more content. Teach through staged play
and spatial response, not a paragraph.

Acceptance checks:

- A new player can start, identify the hostile target, convert it, and explain
  that it is now an ally without external coaching.
- Beam contact, progress, completion, and interrupted contact are visually and
  aurally distinct.
- The first converted ally performs a visible helpful action within five seconds.
- Losing or re-corrupting a friend is unmistakable but not visually confused with
  conversion.
- Desktop, touch, and headset all preserve the same readable sequence.
- ZIP before/after and frame-time before/after are recorded.

### P1 — Turn the alicorn into a fair, memorable finale

Preserve the current mechanics, but stage their intent: entrance, phase tell,
counterplay, phase break, reclaim, mount payoff, then civil-war escalation. The
boss should demonstrate the whole game rather than merely have more corruption.

Acceptance checks:

- The alicorn entrance is noticed even when the player faces away.
- Every phase attack has a warning, a readable source, and learnable counterplay.
- Each phase break visibly changes the alicorn or arena state.
- Reclaiming the alicorn produces the strongest conversion response in the game
  and clearly announces the endless-horde transition.
- A first-time player can distinguish a fair loss from an unexplained one.
- The entire path remains reachable in an automated deterministic scenario.

### P1 — Prove XR comfort and performance on target hardware

Desktop fallback is valuable, but the judged category is WebXR. Controller rays,
grip mounting, locomotion, flying height, session entry/exit, and high-population
rendering need device evidence, not inference from source.

Acceptance checks:

- Meta Quest testing records headset/browser version, median and worst-case frame
  behavior, and the maximum tested active herd/projectile load.
- Trigger, grip, thumbstick, session entry, session exit, and re-entry work from a
  direct game page.
- The game remains playable when only one controller is connected and does not
  assume a particular hand.
- Flight never rotates the headset horizon or causes unrequested vertical jumps.
- UI and draft choices are readable at headset resolution and comfortable depth.

### P2 — Spend remaining bytes only on measured judge value

After P0/P1, compare candidate polish by comprehension, delight, comfort, and
compressed cost. Prefer reusing existing systems and Tiny Unicorn Lab parts.
Reject additions that only make the feature list longer.

## Top three next builds

### 1. Reproducible release lane

Deliver a cross-platform competition packager and green artifact tests. Fold size
reporting into that command and update `docs/BUDGET.md` from the measured result.
This build unlocks safe parallel work because every branch can report an honest
ZIP delta.

Do not alter gameplay in this build.

### 2. First Friend vertical slice

Polish only the opening target and first conversion: clearer hostile corruption,
beam-contact feedback, conversion anticipation, explosive friendship payoff, an
immediate ally assist, and player-language HUD copy. Use the existing Tiny
Unicorn Lab body and current effect pools; do not introduce alternate anatomy.

Run a five-person unprompted comprehension check. Target: at least four players
complete and correctly explain the conversion loop inside 60 seconds.

### 3. Nightmare Alicorn showcase plus Quest pass

Add fair phase telegraphs and distinct phase-break presentation, then validate
the full run in a headset through horde entry. This build combines the game's
most marketable footage with the riskiest device path. Capture a short direct
gameplay video once the acceptance checks pass.

## Milestones

| Date | Milestone | Exit condition |
| --- | --- | --- |
| Aug 28–30 | Release baseline | Reproducible deterministic ZIP, green local artifact tests, single authoritative byte report |
| Aug 31–Sep 3 | First Friend slice | Opening comprehension and conversion feedback pass on desktop, touch, and headset |
| Sep 4–7 | Alicorn and horde presentation | Fair telegraphs, clear phase changes, strong reclaim payoff, deterministic progression test |
| Sep 8–10 | XR and compatibility lock | Quest session/input/comfort/load checklist passes; latest Chrome and Firefox fallback smoke-tested |
| Sep 11 | Feature freeze | No new systems; ZIP at or below 12,700 to reserve at least 612 bytes for fixes |
| Sep 12 | Submission candidate | Clean-clone build, archive audit, direct-page XR run, repository/readme/license review, video captured |
| Sep 13 before 13:00 CEST | Submit | Uploaded ZIP and public source are the same verified revision and artifact hash |

## Risks and mitigations

| Risk | Why it matters | Mitigation / trigger |
| --- | --- | --- |
| Non-reproducible artifact | We cannot trust size, content, or last-minute fixes | Treat as P0; no gameplay branch merges without a generated ZIP delta |
| Only 903 bytes remain after Build 1 | Normal minifier changes can consume the reserve quickly | Require before/after ZIP measurements; seek deletions before additions; freeze at 12,700 maximum |
| Onboarding overload | The design has more depth than a judge may discover | Stage one mechanic at a time and test the first minute without verbal help |
| XR tested too late | Input, iframe, comfort, and performance failures can invalidate otherwise strong work | Start direct-page Quest checks during the First Friend build, not at feature freeze |
| Boss damage feels arbitrary | Direct periodic corruption without a clear tell reads as unfair | Telegraph source, timing, and counterplay before adding boss difficulty |
| Visual crowd ambiguity | Forty-eight related characters can hide team, role, and target state | Validate silhouettes, allegiance, corruption, and aim target under maximum crowd load |
| Shared-geometry drift | Local fixes could fork the mascot and break both games' identity | Anatomy changes land in Tiny Unicorn Lab first; pin a reviewed SHA and record geometry/ZIP/performance deltas |
| Parallel-agent collisions | `competition/game.js` is compact and conflict-prone | Assign one writer per file/build lane; integrate small reviewed changes sequentially after measured artifacts |
| Happy-path-only automation | Regressions may survive until manual XR testing | Add deterministic tests for reflection, mount loss, draft effects, pool saturation, boss tells, and restart state |

## Merge and measurement contract

Every gameplay or Tiny Unicorn Lab integration change must report:

1. exact Tiny Unicorn Lab commit, if changed;
2. ZIP size before and after;
3. gameplay tests run and their result;
4. desktop/touch/XR paths exercised;
5. maximum active units/projectiles used for the check;
6. screenshots or video for a visual claim; and
7. a rollback point if the improvement is not worth its bytes.

No local unicorn geometry, placeholder creature, or copied anatomy array is an
acceptable shortcut. Herd batching, gameplay state, animation, and effects stay
in Rainbow Herd; anatomical source stays in `vendor/tiny-unicorn-lab`.

## Final submission checklist

- [ ] `index.html` and `game.js` are the only archive-root files.
- [ ] Final ZIP is no more than 13,312 bytes and its hash is recorded.
- [ ] Only the exact organizer-hosted A-Frame URL is external.
- [ ] Clean-clone build including the pinned submodule succeeds.
- [ ] All deterministic gameplay and artifact tests pass.
- [ ] Latest Chrome and Firefox desktop fallbacks start with no console errors.
- [ ] Direct-page Quest WebXR entry, exit, re-entry, trigger, grip, and locomotion pass.
- [ ] Touch start, movement, aim, firing, and cancellation pass on a phone.
- [ ] First conversion, draft, mount, wings, three alicorn phases, horde, loss, and restart are all reachable.
- [ ] Tiny Unicorn Lab revision and final geometry/ZIP/runtime figures are documented.
- [ ] Repository source, build instructions, license/provenance, screenshots, and gameplay video are ready.
