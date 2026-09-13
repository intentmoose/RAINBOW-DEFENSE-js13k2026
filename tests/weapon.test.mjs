import assert from 'node:assert/strict';
import test from 'node:test';
import {createWeapon} from '../competition/weapon.js';
const engage=w=>{w.press(false);w.press(true);};
test('loaded start drains only emitted energy and clips depletion',()=>{
 const w=createWeapon();assert.equal(w.primed,true);assert.equal(w.step(2),0);w.press(true);assert.equal(w.step(2),2);assert.equal(w.energy,10);assert.equal(w.step(20),10);assert.equal(w.energy,0);assert.equal(w.step(1),0);
});
test('insertion preserves ammunition and chambers in 120ms without manual cocking',()=>{
 const w=createWeapon();w.press(true);w.step(2);assert.equal(w.remove(),true);assert.equal(w.remove(),false);assert.equal(w.step(1),0);assert.equal(w.seat(),true);assert.equal(w.seat(),false);assert.equal(w.energy,10);assert.equal(w.primed,false);
 assert.equal(w.step(.06),0);assert.equal(w.travel,.5);assert.equal(w.primed,false);assert.equal(w.step(.06),0);assert.equal(w.primed,true);assert.equal(w.travel,0);engage(w);assert.equal(w.step(.1),.1);
});
test('empty reinsertion remains empty after automatic chambering',()=>{const w=createWeapon();w.energy=0;w.remove();w.seat();w.step(.2);engage(w);assert.equal(w.step(1),0);assert.equal(w.energy,0);});
test('held trigger across manual reload cannot auto-fire',()=>{const w=createWeapon();w.press(true);w.remove();w.seat();assert.equal(w.step(1),0);engage(w);assert.equal(w.step(.1),.1);});
test('pressing during chambering requires a fresh trigger press after completion',()=>{const w=createWeapon();w.remove();w.seat();w.step(.04);engage(w);assert.equal(w.step(.2),0);engage(w);assert.equal(w.step(.1),.1);});
test('button reload seats at 850ms and completes after one second',()=>{
 const w=createWeapon();w.energy=1;w.press(true);assert.equal(w.reload(),true);assert.equal(w.reload(),false);w.step(.8);assert.equal(w.seated,false);w.step(.05);assert.equal(w.seated,true);assert.equal(w.primed,false);assert.equal(w.energy,12);w.step(.13);assert.equal(w.primed,true);assert.ok(w.assist);assert.equal(w.step(.02),0);assert.equal(w.assist,0);engage(w);assert.equal(w.step(.1),.1);
});
test('pressing in the final assisted phase cannot queue a shot',()=>{const w=createWeapon();w.reload();w.step(.98);engage(w);assert.equal(w.step(.2),0);engage(w);assert.equal(w.step(.1),.1);});
test('delayed frames cross seating and chambering without skipping readiness or firing',()=>{const w=createWeapon();w.press(true);w.reload();assert.equal(w.step(5),0);assert.equal(w.seated,true);assert.equal(w.primed,true);assert.equal(w.travel,0);assert.equal(w.assist,0);assert.equal(w.energy,12);});
test('zero time cannot advance reload or consume ammo',()=>{const w=createWeapon();w.reload();const before={...w};w.step(0);assert.deepEqual(w,before);});
test('removing a magazine during bolt movement cancels chambering',()=>{const w=createWeapon();w.remove();w.seat();w.step(.04);w.remove();w.step(1);assert.equal(w.primed,false);engage(w);assert.equal(w.step(1),0);w.seat();w.step(.2);assert.equal(w.primed,true);});
test('disconnect or blur cancels assistance safely at every phase and remains recoverable',()=>{
 for(const time of [0,.5,.86,.9,.98]){const w=createWeapon();w.press(true);w.reload();w.step(time);const seated=w.seated,energy=w.energy;w.cancel();assert.equal(w.trigger,false);assert.equal(w.assist,0);assert.equal(w.travel,0);assert.equal(w.primed,seated);assert.equal(w.energy,energy);assert.equal(w.step(10),0);w.reload();w.step(2);engage(w);assert.equal(w.step(.1),.1);}
});
test('100 reloads preserve one bounded record and a new run has clean state',()=>{const w=createWeapon(),keys=Object.keys(w);for(let i=0;i<100;i++){w.reload();w.step(2);assert.equal(w.energy,12);engage(w);assert.equal(w.step(.125),.125);assert.deepEqual(Object.keys(w),keys);}w.cancel();const fresh=createWeapon();assert.equal(fresh.energy,12);assert.equal(fresh.trigger,false);assert.equal(fresh.assist,0);});
