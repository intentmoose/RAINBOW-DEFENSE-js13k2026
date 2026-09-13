import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {build} from 'esbuild';
import {minify} from 'terser';
import {deflateAsync} from '@gfx/zopfli';
import {createHash} from 'node:crypto';
import {gameMinifyOptions} from './game-minify-options.mjs';
// Trial builds stay outside the release artifact. ZIP overhead is the fixed
// 134-byte header/descriptor/directory used by scripts/build-game.mjs.
const source=(await build({entryPoints:['competition/game.js'],bundle:true,write:false,format:'esm',target:'es2020'})).outputFiles[0].text;
const shell=await readFile('competition/index.html','utf8');
const results=[];
const trials=[
 ['standard', {module:true,compress:{passes:2},mangle:true}],
 ['drop-unused-frozen-presets',{module:true,compress:{passes:2,pure_funcs:['Object.freeze']},mangle:true}],
 ['selected',gameMinifyOptions],
 ['selected-one-pass',{...gameMinifyOptions,compress:{...gameMinifyOptions.compress,passes:1}}],
 ['selected-five-passes',{...gameMinifyOptions,compress:{...gameMinifyOptions.compress,passes:5}}],
 ['rejected-boolean-types',{...gameMinifyOptions,compress:{...gameMinifyOptions.compress,booleans_as_integers:true}}]
];
for(const [name,options]of trials)for(const iterations of [30,100]){
 const game=(await minify(source,options)).code;
 const html=shell.replace('<script type=module src=game.js></script>',`<script type=module>${game}</script>`);
 const zipped=await deflateAsync(html,{numiterations:iterations});
 const result={name,iterations,minifiedBytes:Buffer.byteLength(game),deflatedBytes:zipped.length,zipBytes:zipped.length+134};results.push(result);console.log(result);
}
await mkdir('evidence/optimization',{recursive:true});
await writeFile('evidence/optimization/compression.json',JSON.stringify({bundledSourceSha256:createHash('sha256').update(source).digest('hex'),results:results.sort((a,b)=>a.zipBytes-b.zipBytes)},null,2));
