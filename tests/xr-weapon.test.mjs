import assert from 'node:assert/strict';import test from 'node:test';import{harness,Three}from'./helpers/defense-harness.mjs';
test('controller hands and lowered gun preserve spatial ownership and deliberate reload',async()=>{const g=await harness();try{
 assert.equal(g.state().inputController,g.controllers[1]);assert.equal(g.hands.length,2);assert.ok(g.hands.every(h=>h.el.object3D.visible&&h.el.object3D.children.length===1));g.aim();assert.ok(Math.abs(g.rayDirection.y-Math.sin(-16*Math.PI/180))<1e-6);
 g.handAt(0,g.socket);g.emit(0,'squeezestart');assert.equal(g.state().holding,1);assert.equal(g.state().weapon.seated,false);
 g.handAt(0,g.socket.clone().add(new Three.Vector3(.2,-.3,0)));g.tick();g.emit(0,'squeezeend');assert.equal(g.state().weapon.seated,false);g.tick(1);
 g.handAt(0,g.gun.worldToLocal(g.cartridge.getWorldPosition(new Three.Vector3())));g.emit(0,'squeezestart');g.handAt(0,g.socket);g.tick();g.emit(0,'squeezeend');assert.equal(g.state().weapon.seated,true);assert.equal(g.state().weapon.primed,false);
 g.updateBeam(.12,1);g.tick();assert.equal(g.state().weapon.primed,true);assert.equal(g.nodes.get('#t').textContent,'READY');
 g.handAt(0,g.socket);g.emit(0,'squeezestart');g.emit(0,'disconnected');assert.equal(g.state().holding,0);g.state().weapon.reload();for(let i=0;i<100;i++)g.state().weapon.step(.016,0);assert.equal(g.state().weapon.primed,true);
 g.renderer.xr.dispatchEvent({type:'sessionend'});assert.equal(g.beamMesh.visible,false);assert.equal(g.state().weapon.trigger,false);
 }finally{g.restore();}});
test('fixed -16 degree aim and gun position stay on the selected grip',async()=>{const g=await harness();try{g.grips[1].position.set(.2,1.4,-.4);g.grips[1].rotation.set(.1,.6,.2);g.tick();assert.ok(Math.abs(g.state().gunPitch+16*Math.PI/180)<1e-12);g.aim();const old=g.rayDirection.clone();onkeydown({key:'g',code:'KeyG'});g.tick();g.aim();assert.ok(old.angleTo(g.rayDirection)<1e-7);assert.equal(g.gun.parent,g.grips[1]);onkeydown({key:'h',code:'KeyH'});g.tick();assert.equal(g.gun.parent,g.grips[0]);assert.equal(g.state().holding,0);}finally{g.restore();}});
