import assert from 'node:assert/strict';
import test from 'node:test';
import {harness,Three} from './helpers/defense-harness.mjs';

const reach=(g,side,world)=>g.handAt(side,g.gun.worldToLocal(world.clone()));
function drop(g,side){g.handAt(side,g.socket);g.emit(side,'squeezestart');g.handAt(side,g.socket.clone().add(new Three.Vector3(.4,.1,0)));g.tick();g.emit(side,'squeezeend');g.tick();}
for(const hand of ['right','left'])test(`${hand} gun reloads from the opposite hip without reclaiming the thrown empty`,async()=>{
 const g=await harness();try{
  if(hand==='left')onkeydown({key:'h',code:'KeyH'});
  const support=hand==='right'?0:1;g.grips[1-support].position.set(.15,1.4,0);g.tick();
  const head=g.camera.getWorldPosition(new Three.Vector3());assert.ok((g.pouch.position.x-head.x)*(hand==='right'?-1:1)>.25);assert.ok(g.pouch.position.z<head.z);
  g.state().weapon.energy=0;drop(g,support);assert.equal(g.state().weapon.energy,0);
  const old=g.cartridge.position.clone();reach(g,support,g.pouch.position);g.tick();assert.equal(g.reloadHint(),'GRIP HIP MAGAZINE');g.emit(support,'squeezestart');
  assert.equal(g.state().holding,1);assert.equal(g.state().weapon.energy,12);assert.equal(g.state().weapon.seated,false);assert.equal(g.discard.visible,true);assert.ok(g.discard.position.distanceTo(old)<.2);
  g.tick();assert.ok(g.cartridge.position.distanceTo(g.pouch.position)<.02);assert.equal(g.reloadHint(),'INSERT + RELEASE');
  g.handAt(support,g.socket);g.tick();g.emit(support,'squeezeend');g.tick();assert.equal(g.state().weapon.seated,true);assert.equal(g.state().weapon.primed,false);assert.equal(g.cartridge.scale.x,1);
  assert.equal(g.reloadHint(),'CHAMBERING…');g.updateBeam(.12,1);g.tick();assert.equal(g.state().weapon.primed,true);assert.equal(g.nodes.get('#t').textContent,'READY');
 }finally{g.restore();}
});

test('loaded guns cannot gain ammo from the pouch and empty reinsertion cannot refill',async()=>{
 const g=await harness();try{
  g.state().weapon.energy=5;reach(g,0,g.pouch.position);g.emit(0,'squeezestart');assert.equal(g.state().holding,0);assert.equal(g.state().weapon.energy,5);assert.equal(g.discard.visible,false);g.emit(0,'squeezeend');
  const w=g.state().weapon;w.energy=0;w.remove();w.seat();assert.equal(w.energy,0);w.reload();w.step(2,0);assert.equal(w.energy,12);assert.equal(w.primed,true);
 }finally{g.restore();}
});

test('pouch follows seated height, translation and yaw without pitching into the body',async()=>{
 const g=await harness();try{
  g.camera.position.y=1.1;g.rig.position.set(2,0,4);g.rig.rotation.y=.7;g.tick();assert.ok(Math.abs(g.pouch.position.y-.5)<1e-6);
  const heading=g.pouch.rotation.y;g.camera.rotation.x=-Math.PI/2;g.tick();assert.ok(Math.abs(g.pouch.rotation.y-heading)<1e-6);assert.ok(Math.abs(g.pouch.position.y-.5)<1e-6);
  g.renderer.xr.isPresenting=false;g.tick();assert.equal(g.pouch.visible,false);g.state().weapon.energy=0;assert.equal(g.reloadHint(),'R / RELOAD');
 }finally{g.restore();}
});

test('repeated pouch supply reuses one discarded shell and reset clears it',async()=>{
 const g=await harness();try{
  g.grips[1].position.y=1.4;g.tick();const before=g.scene.children.length,discard=g.discard;
  for(let n=0;n<20;n++){
   g.state().weapon.energy=0;drop(g,0);reach(g,0,g.pouch.position);g.emit(0,'squeezestart');g.tick();g.handAt(0,g.socket);g.tick();g.emit(0,'squeezeend');g.tick();
   assert.equal(g.state().weapon.energy,12);assert.equal(g.discard,discard);assert.equal(g.scene.children.length,before);
  }
  g.resetRun();g.tick();assert.equal(g.discard.visible,false);assert.equal(g.state().weapon.energy,12);assert.equal(g.cartridge.parent,g.gun);
 }finally{g.restore();}
});
