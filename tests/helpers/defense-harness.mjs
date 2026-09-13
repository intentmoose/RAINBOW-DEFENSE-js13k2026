import{towerSubset}from'../../scripts/tower-subset.mjs';
import{createEngineHand}from'../../competition/engine-hands.js';
import{readFile}from'node:fs/promises';
import * as Three from '../../node_modules/aframe/node_modules/three/build/three.module.js';
import{createTinyUnicornGeometry}from'../../vendor/tiny-unicorn-lab/src/tiny-unicorn.js';
import{createWeapon}from'../../competition/weapon.js';
import * as defense from '../../competition/defense.js';
export async function harness(){
 const {createTinyTower}=await import('data:text/javascript;base64,'+Buffer.from(await towerSubset(await readFile('vendor/tiny-unicorn-lab/src/tiny-towers.js','utf8'))).toString('base64'));
 const node=()=>({hidden:false,disabled:false,style:{setProperty(){}},append(){},prepend(){},querySelector:node});
 const draws=[],nodes=new Map(),context={fillRect(){},fillText(...args){draws.push(args)},scale(){}};
 globalThis.document={body:node(),querySelector:s=>nodes.get(s)??nodes.set(s,node()).get(s),createElement:()=>({width:0,height:0,getContext:()=>context,setPointerCapture(){}})};
 Object.assign(globalThis,{innerWidth:1000,innerHeight:700,devicePixelRatio:1,window:{},localStorage:{},onkeydown:0,onkeyup:0,onresize:0,onblur:0,createTinyTower,createTinyUnicornGeometry,createWeapon,createEngineHand,...defense});
 class XR extends Three.EventDispatcher{isPresenting=true;controllers=[new Three.Group(),new Three.Group()];grips=[new Three.Group(),new Three.Group()];setReferenceSpaceType(){}getController(i){return this.controllers[i]}getControllerGrip(i){return this.grips[i]}getSession(){return null}}
 class Renderer{constructor(){this.xr=new XR()}setPixelRatio(){}setSize(){}render(){}setAnimationLoop(loop){this.loop=loop}}
 // Physics fixtures use a model-loader double; smoke:xr verifies the real pinned component and GLBs.
 class HandComponent{init(){}update(){this.el.setObject3D('mesh',new Three.Group())}onControllerConnected(){}animateGesture(){}tick(){}}
 globalThis.AFRAME={THREE:{...Three,WebGLRenderer:Renderer},components:{'hand-controls':{Component:HandComponent}}};
 const oldTimeout=setTimeout,oldClear=clearTimeout;globalThis.setTimeout=()=>0;globalThis.clearTimeout=()=>{};
 let source=await readFile(new URL('../../competition/game.js',import.meta.url),'utf8');source=source.replace(/^import[^\n]*\n/gm,'');
 source=source.replace(/\n}\s*$/,`\nglobalThis.fixture={unlockAudio,cards,updateCards,selectGun,assistReload,towerMenu,towerForms,towerModels,scope,pouch,discard,d,scene,rig,camera,renderer,controllers,grips,gun,cartridge,handle,socket,hands,beamMesh,rayOrigin,rayDirection,aim,updateWeapon,updateBeam,updatePlayer,updateTowers,resetRun,cycleMode,interact,buildTower,nextWave,updateUI,reloadHint,board,pads,species,state:()=>({weapon,holding,inputController,gunHand,mode,gunPitch,selectedPad,celebrate}),activate:()=>{active=1;}};\n}`);
 Function(source)();const g=globalThis.fixture;g.nodes=nodes;g.draws=draws;
 g.restore=()=>{globalThis.setTimeout=oldTimeout;globalThis.clearTimeout=oldClear;};
 g.emit=(i,type,data)=>g.controllers[i].dispatchEvent({type,data});
 g.connect=(i,handedness)=>g.emit(i,'connected',{handedness,gamepad:{axes:[],buttons:Array.from({length:6},()=>({pressed:false}))}});
 g.tick=(dt=.016)=>{g.scene.updateMatrixWorld(true);g.updateWeapon(dt,1);g.scene.updateMatrixWorld(true);};
 g.handAt=(i,local)=>{g.scene.updateMatrixWorld(true);const world=g.gun.localToWorld(local.clone());const q=g.grips[i].getWorldQuaternion(new Three.Quaternion());world.sub(new Three.Vector3(0,-.01,.02).applyQuaternion(q));g.grips[i].position.copy(g.rig.worldToLocal(world));g.scene.updateMatrixWorld(true);};
 g.resetRun();g.connect(0,'left');g.connect(1,'right');g.tick();return g;
}
export{Three};
