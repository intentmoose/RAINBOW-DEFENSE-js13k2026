import assert from 'node:assert/strict';
import{writeFile}from'node:fs/promises';
import{chromium}from'playwright';
const b=await chromium.launch({channel:'chrome'});
try{const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:4173/work/extracted/');await p.screenshot({path:'evidence/defense/phone-opening.png'});await p.locator('#s').click();await p.waitForTimeout(250);const c=await p.context().newCDPSession(p);
const touch=(type,points=[])=>c.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([x,y,id=1])=>({x,y,id}))});
await p.screenshot({path:'evidence/defense/phone-build.png'});
await touch('touchStart',[[335,365]]);await touch('touchEnd');await p.waitForTimeout(180);assert.match(await p.locator('#t').innerText(),/LOCKED.*WAVE 5/);assert.equal(await p.locator('#score').innerText(),'POINTS 70');
await touch('touchStart',[[195,508]]);await touch('touchCancel');await p.waitForTimeout(250);assert.equal(await p.locator('#score').innerText(),'POINTS 70');
await touch('touchStart',[[195,508]]);await touch('touchEnd');await p.waitForTimeout(250);assert.equal(await p.locator('#score').innerText(),'POINTS 70');await p.screenshot({path:'evidence/context-ux/phone-tower-menu.png'});await touch('touchStart',[[195,350]]);await touch('touchEnd');await p.waitForTimeout(250);assert.equal(await p.locator('#score').innerText(),'POINTS 35');
await p.locator('#next').tap();await touch('touchStart',[[300,430]]);await p.waitForTimeout(500);await touch('touchCancel');await p.waitForTimeout(250);const afterCancel=await p.locator('#reload').innerText();assert.notEqual(afterCancel,'AMMO 100% · RELOAD');await p.waitForTimeout(500);assert.equal(await p.locator('#reload').innerText(),afterCancel);
await touch('touchStart',[[300,430]]);await p.waitForTimeout(250);await p.setViewportSize({width:844,height:390});await p.waitForTimeout(250);const afterResize=await p.locator('#reload').innerText();await p.waitForTimeout(500);assert.equal(await p.locator('#reload').innerText(),afterResize);await touch('touchCancel');
await p.setViewportSize({width:390,height:844});await p.locator('#reload').tap();await p.waitForTimeout(1450);assert.equal(await p.locator('#reload').innerText(),'AMMO 100% · RELOAD');await p.screenshot({path:'evidence/defense/phone-wave.png'});assert.deepEqual(errors,[]);const report={browser:b.version(),mode:'extracted ZIP, native CDP touch; emulated 390x844, not physical phone',canceledBuildPoints:70,selectPadPoints:70,confirmMenuPoints:35,afterCancel,afterResize,assistedReload:'100%',errors};await writeFile('evidence/defense/touch.json',JSON.stringify(report,null,2));console.log(report);
}finally{await b.close();}
