import assert from 'node:assert/strict';
import test from 'node:test';
import{readFile}from'node:fs/promises';
import{packGame,decodeGame,packingOptions}from'../scripts/pack-game.mjs';

test('fixed text packing preserves strict JavaScript, Unicode and HTML-sensitive strings exactly',async()=>{
 const source='globalThis.sample="</script> rainbow 🌈 · magazine";globalThis.ready=true;';
 const a=await packGame(source),b=await packGame(source);
 assert.equal(a.game,b.game);assert.equal(decodeGame(a.game),'"use strict";'+source);assert.doesNotMatch(a.game,/<\/script/i);assert.equal(packingOptions.allowFreeVars,false);
});

test('release decoder reproduces the complete audited minified game',async()=>{
 const packed=await readFile('competition/dist/game.js','utf8'),source=await readFile('competition/dist/unpacked.js','utf8');
 assert.equal(decodeGame(packed),source);assert.ok(source.startsWith('"use strict";'));assert.doesNotMatch(source,/\b(?:eval|Function|WebAssembly|fetch)\s*\(/);
});
