# Quality and ZIP budget audit — 2026-09-12

The user asked whether the earlier RAM/ZIP confusion warrants rethinking the game. Yes: some visual tradeoffs should be reopened. It does not follow that every earlier optimization was harmful, or that dropping RAM optimization removes the compressed size limit.

## Correct constraint

Re-read the current official [rules](https://js13kgames.com/2026/rules) and [WebXR page](https://js13kgames.com/2026/webxr), including their current content modules, on 2026-09-12. The cap is 13,312 bytes for the submitted ZIP. There is no numerical runtime RAM cap in those rules. The selected organizer engine and its default resources use the WebXR exception; our integration code and custom content count. Procedural meshes, textures and audio expand at runtime, so their generated size need not resemble their compressed source cost.

Frame time and stable device operation still matter to VR playability. Treat them as measured product requirements, not substitutes for the ZIP measurement. No physical Quest performance evidence has been acquired in this audit.

## Decision review

| Earlier choice | Evidence and revised judgment |
| --- | --- |
| Replace allied herd, riding and flight with points/towers | An explicit user-approved core-loop change, not a RAM necessity. Keep the combined game; do not automatically restore all modes and their complexity. |
| Procedural gloves instead of default engine hands | RAM was an invalid reason to reject engine defaults. Already corrected in version 12 with actual animated hands. |
| Half-float transforms and partial-upload bookkeeping | Complexity aimed at runtime savings. Already removed in the first usability pass; full-float transforms are current. |
| Shared geometry and instancing | Retain: they can reduce code duplication and repeated draw work without removing anatomy or limiting art direction. Sharing a mesh does not require identical scale, silhouette arrangement, material or animation. |
| Lower rainbow segments, small HUD texture, simplified shield/pads | Reopen. Current experiments below show extremely small or zero ZIP costs for more generated detail. |
| Strip unused normals/UVs | The data is unnecessary to the material, but the stripping code costs ZIP bytes. Removing it is a concrete inverse trade: slightly more runtime data and a smaller ZIP. |
| Fewer decorative gun meshes and duplicate eye glows | Review on readability and visual value. Historical changes bundled several improvements, so their individual ZIP costs were not established. RAM savings alone are insufficient justification. |
| Clouds/music removed to fit the physical gun | The historical gun prototype was 14,461 bytes. These removals addressed actual compressed size; the record does not support blaming them solely on RAM. Procedural replacements remain candidates, with new costs to measure. |
| Enemy pool 48 to 40 | Matches the existing wave-queue maximum of 40. Larger hordes need encounter and performance evaluation; the rule does not prohibit them. |
| Fixed pixel-ratio cap | Performance/visual tradeoff, not ZIP necessity. Reconsider using device evidence; indiscriminately increasing it is not an established quality win. |

## Measured alternatives

Baseline source: `865a59b`, whose game matches live version 12. The audit reproduced the release ZIP byte for byte before comparing changes. Every trial uses the actual esbuild/Terser/Zopfli settings and ZIP container, with no changes to production source or generated release assets.

| Independent trial | ZIP bytes | Difference from live |
| --- | ---: | ---: |
| Current game | 13,298 | 0 |
| HUD 384×160 → 768×320, equivalent logical layout | 13,303 | +5 |
| Rainbow 32 → 64 arc segments | 13,301 | +3 |
| Shield icosahedron detail 0 → 1 | 13,299 | +1 |
| Tower pad radial segments 12 → 24 | 13,298 | 0 |
| Retain unused primitive normals/UVs, remove stripping code | 13,288 | −10 |
| Higher-resolution HUD + smoother rainbow + no stripping code | 13,290 | −8 |
| Scenery instances 40 → 80 | 13,298 | 0 |

These are alternative whole-game compression results, not additive savings. More scenery is a cost experiment, not a design recommendation: it may obstruct the view or make the composition busier. The higher-resolution HUD adds 737,280 bytes of base RGBA pixels (four times its former texture area); that is not its total memory cost. Extra geometry also raises rendering work. Neither increase consumes that many ZIP bytes.

The combined prototype is evidence of a modest improvement at lower download size, not a claim of a dramatic makeover. Its two-dimensional board text is visibly clearer in the inspected screenshots. Headset readability and performance remain untested. Engine default hands and all current gameplay remain in every prototype.

## Quality direction

Prioritize a coherent view and readable action: a more distinctive crystal-valley composition with visible approach lanes and a clear defended landmark; differentiated tower shapes and attack motion; stronger weapon silhouettes, impact feedback and reload affordances. Use procedural generation and the existing engine where useful. Measure the whole ZIP for each coherent change, then check the actual presentation and frame behavior.

Keep the current tower-defense loop and established interaction safeguards. Do not equate extra objects, larger textures or more features with better play. Reclaim code that exists solely to save inconsequential runtime data before cutting useful guidance or visual character. No arbitrary RAM target, no byte-saving claims derived from array sizes, and no automatic architecture rewrite.

## Verification and delivery

Run `node scripts/audit-quality-budget.mjs --smoke`. Eight complete compiled prototypes rendered, bought the first tower and started a wave in Chrome 153.0.8010.36 without browser errors, using the local pinned engine. This is a limited opening-flow check, not full gameplay or XR validation. Exact results/hashes are in `evidence/quality-budget/trials.json`; browser scope/results and two inspected screenshots are alongside it. Trial HTML/ZIP files are isolated under ignored `work/quality-audit/`.

The production source, competition ZIP and live version 12 are unchanged. The audit and revised decision record are committed and pushed to origin/main. The next implementation should start with the demonstrated low-cost readability/detail changes, then evaluate a cohesive scenery/tower/gun pass with complete release checks before deployment.
