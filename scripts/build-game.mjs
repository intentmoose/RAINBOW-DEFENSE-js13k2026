import {towerSubsetPlugin} from './tower-subset.mjs';
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { build } from "esbuild";
import { minify } from "terser";
import { deflateAsync } from "@gfx/zopfli";
import { Zip, ZipPassThrough } from "fflate";
import { gameMinifyOptions } from "./game-minify-options.mjs";
import {packGame,packingOptions} from './pack-game.mjs';

const gameRoot = "competition", gameDist = `${gameRoot}/dist`, publicGame = "public/play";
const shell = (await readFile(`${gameRoot}/index.html`, "utf8")).replace(/\r\n/g,'\n');
const bundled = await build({plugins:[towerSubsetPlugin],
  entryPoints: [`${gameRoot}/game.js`],
  bundle: true,
  minify: false,
  format: "esm",
  target: "es2020",
  external: ["https://*"],
  write: false
});
// Only audited weapon/defense-owned fields are renamed; engine, browser and XR APIs stay intact.
// Unused frozen literal presets in the anatomy module have no observable reader.
const style=shell.match(/<style>([\s\S]*?)<\/style>/)[1],body=shell.slice(shell.indexOf('<div id=c>'),shell.indexOf('<script type=module src=game.js>'));
const boot='document.body.innerHTML='+JSON.stringify('<style>'+style+'</style>'+body)+';';
const minified=(await minify(boot+bundled.outputFiles[0].text, gameMinifyOptions)).code;await mkdir('work',{recursive:true});await writeFile('work/menu-minified.js',minified);
const {game,source,modelMemoryMB}=await packGame(minified);
// One ZIP entry; the generated JavaScript decoder is included in this byte budget.
const html=shell.slice(0,shell.indexOf('<style>'))+'<body bgcolor=#120a28 text=white>Loading...<script type=module>'+game+'</script>';
const compressed = await deflateAsync(html, { numiterations: 100 });
const chunks = [];
const zip = new Zip((error, data) => { if (error) throw error; chunks.push(data); });
const entry = new ZipPassThrough("index.html");
entry.mtime = new Date("2000-01-01T00:00:00Z");
entry.compression = 8;
entry.process = (_, final) => entry.ondata(null, compressed, final);
zip.add(entry); entry.push(Buffer.from(html), true); zip.end();
const archive = Buffer.concat(chunks);
// Fail closed BEFORE replacing the preserved working artifact or its playable copy.
if (archive.length > 13_312) {
  await mkdir("work", { recursive: true });
  await writeFile("work/oversize.zip", archive);
  throw new Error(`Prototype ZIP ${archive.length} / 13,312 bytes; candidate preserved`);
}

await mkdir(gameDist, { recursive: true });
await mkdir(publicGame, { recursive: true });
await writeFile(`${gameDist}/index.html`, html);
await writeFile(`${gameDist}/game.js`, game);
await writeFile(`${gameDist}/unpacked.js`, source);
await writeFile(`${gameDist}/packing.json`, JSON.stringify({packer:'roadroller@2.1.0',options:packingOptions,modelMemoryMB},null,2)+'\n');
await writeFile(`${gameRoot}/rainbow-herd.zip`, archive);
await writeFile(`${publicGame}/index.html`, html.replace("https://play.js13kgames.com/2026/webxr/aframe.js", "/play/aframe.js"));
await writeFile(`${publicGame}/game.js`, game);
await writeFile(`${publicGame}/rainbow-herd.zip`, archive);
await writeFile(`${publicGame}/aframe.js`, await readFile("node_modules/aframe/dist/aframe-v1.8.0.min.js"));

const bytes = (await stat(`${gameRoot}/rainbow-herd.zip`)).size;
console.log(`Rainbow Herd competition ZIP: ${bytes} / 13,312 bytes`);
if (bytes > 13_312) process.exit(13);
