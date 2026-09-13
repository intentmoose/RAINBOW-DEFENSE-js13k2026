# Browser QA: normal input, 2026-09-12

Installed **Chrome 153.0.8010.36**, headless, Playwright 1.63.0. Tested the direct
`http://127.0.0.1:4173/competition/dist/` page. Desktop used real mouse/key input;
touch used native Chrome DevTools touch dispatch and Playwright taps. No debug
hooks, source interception, or progression injection was used.

This is iteration evidence, not a frozen final-artifact certificate. Main's build
changed between the independent desktop and touch page loads. Each open page
retained its loaded payload. Exact response hashes, DOM observations, and network
responses are in [browser-qa.json](browser-qa.json).

## Observed passes

- Desktop **1100 x 760**: normal center hold recovered the first friend by about
  three seconds, with **71–76% energy remaining**. The creature visibly changed
  allegiance and the HUD reported HERD 1.
- Immediate keyboard R reload in live combat displayed LOADING, completed at
  **100%**, and the ally survived this reload. Keeping Space held through the
  entire sequence did not drain energy or restart the beam. Releasing and
  pressing again reduced the display to **98%**.
- Portrait touch **390 x 844**: normal right-side touch recovered the first friend
  by about three seconds with **77%** remaining. Large reload button completed
  the assisted cycle at **100%**.
- Native touch cancellation stopped energy consumption: after the HUD's update
  delay, the display remained **96%** over a further 450ms.
- Resizing during a held touch to **844 x 390** cancelled firing: the settled
  energy display remained **92%** over a further 450ms. Screenshot inspection
  confirmed the reticle, reload button, HUD and VR entry remained visible.
- Both direct loads requested only the local page and official
  `https://play.js13kgames.com/2026/webxr/aframe.js`; both returned HTTP 200.
  No captured page exceptions or failed requests occurred.
- Defeat and RUN AGAIN were exercised through ordinary input. Restart returned
  to the first dark unicorn with a fresh weapon.

## Findings and limitations

- Opening control text contains visible **U+FFFD replacement diamonds** around
  the R/A and H instructions. Reported to the source owner for repair.
- A stationary desktop player who stopped acting after the first recovery lost
  the ally and died at eight seconds. This is a normal-input observation, not
  proof of tuning failure; continued movement and aiming were not attempted in
  that run. On the touch run, the ally was re-corrupted during the first reload,
  although the player remained alive and the reload completed. Ally protection
  therefore does not guarantee a safe reload in every encounter.
- Opening screenshots and first-recovery screenshots were visually inspected.
  The portrait gun leaves the reticle clear, but occupies a substantial lower
  right area. Nearby unicorns can cross close to the view and be clipped at the
  screen edges. Hardware comfort was not assessed.
- No normal-input draft, mounting, wings, boss or horde progression was proved by
  this bounded pass. State/transform tests are separate evidence.
- No Firefox installation was available at the standard Windows installation
  path or Playwright's expected browser path. **Firefox not tested.**
- No physical phone, physical headset, browser WebXR session, or headset frame
  performance was tested here. Page exceptions and request failures were
  captured; this pass did not subscribe to the browser console log stream.

## Captures

- [Desktop opening](browser-desktop-opening.png)
- [Desktop first recovery](browser-desktop-first-recovery.png)
- [Desktop live reload](browser-desktop-reload.png)
- [Touch opening](browser-touch-opening.png)
- [Touch first recovery](browser-touch-first-recovery.png)
- [Touch rotated with cancelled input](browser-touch-rotated.png)
