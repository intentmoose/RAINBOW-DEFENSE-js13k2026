import assert from 'node:assert/strict';
import test from 'node:test';
import {harness,Three} from './helpers/defense-harness.mjs';

test('repeated desktop reloads preserve magazine size when entering VR',async()=>{
 const g=await harness();try{
  g.renderer.xr.isPresenting=false;g.tick();
  for(let n=0;n<3;n++){
   g.state().weapon.reload();
   for(let i=0;i<100;i++){g.state().weapon.step(.016,0);g.tick();}
   assert.ok(Math.abs(g.cartridge.scale.x-1)<1e-6,'seated magazine keeps its original local scale');
   assert.ok(Math.abs(g.cartridge.getWorldScale(new Three.Vector3()).x-.6)<1e-6);
  }
  g.renderer.xr.isPresenting=true;g.tick();assert.ok(Math.abs(g.cartridge.getWorldScale(new Three.Vector3()).x-1)<1e-6,'VR magazine remains full size');
 }finally{g.restore();}
});

for(const gunHand of ['right','left'])test(`a ${gunHand}-held gun releases a world-space magazine with hand momentum`,async()=>{
 const g=await harness();try{
  if(gunHand==='left')onkeydown({key:'h',code:'KeyH'});
  const support=gunHand==='right'?0:1,main=1-support;
  g.grips[main].position.set(.25,1.5,-.2);g.tick();
  g.handAt(support,g.socket);g.emit(support,'squeezestart');
  for(let i=1;i<=6;i++){g.handAt(support,g.socket.clone().add(new Three.Vector3(i*.04,i*.01,0)));g.tick();}
  const release=g.cartridge.getWorldPosition(new Three.Vector3());
  g.emit(support,'squeezeend');assert.equal(g.cartridge.parent,g.scene);assert.equal(g.state().weapon.seated,false);
  g.tick();const airborne=g.cartridge.getWorldPosition(new Three.Vector3());assert.ok(airborne.x>release.x+.02,'inherits horizontal hand velocity');
  g.rig.position.x+=2;g.rig.rotation.y+=.5;g.tick();
  assert.ok(g.cartridge.getWorldPosition(new Three.Vector3()).distanceTo(airborne)<.2,'does not follow a moving/turning gun');
  for(let i=0;i<180;i++)g.tick();
  assert.ok(Math.abs(g.cartridge.position.y-.08)<.01,'lands above the floor');
  g.handAt(support,g.gun.worldToLocal(g.cartridge.getWorldPosition(new Three.Vector3())));g.emit(support,'squeezestart');assert.equal(g.state().holding,1,'landed magazine can be picked up');
  g.handAt(support,g.socket);g.tick();g.emit(support,'squeezeend');g.tick();
  assert.equal(g.state().weapon.seated,true);assert.equal(g.state().weapon.primed,false);assert.equal(g.cartridge.parent,g.gun);assert.ok(g.cartridge.position.distanceTo(g.socket)<1e-6);
 }finally{g.restore();}
});

test('desktop auto reload recovers a thrown magazine and interrupted handling cannot leave firing active',async()=>{
 const g=await harness();try{
  g.grips[1].position.y=1.5;g.tick();g.handAt(0,g.socket);g.emit(0,'squeezestart');g.handAt(0,g.socket.clone().add(new Three.Vector3(.3,.1,0)));g.tick();g.emit(0,'squeezeend');g.tick();
  g.renderer.xr.isPresenting=false;onkeydown({key:'r',code:'KeyR'});
  for(let i=0;i<100;i++){g.state().weapon.step(.016,0);g.tick();}
  assert.equal(g.cartridge.parent,g.gun);assert.equal(g.state().weapon.primed,true);assert.equal(g.state().weapon.energy,12);
  g.renderer.xr.isPresenting=true;g.tick();g.handAt(0,g.socket);g.emit(0,'squeezestart');g.emit(0,'disconnected');assert.equal(g.state().holding,0);assert.equal(g.state().weapon.trigger,false);
  g.tick();assert.ok(Number.isFinite(g.cartridge.position.y));g.resetRun();g.tick();assert.equal(g.cartridge.parent,g.gun);assert.equal(g.state().weapon.primed,true);
 }finally{g.restore();}
});

test('starting a wave waits for a loaded and primed gun',async()=>{
 const g=await harness();try{
  g.buildTower();g.state().weapon.remove();g.updateUI(.2);g.nextWave();assert.equal(g.d.wave,0);assert.equal(g.nodes.get('#next').disabled,true);
  g.state().weapon.reload();for(let i=0;i<100;i++)g.state().weapon.step(.016,0);g.updateUI(.2);assert.equal(g.nodes.get('#next').disabled,false);g.nextWave();assert.equal(g.d.wave,1);
 }finally{g.restore();}
});

test('grabbing the pistol grip transfers the gun while preserving ammunition and requiring a new trigger press',async()=>{
 const g=await harness();try{
  const energy=g.state().weapon.energy;g.state().weapon.press(true);
  g.handAt(0,new Three.Vector3(0,-.055,.035));g.tick();assert.equal(g.reloadHint(),'GRIP: TAKE GUN');g.emit(0,'squeezestart');g.tick();
  assert.equal(g.state().gunHand,'left');assert.equal(g.gun.parent,g.grips[0]);assert.equal(g.state().weapon.energy,energy);assert.equal(g.state().weapon.primed,true);assert.equal(g.state().weapon.trigger,false);
  g.emit(0,'squeezeend');g.handAt(1,new Three.Vector3(0,-.055,.035));g.emit(1,'squeezestart');g.tick();assert.equal(g.state().gunHand,'right');assert.equal(g.gun.parent,g.grips[1]);
 }finally{g.restore();}
});
