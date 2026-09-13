import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
import {minify} from 'terser';
import * as Three from '../node_modules/aframe/node_modules/three/build/three.module.js';
import {gameMinifyOptions,weaponProperties,defenseProperties,inputProperties,geometryProperties} from '../scripts/game-minify-options.mjs';

test('renamed properties remain exclusive to private weapon and defense contracts',async()=>{
 for(const filename of ['competition/game.js','competition/engine-hands.js','competition/defense.js','competition/weapon.js','vendor/tiny-unicorn-lab/src/tiny-unicorn.js']){
  const text=await readFile(filename,'utf8'),tree=ts.createSourceFile(filename,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
  function visit(node){
   if(ts.isPropertyAccessExpression(node)&&weaponProperties.test(node.name.text))
    assert.ok(filename.endsWith('/weapon.js')&&node.expression.kind===ts.SyntaxKind.ThisKeyword||node.expression.getText(tree)==='weapon',`${filename}: external property ${node.getText(tree)}`);
   if(ts.isElementAccessExpression(node)&&ts.isStringLiteral(node.argumentExpression)&&weaponProperties.test(node.argumentExpression.text))
    assert.fail('Computed weapon properties require explicit build review');
   if((ts.isPropertyAssignment(node)||ts.isMethodDeclaration(node))&&node.name&&weaponProperties.test(node.name.getText(tree)))
    assert.equal(filename,'competition/weapon.js','Private property declared outside weapon');
   if(ts.isPropertyAccessExpression(node)&&defenseProperties.test(node.name.text))assert.equal(node.expression.getText(tree),'d',filename+': external defense property '+node.getText(tree));
   if(ts.isStringLiteral(node)&&defenseProperties.test(node.text)&&!ts.isPropertyAssignment(node.parent))assert.ok(filename.endsWith('/game.js')&&ts.isArrayLiteralExpression(node.parent)&&['build','upgrade'].includes(node.text),'Dynamic string must not bypass mangling: '+node.getText(tree));
   if(ts.isPropertyAccessExpression(node)&&inputProperties.test(node.name.text))assert.ok(filename==='competition/game.js'&&(node.name.text.startsWith('xr')?node.expression.getText(tree)==='keys':node.expression.getText(tree).endsWith('.userData')),'External input property '+node.getText(tree));
   if(ts.isElementAccessExpression(node)&&ts.isStringLiteral(node.argumentExpression)&&inputProperties.test(node.argumentExpression.text))assert.fail('Computed input property requires review');
   if(ts.isPropertyAccessExpression(node)&&geometryProperties.test(node.name.text))assert.ok(['geometry','variant'].includes(node.expression.getText(tree)),'External geometry property '+node.getText(tree));
   if(ts.isElementAccessExpression(node)&&ts.isStringLiteral(node.argumentExpression)&&geometryProperties.test(node.argumentExpression.text))assert.fail('Computed geometry property requires review');
   ts.forEachChild(node,visit);
  }visit(tree);
 }
});

test('private geometry key compression preserves every canonical anatomy buffer',async()=>{
 const source=await readFile('vendor/tiny-unicorn-lab/src/tiny-unicorn.js','utf8')+`
 export function buffers(T){const geometry=createTinyUnicornGeometry(T);return [geometry.body,geometry.neck,geometry.head,geometry.ear,geometry.eye,geometry.horn,geometry.mane,geometry.frontLeg,geometry.rearLeg,geometry.tail,geometry.wing].map(g=>[...g.attributes.position.array,...g.attributes.normal.array,...g.index.array]);}`;
 const original=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const optimized=await import('data:text/javascript;base64,'+Buffer.from((await minify(source,gameMinifyOptions)).code).toString('base64'));
 assert.deepEqual(optimized.buffers(Three),original.buffers(Three));
});

test('release minification preserves physical, assisted and interrupted weapon transitions',async()=>{
 const source=await readFile('competition/weapon.js','utf8')+`
 export function probe(){const w=createWeapon(),records=[];
 const snapshot=()=>records.push([w.energy,w.seated,w.primed,w.travel,w.trigger,w.blocked,w.assist]);
 for(let cycle=0;cycle<30;cycle++){
 w.press(true);records.push(w.step(.12));w.remove();w.seat();w.step(cycle%2?.12:.04);snapshot();
 w.step(.2);w.press(false);w.press(true);records.push(w.step(.3));w.cancel();snapshot();
 w.reload();w.press(true);for(let i=0;i<100;i++)w.step(.016);snapshot();
 w.press(false);w.press(true);records.push(w.step(.2));w.remove();w.seat();w.step(.04);w.cancel();snapshot();
 }return records;}`;
 const original=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const optimized=await import('data:text/javascript;base64,'+Buffer.from((await minify(source,gameMinifyOptions)).code).toString('base64'));
 assert.deepEqual(optimized.probe(),original.probe());
});


test('release minification preserves defense economy, unlocks and wave outcomes',async()=>{
 const source=await readFile('competition/defense.js','utf8')+`
 export function probe(){const d=createDefense(),result=[];d.build(1);d.upgrade(0);for(let wave=0;wave<7;wave++){d.start();for(let f=0;f<4000&&d.state===1;f++){d.update(.02);for(let i=0;i<d.high;i++)d.hit(i,.03);d.events.length=0;}result.push([d.wave,d.health,d.credits,d.cleared,d.state,d.allowed(1),d.allowed(2),d.build(2,1),d.upgrade(2),...d.towers]);}d.reset();result.push([d.state,d.credits]);return result;}`;
 const original=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const optimized=await import('data:text/javascript;base64,'+Buffer.from((await minify(source,gameMinifyOptions)).code).toString('base64'));
 assert.deepEqual(optimized.probe(),original.probe());
});
