# Version23 completion playtests

The user asked for playtests that try to complete the game. Completed two full campaigns on the current version23 extracted competition ZIP using ordinary Playwright mouse, keyboard and button inputs. No game-state injection, invulnerability, accelerated time or gameplay edits. Both runs exercise Pistol/Shotgun/Sniper, wave3/wave5 unlocks through the actual side cards, both tower types, nearby tower upgrades, gun upgrades, repeated reloads, all six waves including the final boss, victory and a fresh replay.

Firefox155.0: victory, CRYSTAL 20/20, score11570, POINTS 870 remaining; 222s including preparation/replay. All six waves completed and zero runtime errors. Replay restores70 points,20 health and locked later weapons.

Chrome153.0.8010.36: victory, CRYSTAL 20/20, score11570, POINTS 870 remaining; 226s including preparation/replay. All six waves completed and zero runtime errors. Replay restores70 points,20 health and locked later weapons.

Evidence: evidence/completion-v23/summary.json and per-browser campaign.json, wave1–6 screenshots and result.png. Result and later-wave screenshots inspected. The campaign runner now supports --firefox and --output so browser evidence can be preserved independently, with browser/version/timestamps and failure capture. No product source, balance, geometry, controls or ZIP changed. Artifact remains13,307/13,312 bytes; SHA256 a63ff9079ffa3795c08d64cd86d585d06c03b682ddbbe5a3f58647d7d7fc1cd8. Existing owner-private version23 deployment from65e765a170acf8e55835a081acda0f7bb66bccfa remains live. Tests/evidence/handoff are committed and pushed to origin/main; no redeployment needed.

These are automated desktop completion runs, not physical Quest/phone tests or a human difficulty guarantee. No gameplay blocker reproduced. Physical VR reach/comfort, human difficulty and organizer-readable source/CI access remain open. No competition submission or visibility change. See docs/COMPLETION_V23.md.
