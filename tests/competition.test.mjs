import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { promisify } from "node:util";
import { strFromU8, unzipSync } from "fflate";
import {decodeGame} from '../scripts/pack-game.mjs';

const root = new URL("../", import.meta.url);
const archive = new URL("competition/rainbow-herd.zip", root);
const readArchive = async () => Object.fromEntries(Object.entries(unzipSync(await readFile(archive))).map(([name, bytes]) => [name, strFromU8(bytes)]));
const run = promisify(execFile);

test("competition ZIP stays within the exact rules limit", async () => {
  const info = await stat(archive);
  assert.ok(info.size <= 13_312, `${info.size} exceeds 13,312 bytes`);
});

test("competition ZIP is reproducible", async () => {
  const before = await readFile(archive);
  await run(process.execPath, ["scripts/build-game.mjs"]);
  assert.ok((await readFile(archive)).equals(before), 'Rebuilt competition ZIP must be byte-identical');
});

test("competition build uses only the official A-Frame exception", async () => {
  const files = await readArchive();
  assert.deepEqual(Object.keys(files).sort(), ["index.html"]);
  const html = files["index.html"];
  const [builtGame, builtHtml] = await Promise.all([
    readFile(new URL("competition/dist/game.js", root), "utf8"),
    readFile(new URL("competition/dist/index.html", root), "utf8"),
  ]);
  assert.ok(html.includes(builtGame));
  assert.equal(html, builtHtml);
  const decoded=decodeGame(builtGame),inspectable=html.replace(builtGame,decoded);
  assert.equal(decoded,await readFile(new URL('competition/dist/unpacked.js',root),'utf8'));
  const urls=inspectable.match(/https?:[^"'<>]+/g)??[];
  assert.deepEqual(urls,["https://play.js13kgames.com/2026/webxr/aframe.js"]);
  assert.doesNotMatch(inspectable,/three\.core/);
  assert.doesNotMatch(inspectable.replace(urls[0],''),/(?:https?:)?\/\/|\b(?:fetch|WebSocket|EventSource|XMLHttpRequest|WebAssembly)\b|import\s*\(/);
});

test("hosted preview uses the pinned local A-Frame build", async () => {
  const [html, preview, pinned, manifest] = await Promise.all([
    readFile(new URL("public/play/index.html", root), "utf8"),
    readFile(new URL("public/play/aframe.js", root)),
    readFile(new URL("node_modules/aframe/dist/aframe-v1.8.0.min.js", root)),
    readFile(new URL("node_modules/aframe/package.json", root), "utf8"),
  ]);
  assert.match(html, /<script src=\/play\/aframe\.js>/);
  assert.equal(JSON.parse(manifest).version, "1.8.0");
  assert.deepEqual(preview, pinned);
});

test("archive-root HTML points at the packaged game", async () => {
  const html = (await readArchive())["index.html"];
  assert.match(html, /<script type=module>/);
  assert.match(html, /<title>Rainbow Herd<\/title>/);
});
