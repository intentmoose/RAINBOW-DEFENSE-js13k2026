import assert from 'node:assert/strict';
import test from 'node:test';
import {harness} from './helpers/defense-harness.mjs';

test('engine hand adapters preserve handedness, animated grip states and bounded reconnections',async()=>{
 const g=await harness();try{
  const roots=g.hands.map(h=>h.el.object3D);
  assert.deepEqual(g.hands.map(h=>h.data.hand),['left','right']);
  assert.equal(g.hands[1].gesture,'Fist');assert.equal(g.hands[0].gesture,undefined);
  g.grips[0].position.x=-1;g.tick();
  g.emit(0,'squeezestart');g.tick();assert.equal(g.hands[0].gesture,'Fist');
  g.emit(0,'squeezeend');g.tick();assert.equal(g.hands[0].gesture,undefined);
  for(let i=0;i<20;i++){
   g.emit(0,'disconnected');g.tick();assert.equal(roots[0].visible,false);
   g.connect(0,'left');g.tick();assert.equal(roots[0].visible,true);
   g.resetRun();g.tick();assert.deepEqual(g.hands.map(h=>h.el.object3D),roots);
  }
  g.emit(0,'disconnected');g.emit(1,'disconnected');g.tick();assert.ok(roots.every(h=>!h.visible));
  g.connect(0,'right');g.connect(1,'left');g.tick();
  assert.equal(roots[0].parent,g.grips[1]);assert.equal(roots[1].parent,g.grips[0]);
  g.renderer.xr.isPresenting=false;g.tick();assert.ok(roots.every(h=>!h.visible));
 }finally{g.restore();}
});
