import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {unzipSync} from 'fflate';
import {chromium,firefox} from 'playwright';
import * as T from '../node_modules/aframe/node_modules/three/build/three.module.js';
const browserName=process.argv.includes('--firefox')?'Firefox':'Chrome';
const output=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'evidence/td-ux';
await mkdir(output,{recursive:true});await mkdir('work/extracted',{recursive:true});
const zip=await readFile('competition/rainbow-herd.zip');for(const [n,b] of Object.entries(unzipSync(zip)))await writeFile('work/extracted/'+n,b);
const report={sha256:createHash('sha256').update(zip).digest('hex'),bytes:zip.length,method:'Unmodified extracted ZIP; Playwright mouse/keyboard/buttons; DOM observations only; no state injection or time acceleration',waves:[],errors:[]};
const b=await(browserName==='Firefox'?firefox.launch():chromium.launch({channel:'chrome'}));report.browser=browserName;report.browserVersion=b.version();report.startedAt=new Date().toISOString();
try{
const p=await b.newPage({viewport:{width:1000,height:700}});p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});
await p.goto('http://127.0.0.1:4173/work/extracted/');await p.locator('#s').click();
const ui=()=>p.evaluate(()=>Object.fromEntries(['phase','score','counters','reload','m'].map(id=>[id,document.getElementById(id).textContent])));
let angle=0,mode=0,levels=[1,1,1];
const card=async(i,upgrade=false)=>{const row=i<3?i:i-3;await p.mouse.click(i<3?921:79,187+row*112+(upgrade?36:-20));await p.waitForTimeout(180);};
async function turn(target){const dx=(angle-target)/.004;if(Math.abs(dx)<.1)return;await p.mouse.move(500,350);await p.mouse.down();await p.mouse.move(500+dx,350,{steps:5});await p.mouse.up();angle=target;}
for(let wave=1;wave<=6;wave++){
 await turn(0);
 if(wave===4){
  // Project known pad locations only to choose mouse coordinates; no game-state access.
  const camera=new T.PerspectiveCamera(67,1000/700,.04,80);camera.position.set(0,1.72,7);camera.updateMatrixWorld();
  const xy=v=>{v.project(camera);return [(v.x+1)*500,(1-v.y)*350]};
  for(const [x,z]of [[-4,-3],[0,1]]){await p.mouse.move(...xy(new T.Vector3(x,1.2,z)));await p.waitForTimeout(250);const panel=new T.Object3D();panel.position.set(x,2.5,z);panel.lookAt(camera.position);panel.scale.setScalar(camera.position.distanceTo(panel.position)/4);panel.updateMatrixWorld();const before=Number((await ui()).score.split(' ')[1]);await p.mouse.click(...xy(panel.localToWorld(new T.Vector3(0,.13,0))));await p.waitForTimeout(180);assert.equal(Number((await ui()).score.split(' ')[1]),before-50,'nearby tower upgrade costs 50');}
 }
 if(wave===3)await card(4);
 while(await p.locator('#build').isEnabled()){await p.locator('#build').click();await p.waitForTimeout(160);}
 if(wave===3)await card(3);
 if(wave===3||wave===5){mode=wave===3?1:2;await card(mode);assert.equal(await p.locator('#t').innerText(),mode===1?'SHOTGUN':'SNIPER');}
 if(levels[mode]<3&&Number((await ui()).score.split(' ')[1])>=30+levels[mode]*25){await card(mode,true);assert.equal(await p.locator('#t').innerText(),'GUN UPGRADED');levels[mode]++;}
 await p.keyboard.press('r');await p.waitForTimeout(1400);
 await p.locator('#next').click();await p.waitForTimeout(180);
 const started=Date.now(),entry={wave,start:await ui(),samples:[]};console.log('START',entry);await p.keyboard.down('Space');
 for(let tick=0;tick<250;tick++){
  await p.waitForTimeout(450);const s=await ui();
  if(tick%16===0){entry.samples.push(s);console.log('PLAY',wave,tick,s.counters,s.score,s.reload);}
  if(await p.locator('#c').isVisible()||/COMPLETE/.test(s.phase)){entry.end=s;break;}
  if(/AUTO RELOAD|AMMO [0-8]%/.test(s.reload)){await p.keyboard.up('Space');await p.keyboard.press('r');await p.waitForTimeout(1350);await p.keyboard.down('Space');}
  if(mode===0){await p.keyboard.up('Space');await p.keyboard.down('Space');}
  if(wave>=3&&tick%3===0){await p.keyboard.up('Space');await turn([-.22,0,.22,0][Math.floor(tick/3)%4]);await p.keyboard.down('Space');}
 }
 await p.keyboard.up('Space');entry.durationMs=Date.now()-started;entry.end??=await ui();assert.match(entry.end.phase,new RegExp('WAVE '+wave+' COMPLETE'));report.waves.push(entry);await p.screenshot({path:`${output}/wave-${wave}.png`});console.log('END',wave,entry.end);
 if(await p.locator('#c').isVisible())break;
 await p.waitForTimeout(3500);
 if(wave===6)break;
}
assert.equal(report.waves.length,6);report.result=await p.locator('#c').innerText();assert.match(report.result,/RAINBOW\s+DEFENDED/);report.final=await ui();await p.screenshot({path:`${output}/result.png`});
if(await p.locator('#c').isVisible()){await p.locator('#s').click();await p.waitForTimeout(200);report.replay=await ui();assert.equal(report.replay.score,'POINTS 70');assert.equal(report.replay.counters,'CRYSTAL 20/20');await p.keyboard.press('q');assert.equal(await p.locator('#t').innerText(),'PISTOL');}
assert.equal(report.errors.length,0);
}catch(error){report.failure=error.message;throw error;}finally{report.finishedAt=new Date().toISOString();await writeFile(`${output}/campaign.json`,JSON.stringify(report,null,2));await b.close();}
