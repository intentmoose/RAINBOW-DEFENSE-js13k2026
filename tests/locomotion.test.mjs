import assert from 'node:assert/strict';
import test from 'node:test';
import {harness,Three} from './helpers/defense-harness.mjs';
const axes=(g,i,x,y)=>g.controllers[i].userData.source.gamepad.axes=[0,0,x,y];
test('seated controls: left translates; right snaps once per deflection around the headset',async()=>{const g=await harness();try{
 g.camera.position.set(.4,1.72,.2);g.scene.updateMatrixWorld(true);const before=g.camera.getWorldPosition(new Three.Vector3());axes(g,1,1,0);g.updatePlayer(.016);assert.ok(Math.abs(g.rig.rotation.y+Math.PI/6)<1e-8);assert.ok(before.distanceTo(g.camera.getWorldPosition(new Three.Vector3()))<1e-8);
 for(let i=0;i<120;i++)g.updatePlayer(.016);assert.ok(Math.abs(g.rig.rotation.y+Math.PI/6)<1e-8);
 axes(g,1,0,0);g.updatePlayer(.016);axes(g,1,-1,0);g.updatePlayer(.016);assert.ok(Math.abs(g.rig.rotation.y)<1e-8);axes(g,1,0,0);
 const start=g.rig.position.clone();axes(g,0,.05,.05);g.updatePlayer(.1);assert.ok(start.distanceTo(g.rig.position)<1e-8);axes(g,0,1,-1);g.updatePlayer(.1);assert.ok(Math.abs(start.distanceTo(g.rig.position)-.26)<1e-8);assert.ok(g.rig.position.x>start.x&&g.rig.position.z<start.z);
 g.emit(0,'disconnected');const one=g.rig.position.clone();axes(g,1,0,-1);g.updatePlayer(.1);assert.ok(g.rig.position.z<one.z);axes(g,1,1,0);g.updatePlayer(.1);assert.ok(g.rig.rotation.y<0);g.emit(1,'disconnected');const stopped=g.rig.position.clone();g.updatePlayer(.1);assert.ok(stopped.distanceTo(g.rig.position)<1e-8);g.resetRun();assert.equal(g.rig.rotation.y,0);
 }finally{g.restore();}});
test('unicorn gait follows speed and slow effect; heading follows its actual lane motion',async()=>{const g=await harness();try{const d=g.d;d.start();d.update(.01);d.queued=0;const i=0,phase=d.phase[i];d.update(.1);const stride=d.phase[i]-phase;d.slow[i]=1;const slowPhase=d.phase[i];d.update(.1);assert.ok(Math.abs((d.phase[i]-slowPhase)/stride-.45)<1e-5);assert.ok(d.yaw[i]<0);g.species.sync(1);const meshes=g.scene.children.filter(m=>m.isInstancedMesh&&m.instanceColor?.normalized);for(const m of meshes)assert.ok(m.count<=m.instanceMatrix.count);d.hit(i,100);const fadePhase=d.phase[i];d.update(.1);assert.equal(d.phase[i],fadePhase);}finally{g.restore();}});
