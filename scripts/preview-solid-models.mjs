import assert from 'node:assert/strict';
import {towerSubsetPlugin} from './tower-subset.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {build} from 'esbuild';
import {chromium} from 'playwright';
const label=process.argv[2]||'after',out='evidence/solid-models';
let source=await readFile('competition/game.js','utf8');
source=source.replace(/\n}\s*$/,`\nglobalThis.review={d,camera,rig,renderer,scene,gun,species,geometry:createTinyUnicornGeometry(T),ACTIVE,GOOD,WING,BOSS};\n}`);
const code=(await build({plugins:[towerSubsetPlugin],stdin:{contents:source,resolveDir:process.cwd()+'/competition',loader:'js'},bundle:true,write:false,format:'esm'})).outputFiles[0].text;
const html=(await readFile('competition/index.html','utf8')).replace('<script type=module src=game.js></script>',`<script type=module>${code}</script>`);
await mkdir(out,{recursive:true});const b=await chromium.launch({channel:'chrome'});
try{const p=await b.newPage({viewport:{width:900,height:700}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/solid-preview',r=>r.fulfill({body:html,contentType:'text/html'}));await p.goto('http://127.0.0.1:4173/solid-preview');await p.locator('#s').click();await p.waitForTimeout(250);
 await p.evaluate(()=>{const r=review;r.renderer.setAnimationLoop(()=>r.renderer.render(r.scene,r.camera));r.camera.children.forEach(c=>c.visible=false);document.querySelectorAll('body>div,body>button').forEach(n=>n.style.display='none');r.scene.fog=null;r.scene.background=new AFRAME.THREE.Color(0x302544);r.rig.position.set(0,0,0);r.rig.rotation.set(0,0,0);r.d.high=1;r.d.flags.fill(0);r.d.x[0]=r.d.y[0]=r.d.z[0]=r.d.yaw[0]=r.d.action[0]=r.d.phase[0]=r.d.vz[0]=0;r.d.scale[0]=.8;});
 const report={method:'instrumented frozen production renderer; canonical geometry; fixed camera/light/time',views:[],errors};
 for(const [name,position,clean,wing]of[['nose',[5,2.7,.3],false,false],['side',[.3,2.9,5],false,false],['rear',[-5,2.4,.6],true,false],['wing',[4,3.5,4],true,true],['below',[2,.1,4],false,true]]){
  const stats=await p.evaluate(({position,clean,wing})=>{const r=review,geometry=new Set(Object.values(r.geometry));r.d.flags[0]=r.ACTIVE|(clean?r.GOOD:0)|(wing?r.WING:0);r.d.corruption[0]=clean?0:1;r.species.sync(1);for(const child of r.scene.children)child.visible=!!(child.isLight||child===r.rig||child.isInstancedMesh&&geometry.has(child.geometry)&&child.count>0);r.gun.visible=false;r.camera.position.set(...position);r.camera.lookAt(.25,1.65,0);r.renderer.render(r.scene,r.camera);return{calls:r.renderer.info.render.calls,triangles:r.renderer.info.render.triangles};},{position,clean,wing});
  await p.screenshot({path:`${out}/${label}-${name}.png`});report.views.push({name,...stats});
 }
 await p.evaluate(()=>{const r=review;r.scene.children.forEach(c=>c.visible=!!(c.isLight||c===r.rig));r.gun.visible=true;r.gun.parent.remove(r.gun);r.scene.add(r.gun);r.gun.position.set(0,0,0);r.gun.rotation.set(0,0,0);r.gun.scale.setScalar(1);r.camera.position.set(.7,.1,.3);r.camera.lookAt(0,-.01,-.08);r.renderer.render(r.scene,r.camera);});await p.screenshot({path:`${out}/${label}-gun.png`});
 assert.deepEqual(errors,[]);await writeFile(`${out}/${label}.json`,JSON.stringify(report,null,2));console.log(report);
}finally{await b.close();}
