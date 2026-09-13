import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
import * as T from '../node_modules/aframe/node_modules/three/build/three.module.js';
// Specialize the pinned canonical library at build time; no copied geometry.
export async function towerSubset(source){
 source=source.replaceAll('\r\n','\n');if(createHash('sha256').update(source).digest('hex')!=="abcdd89dd97322d86c607c8ee177f6c9a758a3f71fc8dad15ac6da8c8753b38e")throw Error('Canonical tower source changed: audit the adapter before building');
 const tree=ts.createSourceFile('tiny-towers.js',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),cuts=[];
 function visit(n){
  if(ts.isIfStatement(n)&&/^tier>/.test(n.expression.getText(tree))){cuts.push([n.getStart(tree),n.end,'']);return;}

  if(ts.isCaseClause(n)&&!['0','5'].includes(n.expression.getText(tree))){cuts.push([n.getStart(tree),n.end,'']);return;}
  if(ts.isIfStatement(n)&&/^type===/.test(n.expression.getText(tree))&&!n.expression.getText(tree).includes('"frost"'))cuts.push([n.getStart(tree),n.end,'']);
  if(ts.isVariableDeclaration(n)&&n.name.getText(tree)==='rows')cuts.push([n.initializer.getStart(tree),n.initializer.end,'['+n.initializer.elements.filter(row=>['prism','frost'].includes(row.elements[0].text)).map(row=>row.getText(tree)).join(',')+']']);
  ts.forEachChild(n,visit);
 }visit(tree);for(const [a,b,s]of cuts.sort((a,b)=>b[0]-a[0]))source=source.slice(0,a)+s+source.slice(b);source=source.slice(0,source.indexOf('export function createTinyTowerKit'));
source=source.replace(/const solid=merge[\s\S]*?return Object.freeze[\s\S]*?\n}/,'return [merge(T,parts[0]),merge(T,parts[1])];\n}');
const original=ts.createSourceFile('source',arguments[0],ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
let kit;function find(n){if(ts.isVariableDeclaration(n)&&n.name.getText(original)==='k'&&ts.isObjectLiteralExpression(n.initializer))kit=n.initializer;ts.forEachChild(n,find);}find(original);
const members=kit.properties.filter(p=>['pedestal','collar','column','crystal','beam','halo','material','glowMaterial'].includes(p.name.getText(original))).map(p=>p.getText(original));
const geometryMembers=members.filter(m=>!m.startsWith('material:')&&!m.startsWith('glowMaterial:'));
const capture=source.replace('return [merge(T,parts[0]),merge(T,parts[1])];','return parts;')+'\nexport function capture(T,type){const k={'+geometryMembers.join(',')+'};const parts=build(T,k,type,1,"base");return parts.map(group=>group.map(p=>{const pos=new T.Vector3(),q=new T.Quaternion(),scale=new T.Vector3();p.m.decompose(pos,q,scale);return [Object.keys(k).findIndex(key=>k[key]===p.g),p.c,...pos.toArray(),...new T.Euler().setFromQuaternion(q).toArray().slice(0,3),...scale.toArray()];}));}';
const module=await import('data:text/javascript;base64,'+Buffer.from(capture.replace(/^import[^\n]*\n/gm,'')).toString('base64'));
const recipes=['prism','frost'].map(type=>module.capture(T,type));
const functions=[
 'function radial(T,rings,sides=8){return new T.LatheGeometry(rings.map(([y,x])=>new T.Vector2(x,y)),sides).rotateY(Math.PI/2);}',
 'function box(T){return new T.BoxGeometry(2,2,2).translate(0,1,0);}',
 'function halo(T){return new T.TorusGeometry(.72,.055,4,14).rotateX(Math.PI/2);}'
 ];
source=functions.join('\n')+'\nconst recipes='+JSON.stringify(recipes,(_,v)=>typeof v==='number'?Math.round(v*1e3)/1e3:v)+';export function createTinyTower(T,o){const k={'+geometryMembers.join(',')+'},root=new T.Group();recipes[o.type==="prism"?0:1].forEach((parts,j)=>{const group=new T.Group();root.add(group);parts.forEach(([g,c,x,y,z,rx,ry,rz,sx,sy,sz])=>{const mesh=new T.Mesh(Object.values(k)[g],j?new T.MeshBasicMaterial({color:c,toneMapped:false}):new T.MeshStandardMaterial({color:c,roughness:.72,metalness:.08,flatShading:true,side:T.DoubleSide}));mesh.position.set(x,y,z);mesh.rotation.set(rx,ry,rz);mesh.scale.set(sx,sy,sz);group.add(mesh);});});root.scale.setScalar(o.scale);return root;}';
return source;
}
export const towerSubsetPlugin={name:'canonical-two-tower-families',setup(build){build.onLoad({filter:/tiny-towers\.js$/},async({path})=>({contents:await towerSubset(await readFile(path,'utf8')),loader:'js'}));}};
