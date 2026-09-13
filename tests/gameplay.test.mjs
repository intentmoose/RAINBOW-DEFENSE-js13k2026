import assert from 'node:assert/strict';
import test from 'node:test';
import{createDefense,ACTIVE,GOOD,BOSS}from'../competition/defense.js';

test('build economy and unlocks cannot overspend or bypass phase gates',()=>{
 const d=createDefense();assert.equal(d.credits,70);assert.equal(d.upgrade(0),false,'first gun upgrade must not consume tower funds');assert.equal(d.credits,70);assert.equal(d.build(0,1),false);assert.ok(d.build(0));assert.ok(d.build(2));assert.equal(d.credits,0);assert.equal(d.build(1),false);
 d.credits=200;assert.ok(d.build(0));assert.equal(d.credits,150);assert.ok(d.build(0));assert.equal(d.build(0),false);assert.equal(d.towers[0],3);
 assert.equal(d.allowed(1),false);d.cleared=2;assert.ok(d.allowed(1));assert.equal(d.allowed(2),false);assert.ok(d.build(1,1));d.credits=100;assert.ok(d.upgrade(1));d.cleared=4;assert.ok(d.allowed(2));
 d.start();const points=d.credits;assert.equal(d.build(4),false);assert.equal(d.upgrade(0),false);assert.equal(d.credits,points);assert.equal(d.start(),false);
});
test('cleansing pays once, dissolves, and reuses a bounded slot',()=>{
 const d=createDefense();d.wave=1;d.queued=1;const i=d.spawn();assert.ok(d.hit(i,10));const points=d.credits;assert.equal(d.hit(i,10),false);assert.equal(d.credits,points);assert.ok(d.flags[i]&GOOD);assert.deepEqual(d.events,[i]);d.update(.6);assert.equal(d.flags[i],0);assert.equal(d.spawn(),i);
});
test('leaks damage the crystal without awarding points and defeat blocks building',()=>{
 const d=createDefense();d.wave=6;d.queued=1;const i=d.spawn();assert.ok(d.flags[i]&BOSS);d.state=1;d.queued=0;d.health=4;d.z[i]=8;d.update(.01);assert.equal(d.state,2);assert.equal(d.health,0);assert.equal(d.credits,70);assert.equal(d.build(0),false);
});
test('towers target the front threat and slow upgrades affect live enemies',()=>{
 const d=createDefense();d.cleared=2;d.credits=500;d.build(1,1);d.start();d.queued=0;const a=d.spawn(),b=d.spawn();d.x[a]=d.x[b]=0;d.z[a]=-4;d.z[b]=-7;d.update(.01);assert.equal(d.towerTarget[1],a);assert.ok(d.slow[a]>0);assert.ok(d.hp[a]<d.max[a]);assert.equal(d.hp[b],d.max[b]);
});
test('full pool keeps queued enemies pending instead of silently dropping spawns',()=>{
 const d=createDefense();d.start();d.flags.fill(ACTIVE);d.high=48;d.queued=1;d.timer=0;d.update(0);assert.equal(d.queued,1);d.flags[15]=0;d.update(0);assert.equal(d.queued,0);assert.ok(d.flags[15]&ACTIVE);
});
test('single six-wave campaign unlocks weapons, completes and resets',()=>{
 const d=createDefense();d.reset();
 for(let wave=1;wave<=6;wave++){assert.ok(d.start());let steps=0;while(d.state===1&&steps++<10000){d.update(.1);for(let i=0;i<d.high;i++)d.hit(i,99);d.events.length=0;}assert.ok(steps<10000);assert.equal(d.cleared,wave);assert.equal(d.allowed(1),wave>=2);assert.equal(d.allowed(2),wave>=4);}
 assert.equal(d.state,3);assert.equal(d.start(),false);d.reset();assert.equal(d.wave,0);assert.equal(d.credits,70);assert.equal(d.health,20);assert.equal(d.allowed(1),false);
});
