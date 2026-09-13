> Historical report for the preserved allied-herd game at638b22e. The approved combined replacement and current measurements are in [DEFENSE_DESIGN.md](DEFENSE_DESIGN.md).

# Rainbow Herd optimization audit

## Result

The optimized game retains its combat, conversion, herd, riding, flight, blaster and WebXR controls. It adds soft ground shadows, reduces rendering work and retained geometry data, and finishes at **13,183 bytes**, compared with **13,220 bytes** before the audit. The net archive saving is **37 bytes**, leaving **129 bytes** under the existing 13,312-byte gate. This is a useful renderer improvement, not enough archive space for a tower-defense expansion.

The clearest visual change is grounding: soft elliptical shadows make the positions of walking and flying unicorns easier to read. They use one instanced batch and an analytic fragment shader, with no image texture, shadow-map allocation or additional light-rendering pass. Creature anatomy and its pinned upstream revision are unchanged.

## Three separate budgets

Compressed download size, retained runtime data, and per-frame work are different constraints. A small ZIP can expand into large buffers; a preallocated buffer can avoid garbage collection while still submitting invisible geometry. Reducing one number does not establish a reduction in the others.

| Measurement | Before | After | Change |
| --- | ---: | ---: | ---: |
| Competition ZIP | 13,220 B | 13,183 B | 37 B smaller |
| Headroom under current build gate | 92 B | 129 B | 37 B more |
| Geometry and instance typed-array payload | 125,618 B | 109,022 B | 16,596 B / 13.2% less |
| WebGL contexts observed at startup | 2 | 1 | Redundant context removed |
| Submitted triangles, 1 creature | 37,792 | 2,636 | 93.0% fewer |
| Submitted triangles, 16 mixed creatures | 37,792 | 10,744 | 71.6% fewer |
| Submitted triangles, 48 mixed creatures | 37,792 | 27,912 | 26.1% fewer |
| Draw calls, 1 creature | 34 | 30 | 4 fewer |
| Draw calls, 16/48 creatures | 34 | 32 | 2 fewer |

These are controlled desktop measurements with identical seeded fixtures. The triangle count is submitted geometry, including the baseline's zero-scale hidden instances; it is not a measure of visible detail. The memory number counts typed-array payloads attached to scene geometry and instance attributes, deduplicating shared geometry. It excludes engine heap, object overhead, framebuffers, browser resources, GPU-driver overhead and transient allocations. It must not be presented as a 13.2% reduction in total application memory. Context count is directly observed; exact driver memory reclaimed is unknown.

## Implemented changes

### Draw only populated instances

Previously all 48 creature slots were submitted for every body-part batch. Missing wings, spare boss horns and inactive creatures received zero-scale matrices. Projectiles similarly submitted all 64 slots. The new renderer packs existing parts into each batch and sets its instance count to the populated length. Empty batches are hidden. Simulation slots remain stable, so targets, allies and the mounted creature keep their identities.

Three.js exposes the instance count separately from allocated capacity. Its documented instancing mechanism reduces repeated draw submissions; here it also avoids processing unused members of a batch. The implementation was checked against the installed A-Frame runtime's **Three revision 184**, rather than assuming the current online release was identical. [1]

### Smaller color buffers and fewer transfers

Creature instance colors now use normalized unsigned bytes instead of 32-bit floats. The color storage component falls by **9,072 bytes**, with a maximum rounding error of about 0.00196 per linear color channel. The renderer uses BufferAttribute.setXYZ, which performs normalization correctly; Three's setColorAt writes directly to its array and would be wrong for this representation. Only populated matrix/color ranges are marked for upload. [2]

This change quantizes color slightly. Side-by-side inspection showed the palettes and archetype colors intact; it is not mathematically pixel-identical. Geometry, motion and silhouettes remain unchanged.

### Remove unused primitive attributes

Untextured, unlit rainbow, projectile, beam, draft and shockwave geometry no longer retain normals and UV coordinates. Their materials do not use these attributes. This removes **10,880 bytes** of geometry arrays without reducing vertices. The shadow plane retains its UVs because its shader uses them. Canonical unicorn geometry is neither replaced nor mutated.

The shadows add a small plane plus 48 instance records. After those additions, the combined geometry/instance payload still falls by 16,596 bytes. A renderer can retain other resources beyond these arrays, so these figures are deliberately narrower than a total VRAM claim. [3]

### Avoid idle effects work

The draft crystals and player beam skip their transform work while invisible. Expired projectiles are excluded immediately, including their collision frame. Particles stop drawing when empty; particle colors upload only when a burst changes them. The existing particle capacity and burst behavior are preserved. The ally line buffer no longer clears coordinates that lie outside its active draw range.

### Reuse the startup context

The old capability probe created a WebGL2 context, then the renderer created another on a second canvas. The renderer now uses the probe's canvas and context, with the requested antialiasing and power settings supplied at creation. The deterministic browser audit observes two contexts before and one afterward. Avoiding an unused context follows WebGL resource-management guidance without relying on garbage collection to reclaim it later. [3]

### Pay for the visuals through build-time compression

The existing geometry module exports frozen character presets that Rainbow Herd does not consume. Treating Object.freeze as pure lets the minifier discard those unused fresh literal presets; required geometry construction remains. A narrowly enumerated set of weapon-owned property names is also shortened. An AST regression check fails if those names appear on external API objects, and a compiled/uncompiled transition test compares the weapon state over 30 physical/assisted/interrupted cycles.

On the final source, ordinary compression alone would produce 13,458 bytes. Removing unused frozen presets gives 13,285; scoped weapon renaming gives 13,191; increasing Zopfli from 30 to 100 iterations gives **13,183**. These are alternative builds of the same final source, not independent savings to add to the original baseline. [4][5]

There is no runtime unpacker, eval wrapper, new external asset or runtime WebAssembly. Extra compression work happens during the build.

## What the timing evidence supports

The median time for creature transform/color synchronization in the local microbenchmark changed from approximately 0.060 to 0.006 ms with one creature, 0.100 to 0.057 ms with 16, and 0.186 to 0.166 ms with 48. These timings are useful for finding waste, but they cover only one CPU function. They are not frame times, FPS measurements or Quest performance results. The full pool gains less because most creature parts already exist and must still animate.

The desktop audit rendered deterministic 800×500 frames using the local pinned A-Frame build. The actual submission archive was separately exercised with normal input in Chrome and Firefox against the official hosted engine. Browser and IWER results support correctness; physical-device comfort, thermal behavior and sustained horde performance remain unmeasured.

## Alternatives evaluated or deferred

| Option | Assessment |
| --- | --- |
| More Terser passes | Five passes produced no extra benefit over two on the final source. |
| Boolean-to-integer compression | Smaller trial output, rejected: renderer APIs contain strict boolean checks. Preserving types matters more than a few bytes. |
| Aggressive global property renaming | Rejected. Browser, audio, Three and XR names are external contracts. |
| Smaller rendering resolution | Can reduce framebuffer cost, but softens the image. Existing pixel-ratio cap is preserved. |
| Real-time shadow maps or bloom | Would add rendering passes and render targets. Analytic grounding is a better fit here. |
| Smaller creature/projectile pools | Changes horde behavior. Existing 48/64 limits remain intact. |
| Simplified or replaced unicorn geometry | Unnecessary for the measured win; preserve the shared anatomy source. |
| Custom packed transforms or a bespoke renderer | Potential larger memory gains, but substantial shader/architecture complexity and XR regression exposure. Requires its own prototype and hardware measurements. |
| More efficient tower-defense design | A separate product decision. Replacing allied-herd systems may make room; adding towers to this candidate does not fit the current reserve. |

## Verification and reproduction

The full build and **44 Node tests** pass, including new sparse-pool rendering, particle expiry, private-property isolation and minified weapon-transition checks. Chrome 153 and Firefox 155 pass first recovery and reload on the extracted archive with no reported errors. IWER 2.3 passes the stereo cartridge, partial/full charging, one-controller recovery and session reentry sequence. One hundred simulated resets keep the renderer's geometry/texture counts stable; this is a bounded resource check, not proof that all heap allocations are leak-free.

Evidence: `evidence/optimization/baseline.json`, `final.json`, `compression.json`, and paired `baseline-16.png` / `final-16.png`. Browser evidence: `evidence/final/browser.json`; XR evidence: `evidence/xr-browser.json`. The baseline ZIP is preserved in `evidence/optimization/baseline.zip`; its source is available at a0552a4's competition/game.js. Run `node scripts/audit-render.mjs LABEL [SOURCE_FILE]` for renderer comparisons and `node scripts/audit-compression.mjs` for compression trials.

Final ZIP SHA256: `d4ea4b6df794b4a3d5f328cf795267c36dd6bb3729596cbb66fa29a019c8621b`.

## Sources

1. Three.js, [InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html), accessed 2026-09-12; cross-checked with the installed r184 source.
2. Three.js, [BufferAttribute](https://threejs.org/docs/pages/BufferAttribute.html), accessed 2026-09-12; local BufferAttribute.setXYZ and InstancedMesh.setColorAt implementations inspected.
3. Mozilla, [WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices), accessed 2026-09-12; Three.js, [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html).
4. Terser, [compression and property-mangling documentation](https://github.com/terser/terser), accessed 2026-09-12; installed Terser 5.47.1 documentation also inspected.
5. Google, [Zopfli compression algorithm](https://github.com/google/zopfli), accessed 2026-09-12. Measurements use the project's pinned build-only package.
