import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { build } from 'esbuild';
import { chromium } from 'playwright';

// Instrumentation is bundled in memory, never shipped in the competition ZIP.
const label = process.argv[2] || 'render';
await mkdir('evidence/defense', { recursive: true });
let source = await readFile(process.argv[3] || 'competition/game.js', 'utf8');
source = source.replace('return { sync };', 'return { sync, meshes };');
source = source.replace('renderer.setAnimationLoop(milliseconds=>{', 'globalThis.auditFrame=milliseconds=>{');
source = source.replace(/\}\);\s*\}\s*$/, `};
globalThis.auditGame={scene,renderer,camera,rig,species,d,flags,sparkPositions,sparkColors,sparkVelocity,sparkLife,
setup(n){resetRun();active=0;d.high=n;d.towers.fill(3);for(let i=0;i<n;i++){flags[i]=ACTIVE|((i%4)<<2)|(i%4===3?WING:0)|(i===n-1&&n>1?BOSS:0);x[i]=(i%8-3.5)*2;z[i]=-3-Math.floor(i/8)*3;scale[i]=.43;yaw[i]=.35;corruption[i]=1;y[i]=i%4===3?1:0;phase[i]=i*.7;d.hp[i]=d.max[i]=2;}species.sync(1);updateTowers(1);updateSparks(0);},
sync:()=>species.sync(1),sparks:updateSparks,burst:()=>burst(0),reset:resetRun};
}`);
const code = (await build({ stdin: { contents: source, resolveDir: process.cwd()+'/competition', loader:'js' }, bundle:true, write:false, format:'esm',plugins:process.argv[4]?[{name:'historical-simulation',setup(b){b.onLoad({filter:/defense\.js$/},async()=>({contents:await readFile(process.argv[4],'utf8'),loader:'js'}))}}]:[] })).outputFiles[0].text;
const html = (await readFile('competition/index.html','utf8')).replace('<script type=module src=game.js></script>', `<script type=module>${code}</script>`);
const browser = await chromium.launch({channel:'chrome'});
try {
 const page=await browser.newPage({viewport:{width:800,height:500}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 if(label.includes('fallback'))await page.addInitScript(()=>{globalThis.Float16Array=undefined;});
 await page.addInitScript(()=>{let seed=13;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);});
 await page.addInitScript(()=>{globalThis.auditContexts=[];const get=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(...args){const c=get.apply(this,args);if(c&&/^(webgl2?|experimental-webgl)$/.test(args[0])&&!auditContexts.includes(c))auditContexts.push(c);return c;};});
 await page.route('https://play.js13kgames.com/2026/webxr/aframe.js',r=>r.fulfill({path:'node_modules/aframe/dist/aframe-v1.8.0.min.js',contentType:'text/javascript'}));
 await page.route('http://127.0.0.1:4173/audit',r=>r.fulfill({body:html,contentType:'text/html'}));
 await page.goto('http://127.0.0.1:4173/audit');
 await page.waitForFunction(()=>globalThis.auditGame);
 const runs=[];
 for(const count of [1,16,40]){
  runs.push(await page.evaluate(count=>{
   const g=auditGame;g.setup(count);auditFrame(1000);g.renderer.render(g.scene,g.camera);
   const arrays=new Set(),geometries=new Set(),materials=new Set();let instanceBytes=0,geometryBytes=0,activeInstances=0;
   const meshes=[],matrixTypes=new Set(),textures=new Set();let textureBaseBytes=0;
   g.scene.traverse(o=>{
    if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);for(const value of Object.values(m))if(value?.isTexture&&!textures.has(value)){textures.add(value);const im=value.image;if(im?.width&&im?.height)textureBaseBytes+=im.width*im.height*4;}}
    if(o.geometry&&!geometries.has(o.geometry)){geometries.add(o.geometry);for(const a of [...Object.values(o.geometry.attributes),o.geometry.index].filter(Boolean)){if(!arrays.has(a.array)){geometryBytes+=a.array.byteLength;arrays.add(a.array);}}}
    if(o.isInstancedMesh){matrixTypes.add(o.instanceMatrix.array.constructor.name);for(const a of [o.instanceMatrix,o.instanceColor].filter(Boolean))instanceBytes+=a.array.byteLength;activeInstances+=o.count;meshes.push({geometry:o.geometry.type,count:o.count,capacity:o.instanceMatrix.count});}
   });
   let maxTransformError=0;const reduced=[];g.scene.traverse(o=>{if(o.instanceMatrix?.array.constructor.name==='Float16Array'){const a=o.instanceMatrix;reduced.push([a,a.array]);a.array=new Float32Array(a.array.length);}});g.sync();for(const [a,original]of reduced){for(let i=0;i<a.array.length;i++)maxTransformError=Math.max(maxTransformError,Math.abs(a.array[i]-original[i]));a.array=original;}if(maxTransformError>.008)throw Error('Transform precision regression: '+maxTransformError);
   for(let i=0;i<100;i++)g.sync();
   const timings=[];for(let sample=0;sample<9;sample++){const t=performance.now();for(let i=0;i<250;i++)g.sync();timings.push((performance.now()-t)/250);}
   timings.sort((a,b)=>a-b);
   const simulationBytes=Object.values(g.d).filter(v=>ArrayBuffer.isView(v)).reduce((n,v)=>n+v.byteLength,0),sparkStateBytes=g.sparkVelocity.byteLength+g.sparkLife.byteLength;
   return{count,maxTransformError,matrixTypes:[...matrixTypes],textureBaseBytes,simulationBytes,sparkStateBytes,render:{...g.renderer.info.render},memory:{...g.renderer.info.memory},instanceBytes,geometryBytes,materials:materials.size,activeInstances,syncMedianMs:timings[4],meshes};
  },count));
  await page.screenshot({path:`evidence/defense/${label}-${count}.png`});
 }
 const lifecycle=await page.evaluate(()=>{
  const g=auditGame;g.setup(40);g.sync();g.flags.fill(0);g.sync();const empty=g.species.meshes.map(o=>o.count);
  if(empty.length!==13||empty.some(n=>n!==0))throw Error('Inactive unicorn parts still rendered');
  g.setup(1);g.burst();for(let i=0;i<180;i++)g.sparks(1/60);g.renderer.render(g.scene,g.camera);
  const before={...g.renderer.info.memory};for(let i=0;i<100;i++){g.reset();auditFrame(1000+i*16);}const after={...g.renderer.info.memory};if(before.geometries!==after.geometries||before.textures!==after.textures)throw Error('Reset grows retained renderer resources');return{empty,before,after};
 });
 const result={label,browser:browser.version(),three:await page.evaluate(()=>AFRAME.THREE.REVISION),webglContexts:await page.evaluate(()=>auditContexts.length),mode:'deterministic instrumented desktop renderer; local pinned A-Frame; not physical headset timing',errors,runs,lifecycle};
 await writeFile(`evidence/defense/${label}.json`,JSON.stringify(result,null,2));
 console.log(JSON.stringify({...result,runs:runs.map(({meshes,...r})=>r)},null,2));
 if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}
