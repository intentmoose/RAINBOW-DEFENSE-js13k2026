# Rainbow Herd agent contract

## Role

Rainbow Herd is the primary unicorn-and-rainbow game.

## Tiny Unicorn Lab dependency

- `vendor/tiny-unicorn-lab` is the only unicorn anatomy source.
- Import its public module and keep the submodule pinned to an exact commit.
- Do not add copied geometry arrays, placeholder creatures, or fallback anatomy.
- Herd batching and animation belong here; anatomy and character parts do not.
- A dependency update must record the upstream commit and resulting ZIP size.

## Competition guardrails

- Keep the submission ZIP at or below 13,312 bytes.
- Use only the official 2026 A-Frame exception as an external asset.
- Preserve WebXR and pointer/touch fallback behavior.
- Run the gameplay and competition tests after shared-geometry changes.

## Optimization priority

- "Memory budget" in this project means compressed competition ZIP bytes unless the user explicitly says runtime RAM.
- Optimize for player experience within the ZIP cap. Measure archive changes; never infer competition headroom from runtime array, texture or geometry sizes.
- Do not reject generated detail, textures or engine-default resources solely for using more RAM. Evaluate frame time, startup and stability separately with evidence; preserve useful batching and interaction safeguards.
