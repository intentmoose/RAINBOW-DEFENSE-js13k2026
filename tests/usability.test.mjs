import assert from 'node:assert/strict';
import test from 'node:test';
import {harness,Three} from './helpers/defense-harness.mjs';

test('new player builds a tower before starting, with honest cost and phase guidance',async()=>{
 const g=await harness();try{
  g.updateUI(.2);assert.match(g.nodes.get('#phase').textContent,/BUILD YOUR FIRST TOWER/);assert.equal(g.nodes.get('#next').hidden,true);assert.equal(g.cards.length,5);onkeydown({key:'u',code:'KeyU'});assert.equal(g.d.credits,70);assert.equal(g.nodes.get('#t').textContent,'BUILD TOWER FIRST');
  g.nextWave();assert.equal(g.d.wave,0);assert.equal(g.nodes.get('#t').textContent,'BUILD TOWER FIRST');
  g.buildTower();g.updateUI(.2);assert.equal(g.d.credits,35);assert.equal(g.d.towers[0],1);assert.ok(g.draws.some(r=>r[0]==='TOWER READY'));assert.equal(g.nodes.get('#next').disabled,false);assert.match(g.nodes.get('#phase').textContent,/PREPARE · WAVE 1/);
  g.buildTower();g.updateUI(.2);assert.equal(g.d.credits,0);assert.equal(g.nodes.get('#build').disabled,true);
  g.buildTower();assert.equal(g.d.credits,0);assert.equal(g.nodes.get('#t').textContent,'NEED MORE POINTS');
  g.nextWave();g.updateUI(.2);assert.equal(g.d.wave,1);assert.equal(g.nodes.get('#build').hidden,true);assert.match(g.nodes.get('#phase').textContent,/DEFEND/);
  g.state().weapon.energy=0;g.updateUI(.2);assert.match(g.nodes.get('#m').textContent,/DROP EMPTY MAGAZINE/);
 }finally{g.restore();}
});

test('automatic bolt gives ready feedback and button reload shows progress',async()=>{
 const g=await harness();try{
  const pulses=[[],[]];for(let i=0;i<2;i++)g.controllers[i].userData.source.gamepad.hapticActuators=[{pulse:(...args)=>pulses[i].push(args)}];
  g.handAt(0,new Three.Vector3(0,.135,-.035));g.emit(0,'squeezestart');assert.equal(g.state().holding,0);g.emit(0,'squeezeend');
  g.handAt(0,g.socket);g.emit(0,'squeezestart');g.tick();g.emit(0,'squeezeend');assert.equal(g.reloadHint(),'CHAMBERING…');g.updateBeam(.06,1);g.tick();assert.ok(g.handle.position.z>-.045);g.updateBeam(.06,1);g.tick();assert.equal(g.state().weapon.primed,true);assert.equal(g.nodes.get('#t').textContent,'READY');assert.ok(pulses[0].length>=2);assert.equal(pulses[1].length,1);
  g.state().weapon.reload();g.updateBeam(.5,1);g.updateUI(.2);assert.match(g.reloadHint(),/^RELOADING 50%$/);assert.equal(g.nodes.get('#reload').textContent,'RELOADING 50%');g.updateBeam(.5,1);g.updateUI(.2);assert.equal(g.nodes.get('#reload').textContent,'AMMO 100% · RELOAD');
 }finally{g.restore();}
});

test('visible tower bodies accept upgrades while empty air cannot build a tower',async()=>{
 const g=await harness();try{
  g.renderer.xr.isPresenting=false;g.tick();g.buildTower();g.d.credits=100;g.updateTowers(0);g.scene.updateMatrixWorld(true);
  const click=(x,y,z)=>{const p=new Three.Vector3(x,y,z).project(g.camera);g.interact((p.x+1)*innerWidth/2,(1-p.y)*innerHeight/2);};
  click(-4,1.2,-3);assert.equal(g.state().selectedPad,0);assert.equal(g.d.towers[0],1);g.renderer.loop(1000);g.scene.updateMatrixWorld(true);const action=g.towerMenu.localToWorld(new Three.Vector3(0,.13,0));click(action.x,action.y,action.z);assert.equal(g.d.towers[0],2);assert.equal(g.d.credits,50);click(4,1.2,-3);assert.equal(g.d.towers[2],0);assert.equal(g.d.credits,50);
  g.updateUI(.2);assert.equal(g.nodes.get('#reload').textContent,'AMMO 100% · RELOAD');const start=g.towerMenu.localToWorld(new Three.Vector3(0,-.32,0));click(start.x,start.y,start.z);g.updateUI(.2);assert.match(g.nodes.get('#phase').textContent,/WAVE 1[/]6/);g.resetRun();g.updateUI(.2);assert.equal(g.nodes.get('#m').textContent,'SELECT TOWER · PAD · BUILD');
 }finally{g.restore();}
});

test('wave completion celebrates once, shows the bonus and requires a later deliberate start',async()=>{const g=await harness();try{g.renderer.xr.isPresenting=false;g.tick();g.buildTower();g.d.build(1);g.updateTowers(0);g.nextWave();g.d.queued=0;g.d.flags.fill(0);g.renderer.loop(1000);g.updateUI(.2);assert.equal(g.d.cleared,1);assert.ok(g.state().celebrate>0);assert.equal(g.state().selectedPad,-1);assert.equal(g.towerMenu.visible,false);assert.match(g.nodes.get('#phase').textContent,/WAVE 1 COMPLETE/);assert.ok(g.draws.some(r=>r[0]==='+23 BONUS POINTS'));g.nextWave();assert.equal(g.d.wave,1);for(let i=1;i<=100;i++)g.renderer.loop(1000+i*33);g.nextWave();assert.equal(g.d.wave,2);g.resetRun();assert.equal(g.state().celebrate,0);}finally{g.restore()}});
test('sniper optic has a real open aperture with a visible reticle',async()=>{const g=await harness();try{g.d.cleared=4;g.cycleMode();g.cycleMode();g.tick();assert.equal(g.scope.visible,true);g.scene.updateMatrixWorld(true);const p=g.scope.localToWorld(new Three.Vector3(.01,.01,.3)),q=g.scope.getWorldQuaternion(new Three.Quaternion()),ray=new Three.Raycaster(p,new Three.Vector3(0,0,-1).applyQuaternion(q),0,.5);assert.equal(ray.intersectObject(g.scope,true).length,0,'off-center sightline passes through tube');assert.equal(g.scope.children[0].geometry.parameters.openEnded,true);}finally{g.restore()}});

test('Space and Enter consume browser button activation while playing',async()=>{const g=await harness();try{g.renderer.xr.isPresenting=false;g.buildTower();let prevented=0;onkeydown({key:'Enter',code:'Enter',preventDefault(){prevented++}});assert.equal(prevented,1);assert.equal(g.d.wave,1);onkeydown({key:' ',code:'Space',preventDefault(){prevented++}});g.updateBeam(.2,1);const energy=g.state().weapon.energy;onkeyup({key:' ',code:'Space'});g.updateBeam(.2,1);assert.equal(prevented,2);assert.equal(g.state().weapon.energy,energy);assert.equal(g.state().weapon.assist,0);}finally{g.restore()}});
