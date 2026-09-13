import{readFile,writeFile,mkdir}from'node:fs/promises';
import{chromium,firefox}from'playwright';
const shell=await readFile('competition/index.html','utf8'),variants={plain:await readFile('competition/dist/unpacked.js','utf8'),packed:await readFile('competition/dist/game.js','utf8')},results=[];
for(const [name,engine,options]of[['Chrome',chromium,{channel:'chrome'}],['Firefox',firefox,{}]]){
 const browser=await engine.launch(options);
 try{for(const [variant,source]of Object.entries(variants))for(let run=0;run<3;run++){
  const page=await browser.newPage({viewport:{width:800,height:500}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.route('https://play.js13kgames.com/2026/webxr/aframe.js',r=>r.fulfill({path:'node_modules/aframe/dist/aframe-v1.8.0.min.js',contentType:'text/javascript'}));
  const html=shell.replace('<script type=module src=game.js></script>',`<script type=module>globalThis.startupAt=performance.now();${source};globalThis.startupMs=performance.now()-globalThis.startupAt;</script>`);
  await page.route('http://127.0.0.1:4173/startup-audit',r=>r.fulfill({body:html,contentType:'text/html'}));
  await page.goto('http://127.0.0.1:4173/startup-audit');await page.waitForFunction(()=>globalThis.startupMs!==undefined);
  await page.locator('#s').click();await page.locator('#build').click();await page.waitForFunction(()=>document.querySelector('#score').textContent==='POINTS 35');
  if(errors.length)throw Error(errors.join('\n'));results.push({browser:name,version:browser.version(),variant,run,startupMs:await page.evaluate(()=>startupMs),errors});await page.close();
 }}finally{await browser.close();}
}
await mkdir('evidence/whole-game',{recursive:true});
await writeFile('evidence/whole-game/startup.json',JSON.stringify({scope:'Desktop game-script initialization, including decoder for packed variant. Engine load/network excluded; no physical Quest timing.',results},null,2)+'\n');
console.log(JSON.stringify(results));
