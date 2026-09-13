# Tiny Unicorn Lab integration

Rainbow Herd consumes Tiny Unicorn Lab; it does not define a second species.

## Pinned upstream reference

- Git submodule: `vendor/tiny-unicorn-lab`
- Pinned upstream revision: `24c889d61af2cbe95e06fdb0c62d8fb57676e649`
- Imported API: `src/tiny-unicorn.js#createTinyUnicornGeometry`
- Accepted upstream geometry: 346 vertices / 635 triangles

The game bundles the accepted 346-vertex / 635-triangle pool into its competition
JavaScript. There is no runtime request beyond the permitted WebXR engine and no
local fallback anatomy.

## Game-facing boundary

Gameplay owns stable unit slots and passes their state to `createTinyUnicornSpecies()`:

- position and facing
- team and continuous corruption
- archetype eye identity
- wing flag
- boss and mount flags
- animation phase and scale

The species renderer owns generated geometry, shared materials, all herd-level instances, animation poses, color transformation, wings, eyes, shields, and a stable ride pose. Converting a unit changes its state in place. No mesh or gameplay object is replaced.

Unlike the single-creature upstream showcase, Rainbow Herd batches the whole herd with one `InstancedMesh` per anatomical part. It creates no light or material per unicorn.

## Sync rule

Future Tiny Unicorn Lab revisions should update only the procedural geometry/pose layer. Every sync must record:

1. upstream revision;
2. integrated ZIP before/after;
3. vertices and triangles;
4. draw calls and runtime memory;
5. mobile/XR performance; and
6. a visual-regression verdict.

The renamed Tiny Unicorn Lab baseline is 12,300 / 13,312 bytes, leaving 1,012 bytes.
