// Isolated quality/ZIP experiments. Does not overwrite source or release artifacts.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {build} from 'esbuild';
import {minify} from 'terser';
import {deflateAsync} from '@gfx/zopfli';
import {Zip,ZipPassThrough} from 'fflate';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {gameMinifyOptions} from './game-minify-options.mjs';

const original=await readFile('competition/game.js','utf8');
const shell=await readFile('competition/index.html','utf8');
const replace=(source,from,to)=>{if(!source.includes(from))throw Error('Missing trial anchor: '+from);return source.replace(from,to);};
const hud=s=>replace(replace(s,'boardCanvas.width=384;boardCanvas.height=160','boardCanvas.width=768;boardCanvas.height=320'),'boardContext.scale(.6,.625)','boardContext.scale(1.2,1.25)');
const rainbow=s=>replace(s,'T.TorusGeometry(1, .022, 3, 32, Math.PI)','T.TorusGeometry(1, .022, 3, 64, Math.PI)');
const keepAttributes=s=>replace(s,'geometry.deleteAttribute("normal"); geometry.deleteAttribute("uv"); return geometry;','return geometry;');
const trials=[
 ['baseline',s=>s],
 ['double-hud-resolution',hud],
 ['smooth-rainbow',rainbow],
 ['rounder-shield',s=>replace(s,'T.IcosahedronGeometry(1)','T.IcosahedronGeometry(1,1)')],
 ['rounder-pads',s=>replace(s,'T.CylinderGeometry(.8,.9,.15,12)','T.CylinderGeometry(.8,.9,.15,24)')],
 ['keep-unused-attributes',keepAttributes],
 ['hud-rainbow-and-simpler-geometry-code',s=>keepAttributes(rainbow(hud(s)))],
 ['denser-scenery',s=>replace(replace(s,'flatShading:true}),40)','flatShading:true}),80)'),'for(let i=0;i<40;i++){const angle','for(let i=0;i<80;i++){const angle')]
];
const sha256=b=>createHash('sha256').update(b).digest('hex');
const current=await readFile('competition/rainbow-herd.zip');
const results=[];
await mkdir('work/quality-audit',{recursive:true});
for(const [name,transform]of trials){
 const source=transform(original);
 const bundle=await build({stdin:{contents:source,resolveDir:process.cwd()+'/competition',loader:'js'},bundle:true,write:false,format:'esm',target:'es2020',external:['https://*']});
 const game=(await minify(bundle.outputFiles[0].text,gameMinifyOptions)).code;
 const html=shell.replace('<script type=module src=game.js></script>',`<script type=module>${game}</script>`);
 const compressed=await deflateAsync(html,{numiterations:100}),chunks=[];
 const zip=new Zip((error,data)=>{if(error)throw error;chunks.push(data);});
 const entry=new ZipPassThrough('index.html');entry.mtime=new Date('2000-01-01T00:00:00Z');entry.compression=8;entry.process=(_,final)=>entry.ondata(null,compressed,final);
 zip.add(entry);entry.push(Buffer.from(html),true);zip.end();
 const archive=Buffer.concat(chunks);
 if(name==='baseline'&&!archive.equals(current))throw Error('Baseline is not byte-identical to release');
 await writeFile(`work/quality-audit/${name}.js`,source);
 await writeFile(`work/quality-audit/${name}.html`,html);
 await writeFile(`work/quality-audit/${name}.zip`,archive);
 const result={name,zipBytes:archive.length,deltaBytes:archive.length-current.length,headroomBytes:13312-archive.length,sha256:sha256(archive)};
 results.push(result);console.log(JSON.stringify(result));
}
await mkdir('evidence/quality-budget',{recursive:true});
await writeFile('evidence/quality-budget/trials.json',JSON.stringify({sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),baselineSha256:sha256(current),method:'Exact release bundling, minification and 100-iteration Zopfli ZIP; independent alternatives, not additive savings; prototypes not deployed',results},null,2)+'\n');
if(process.argv.includes('--smoke')){
 const {chromium}=await import('playwright'),browser=await chromium.launch({channel:'chrome'}),checks=[];
 try{
  for(const {name}of results){
   const page=await browser.newPage({viewport:{width:1024,height:768}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.route('https://play.js13kgames.com/2026/webxr/aframe.js',r=>r.fulfill({path:'node_modules/aframe/dist/aframe-v1.8.0.min.js',contentType:'text/javascript'}));
   await page.route('http://127.0.0.1:4173/quality-audit',r=>r.fulfill({path:`work/quality-audit/${name}.html`,contentType:'text/html'}));
   await page.goto('http://127.0.0.1:4173/quality-audit');
   await page.locator('#s').click();
   await page.locator('#build').click();
   await page.waitForFunction(()=>document.querySelector('#score').textContent==='POINTS 35'&&!document.querySelector('#next').hidden);
   if(['baseline','hud-rainbow-and-simpler-geometry-code'].includes(name))await page.screenshot({path:`evidence/quality-budget/${name}.png`});
   await page.locator('#next').click();
   await page.waitForFunction(()=>document.querySelector('#phase').textContent.includes('DEFEND'));
   if(errors.length)throw Error(name+': '+errors.join('\n'));
   checks.push({name,firstTowerCredits:35,waveStarted:true,errors});
   await page.close();
  }
  await writeFile('evidence/quality-budget/browser.json',JSON.stringify({browser:browser.version(),scope:'Compiled prototypes; local pinned A-Frame; opening, tower purchase and wave start only. Not XR or physical-device validation.',checks},null,2)+'\n');
  console.log('All eight compiled prototypes render, buy a tower and start a wave without browser errors.');
 }finally{await browser.close();}
}
