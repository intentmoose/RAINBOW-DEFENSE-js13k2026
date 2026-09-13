import {createTinyTower} from "../vendor/tiny-unicorn-lab/src/tiny-towers.js";
import {createEngineHand} from "./engine-hands.js";
import {createTinyUnicornGeometry} from "../vendor/tiny-unicorn-lab/src/tiny-unicorn.js";
import {createWeapon} from "./weapon.js";
import {createDefense,CAPACITY,ACTIVE,GOOD,WING,BOSS,PAD_X,PAD_Z} from "./defense.js";
const T=globalThis.AFRAME.THREE,canvas=document.createElement('canvas');
const context=canvas.getContext('webgl2',{antialias:true,powerPreference:'high-performance'});
if(!context){document.querySelector('#c p').textContent='WebGL is disabled. Open on a WebGL-enabled browser or headset.';document.querySelector('#s').hidden=true;}else{
const names=['PISTOL','SHOTGUN','SNIPER'],d=createDefense(),N=CAPACITY,SPARKS=160,WARDEN=2;
const {x,y,z,vz,yaw,corruption,phase,action,scale,flags}=d;
const scene=new T.Scene(),camera=new T.PerspectiveCamera(67,innerWidth/innerHeight,.04,80),rig=new T.Group();
camera.position.set(0,1.72,0);rig.position.z=7;rig.add(camera);scene.add(rig);
const renderer=new T.WebGLRenderer({canvas,context});renderer.setPixelRatio(Math.min(devicePixelRatio,1.45));renderer.setSize(innerWidth,innerHeight);renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local-floor');document.body.prepend(canvas);
scene.fog=new T.FogExp2(0x101c35,.027);scene.add(new T.HemisphereLight(0xe9d9ff,0x170929,2.3));
const sun=new T.DirectionalLight(0xffd4f2,3.5);sun.position.set(-4,9,5);scene.add(sun);
const environmentMaterial=new T.ShaderMaterial({side:T.DoubleSide,
 vertexShader:'varying vec3 v;void main(){v=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(v,1.);}',
 fragmentShader:'varying vec3 v;void main(){vec3 n=normalize(v);float e=abs(abs(v.x)-4.5);vec3 c=length(v)<26.?(vec3(.075,.135,.225)+vec3(.12,.84,.75)*(.025/(e*e+.025)))*(1.-min(.8,length(v)*.025)):mix(vec3(.35,.2,.42),vec3(.025,.055,.14),sqrt(max(0.,n.y)))+vec3(.7,.35,.12)*pow(max(0.,dot(n,normalize(vec3(-.3,.22,-1.)))),80.);gl_FragColor=vec4(c,1.);}'
});scene.add(new T.Mesh(new T.SphereGeometry(65,24,12),environmentMaterial));
function createTinyUnicornSpecies() {
  // This is the accepted upstream pool, bundled from the pinned Tiny Unicorn Lab submodule.
  const geometry = createTinyUnicornGeometry(T);
  const standard = options => new T.MeshStandardMaterial({ roughness: .76, flatShading: true, side: T.DoubleSide, ...options });
  const coatMaterial = standard(), maneMaterial = standard(), hornMaterial = standard({ roughness: .45 });
  const eyeMaterial = new T.MeshBasicMaterial({ toneMapped: false });
  const shieldMaterial = new T.MeshBasicMaterial({ transparent: true, opacity: .1, blending: T.AdditiveBlending, depthWrite: false });
  const instance = (g, m, count) => {
    const mesh = new T.InstancedMesh(g, m, count);
    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
    mesh.setColorAt(0,new T.Color());
    scene.add(mesh);
    return mesh;
  };
  const body = instance(geometry.body, coatMaterial, N), neck = instance(geometry.neck, coatMaterial, N), heads = instance(geometry.head, coatMaterial, N), ears = instance(geometry.ear, coatMaterial, N * 2), mane = instance(geometry.mane, maneMaterial, N);
  const horn = instance(geometry.horn, hornMaterial, N + 2), tail = instance(geometry.tail, maneMaterial, N);
  const frontLegs = instance(geometry.frontLeg, coatMaterial, N * 2), rearLegs = instance(geometry.rearLeg, coatMaterial, N * 2), wings = instance(geometry.wing, maneMaterial, N * 2);
  const eyes = instance(geometry.eye, eyeMaterial, N * 2);
  const shields = instance(new T.IcosahedronGeometry(1,1), shieldMaterial, N);
  // Soft grounding without a shadow map, light pass, texture or anatomy changes.
  const shadows = instance(new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new T.ShaderMaterial({
    transparent: true, depthWrite: false,
    vertexShader: 'varying vec2 v;void main(){v=uv-.5;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}',
    fragmentShader: 'varying vec2 v;void main(){gl_FragColor=vec4(0.,0.,0.,max(0.,.25-dot(v,v)));}'
  }), N);
  const meshes = [body, neck, heads, ears, mane, horn, tail, frontLegs, rearLegs, wings, eyes, shields, shadows];
  const dummy = new T.Object3D(), color = new T.Color(), rainbowTone = new T.Color(), wingTone = new T.Color();
  const evil = new T.Color(0x49416b), good = new T.Color(0xfff0d1);
  const darkMane = new T.Color(0x8836b1), eyeColors = [0xff643d, 0x4ab5ff, 0xb36cff, 0x72fff1];
  let c=1,s=0,headTilt=0,headY=0;
  function put(mesh, i, lx = 0, ly = 0, lz = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
    const size = scale[i];
    if(mesh===heads||mesh===horn||mesh===eyes||mesh===ears){const dx=lx-1.01,dy=ly-headY,co=Math.cos(headTilt),si=Math.sin(headTilt);lx=1.01+dx*co-dy*si;ly=headY+dx*si+dy*co;rz+=headTilt;}
    dummy.position.set(x[i] + (lx * c + lz * s) * size, y[i] + ly * size, z[i] + (-lx * s + lz * c) * size);
    dummy.rotation.set(rx, yaw[i] + ry, rz);
    dummy.scale.set(size * sx, size * sy, size * sz);
    dummy.updateMatrix();
    mesh.setMatrixAt(mesh.count++, dummy.matrix);
  }
  function tint(mesh, color) {
    mesh.setColorAt(mesh.count - 1, color);
  }
  function sync(time) {
    for (const mesh of meshes) mesh.count = 0;
    for (let i = 0; i < d.high; i++) {
      if (!(flags[i] & ACTIVE)) continue;
      c=Math.cos(yaw[i]);s=Math.sin(yaw[i]);
      put(shadows, i, 0, (.025-y[i])/scale[i], 0, 0, 0, 0, 4, 1, 1.8);
      const clean = 1 - Math.min(1, corruption[i]), winged = flags[i] & WING;
      const motion=flags[i]&GOOD?0:Math.min(1,vz[i]);
      const stride = Math.sin(phase[i]) * .58 * motion;
      const bounce = Math.abs(Math.sin(phase[i]*2)) * .055 * motion;
      headTilt=stride*.08-action[i]*.3;headY=3.31+bounce;
      const hue = (i * .173 + time * .018) % 1;
      color.copy(evil).lerp(good, Math.min(1,clean+action[i]));
      put(body, i, 0, bounce); tint(body, color);
      put(neck, i, 0, bounce); tint(neck, color);
      put(heads, i, 1.01, headY); tint(heads, color);
      put(mane, i, 0, bounce); color.copy(darkMane).lerp(rainbowTone.setHSL(hue, .9, .55), clean); tint(mane, color);
      const hornScale=(flags[i]&BOSS?1.3:1)*(1+action[i]*.35);put(horn, i, 1.29, 3.72 + bounce,0,0,0,0,hornScale,hornScale,hornScale); color.setHex(eyeColors[(flags[i] >> 2) & 3]).multiplyScalar(.4 + clean * .6); tint(horn, color);
      if(flags[i]&BOSS)for(let j=1;j<3;j++){put(horn,i,.92,3.66+bounce,j&1?.24:-.24,0,0,1.35,.6,.6,.7);tint(horn,color);}
      put(tail, i, -1.43, 2.28 + bounce, 0, 0, 0, Math.sin(time * 3 + phase[i]) * .15); tint(tail, color.copy(darkMane).lerp(rainbowTone.setHSL((hue + .35) % 1, .9, .55), clean));
      for (let j = 0; j < 2; j++) {
        const side = j ? 1 : -1;
        put(ears,i,1.07,3.71+bounce,side*.22,side*.16,0,side*.06);tint(ears,color.copy(evil).lerp(good,clean));
        const legColor=color.copy(evil).lerp(good,clean),frontAngle=winged?.5:stride*(j?-1:1),rearAngle=winged?-.45:stride*(j?-1:1)*.85;
        put(frontLegs,i,.63,1.84+bounce,side*.39,0,0,frontAngle);tint(frontLegs,legColor);
        put(rearLegs,i,-.94,1.88+bounce,side*.42,0,0,rearAngle);tint(rearLegs,legColor);
        if (winged) {
          put(wings, i, -.05, 2.55 + bounce, 0, side * (.18 + Math.sin(time * 4 + phase[i]) * .16), 0, 0, 1, 1, side);
          tint(wings, color.copy(darkMane).lerp(wingTone.setHSL((hue + .12) % 1, .8, .68), clean));
        }
        put(eyes, i, 1.34, 3.52 + bounce, side * .30,0,0,0,1.4,1.4,1.4); tint(eyes, color.setHex(eyeColors[(flags[i] >> 2) & 3]));
      }
      if (((flags[i] >> 2) & 3) === WARDEN) {
        put(shields, i, 0, 1.9, 0, 0, 0, 0, 1.4, 1.4, 1.4);
        tint(shields, color.setHex(flags[i] & GOOD ? 0x66eaff : 0xb24cff));
      }
    }
    for(const mesh of meshes){mesh.visible=mesh.count>0;if(mesh.visible)mesh.instanceMatrix.needsUpdate=mesh.instanceColor.needsUpdate=true;}
  }
  return { sync };
}

const species = createTinyUnicornSpecies();
function unlit(geometry) {
  return geometry;
}
const crystalGeometry=new T.OctahedronGeometry(1);
const ground=new T.Mesh(new T.CircleGeometry(25,64),environmentMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
const mountains=new T.InstancedMesh(crystalGeometry,new T.MeshStandardMaterial({color:0x514b77,roughness:.38,metalness:.25,flatShading:true}),64),worldDummy=new T.Object3D();
for(let i=0;i<64;i++){const side=i%2?1:-1,height=2+i%9;worldDummy.position.set(side*(11+i%5*2),height*.6,12-Math.floor(i/2)*1.6);worldDummy.scale.set(1+i%3*.6,height,1+i%2);worldDummy.rotation.y=i;worldDummy.updateMatrix();mountains.setMatrixAt(i,worldDummy.matrix);}scene.add(mountains);

const rainbow = new T.InstancedMesh(unlit(new T.TorusGeometry(1, .018, 3, 64, Math.PI)), new T.MeshBasicMaterial({ transparent: true, opacity: .45, blending: T.AdditiveBlending }), 6);
const rainbowColors = [0xff4d88,0xff9f45,0xffe85c,0x5bff9d,0x55c9ff,0xa879ff];
const paletteColors = rainbowColors.map(value => new T.Color(value));
for (let i = 0; i < 6; i++) { worldDummy.position.set(0,0,-25); worldDummy.scale.setScalar(12 - i * .3);worldDummy.rotation.set(0,0,0);worldDummy.updateMatrix(); rainbow.setMatrixAt(i,worldDummy.matrix); rainbow.setColorAt(i,new T.Color(rainbowColors[i])); }
scene.add(rainbow);
const sparkPositions = new Float32Array(SPARKS * 3), sparkColors = new Uint8Array(SPARKS * 3);
const sparkVelocity = new Float32Array(SPARKS * 3), sparkLife = new Float32Array(SPARKS);
const sparkGeometry = new T.BufferGeometry();
sparkGeometry.setAttribute("position", new T.BufferAttribute(sparkPositions, 3)); sparkGeometry.setAttribute("color", new T.BufferAttribute(sparkColors, 3,true));
const sparks = new T.Points(sparkGeometry, new T.PointsMaterial({ size: .08, vertexColors: true, transparent: true, blending: T.AdditiveBlending, depthWrite: false }));
sparks.frustumCulled=false;
scene.add(sparks);
let sparkCursor = 0;
function burst(i) {
  sparkGeometry.attributes.color.needsUpdate = true;
  for (let j = 0; j < 16; j++) {
    const k = sparkCursor++ % SPARKS, p = k * 3, angle = Math.random() * 7, speed = .8 + Math.random() * 2;
    sparkPositions[p] = x[i]; sparkPositions[p+1] = y[i] + 1; sparkPositions[p+2] = z[i];
    sparkVelocity[p] = Math.cos(angle) * speed; sparkVelocity[p+1] = .7 + Math.random() * 2; sparkVelocity[p+2] = Math.sin(angle) * speed;
    const color = paletteColors[j % 6]; sparkGeometry.attributes.color.setXYZ(k,color.r,color.g,color.b); sparkLife[k] = 1;
  }
}
function updateSparks(dt) {
  let count = 0;
  for (let i = 0; i < SPARKS; i++) if (sparkLife[i] > 0) {
    count = i + 1;
    const p = i * 3; sparkLife[i] -= dt; sparkVelocity[p+1] -= dt * 2;
    sparkPositions[p] += sparkVelocity[p] * dt; sparkPositions[p+1] += sparkVelocity[p+1] * dt; sparkPositions[p+2] += sparkVelocity[p+2] * dt;
  } else sparkPositions[i*3+1] = -99;
  sparks.visible = count > 0;
  sparkGeometry.setDrawRange(0, count);
  sparkGeometry.attributes.position.needsUpdate = true;
}



const core=new T.Mesh(crystalGeometry,new T.MeshStandardMaterial({color:0xa3fff0,emissive:0x34c9b1,emissiveIntensity:.6,metalness:.2,roughness:.25}));core.position.set(0,1.5,8.7);core.scale.set(.75,1.3,.75);scene.add(core);
const padGeometry=new T.CylinderGeometry(.8,.9,.15,24),pads=[];
const towerForms=['prism','frost'].map(type=>createTinyTower(T,{type,scale:.65})),towerModels=[];
for(let i=0;i<6;i++){const pad=new T.Mesh(padGeometry,new T.MeshStandardMaterial({color:0x426779,emissive:0x18343a}));pad.position.set(PAD_X[i],.1,PAD_Z[i]);pad.userData.pad=i;pads.push(pad);scene.add(pad);const model=new T.Group();model.add(...towerForms.map(f=>f.clone()));model.position.copy(pad.position);towerModels.push(model);scene.add(model);}
const towerLines=new T.BufferGeometry(),towerPositions=new Float32Array(36),towerColors=new Float32Array(36);towerLines.setAttribute('position',new T.BufferAttribute(towerPositions,3));towerLines.setAttribute('color',new T.BufferAttribute(towerColors,3));
const towerBeams=new T.LineSegments(towerLines,new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.8,blending:T.AdditiveBlending}));towerBeams.frustumCulled=false;scene.add(towerBeams);
const beamMesh=new T.InstancedMesh(unlit(new T.CylinderGeometry(.012,.022,1,5)),new T.MeshBasicMaterial({toneMapped:false,transparent:true,opacity:.88,blending:T.AdditiveBlending,depthWrite:false}),6);beamMesh.frustumCulled=false;scene.add(beamMesh);for(let i=0;i<6;i++)beamMesh.setColorAt(i,paletteColors[i]);
let active=0,firing=0,lock=0,over=0,mode=0,towerType=0,shotClock=0,flash=0,kick=0,gunPitch=-23*Math.PI/180;
let turnLatch=0,aimYaw=0,aimPitch=0,moveX=0,moveY=0,inputSource,inputController;
const keys={},rayOrigin=new T.Vector3(),rayDirection=new T.Vector3(),point=new T.Vector3(),up=new T.Vector3(0,1,0),quaternion=new T.Quaternion();
let weapon=createWeapon(),gunHand='right',holding=0,nearPart=0;
const magazineVelocity=new T.Vector3(),magazineLast=new T.Vector3();
const controllers=[renderer.xr.getController(0),renderer.xr.getController(1)],grips=controllers.map((c,i)=>renderer.xr.getControllerGrip(i));
const gun=new T.Group(),cartridge=new T.Group(),handle=new T.Group();
const shell=new T.MeshStandardMaterial({color:0x152b36,metalness:.35,roughness:.36}),trim=new T.MeshStandardMaterial({color:0xbce7e8,metalness:.5,roughness:.35}),crystal=new T.MeshStandardMaterial({color:0x99ffee,emissive:0x44bbaa,emissiveIntensity:.6,flatShading:true});
const block=new T.BoxGeometry(1,1,1),handleMaterial=trim.clone(),cartridgeMaterial=shell.clone();

function part(parent,material,sx,sy,sz,x,y,z,geometry=block){const mesh=new T.Mesh(geometry,material);mesh.scale.set(sx,sy,sz);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
const pistolGrip=part(gun,shell,.075,.13,.085,0,-.055,.035);pistolGrip.rotation.x=-.25;
part(gun,shell,.11,.09,.24,0,.04,-.07);part(gun,trim,.12,.02,.25,0,.09,-.07);

part(handle,handleMaterial,.018,.026,.08,0,0,0);gun.add(handle);
part(cartridge,cartridgeMaterial,.065,.15,.07,0,0,0);
const segments=rainbowColors.map((c,i)=>part(cartridge,new T.MeshBasicMaterial({color:c}),.071,.015,.076,0,.06-i*.024,0));gun.add(cartridge);
const barrel=part(gun,trim,.033,.2,.033,0,.04,-.24,new T.CylinderGeometry(1,1,1,8));barrel.rotation.x=Math.PI/2;
const secondBarrel=barrel.clone();gun.add(secondBarrel);
const scope=new T.Group();scope.position.set(0,.14,-.09);gun.add(scope);
const optic=new T.CylinderGeometry(.042,.042,.18,16,1,true),opticMaterial=trim.clone();opticMaterial.side=T.DoubleSide;
part(scope,opticMaterial,1,1,1,0,0,0,optic).rotation.x=Math.PI/2;
const reticle=new T.MeshBasicMaterial({color:0x66ffcc});part(scope,reticle,.002,.022,.001,0,0,-.095);part(scope,reticle,.022,.002,.001,0,0,-.095);

const emitter=part(gun,crystal,.045,.045,.025,0,.04,-.35,crystalGeometry);
part(gun,trim,.02,.025,.014,-.033,.115,.025);part(gun,trim,.02,.025,.014,.033,.115,.025);const sight=part(gun,crystal,.012,.024,.012,0,.115,-.30);
const socket=new T.Vector3(0,-.10,-.07),handPoint=new T.Vector3(),muzzle=new T.Vector3(),beamEnd=new T.Vector3(),beamMid=new T.Vector3(),beamRight=new T.Vector3();
const socketGuide=part(gun,new T.MeshBasicMaterial({color:0x66ffe3,wireframe:true,transparent:true,opacity:.35}),.078,.17,.082,0,-.10,-.07);socketGuide.visible=false;
const pouch=cartridge.clone();scene.add(pouch);cartridge.position.copy(socket);
const discard=cartridge.clone(),discardVelocity=new T.Vector3();discard.children.slice(1).forEach(m=>m.visible=false);discard.children[0].material=cartridgeMaterial.clone();discard.visible=false;scene.add(discard);
const hands=[null,null];
function updateHands(dt){for(const h of hands)if(h)h.el.object3D.visible=false;
 if(!renderer.xr.isPresenting)return;
 for(let i=0;i<2;i++){const c=controllers[i],side=c.userData.source?.handedness;if(!side||!grips[i].visible)continue;
 const j=side==='left'?0:1,h=hands[j]||(hands[j]=createEngineHand(T,j)),root=h.el.object3D;grips[i].add(root);root.visible=true;
 if(root.children.length){const closed=c===inputController||c.userData.squeezed,pose=closed?'Fist':undefined;if(pose!==h.gesture){h.animateGesture(pose,h.gesture);h.gesture=pose;}h.tick(0,dt*1000);}}}
function twinkle(strength=.4,source=inputSource){source?.gamepad?.hapticActuators?.[0]?.pulse?.(strength,45)?.catch?.(()=>{});}
function clickMechanism(f){tone(f,.025,.045,.3,0,"square");twinkle(.25,holding?controllers.find(c=>c!==inputController)?.userData.source:inputSource);}
function interruptWeapon(){turnLatch=0;weapon.cancel();holding=0;magazineVelocity.set(0,0,0);firing=flash=0;beamMesh.visible=false;}
function roles(){turnLatch=0;interruptWeapon();inputController=controllers.find(c=>c.userData.source?.handedness===gunHand)||controllers.find(c=>c.userData.source);inputSource=inputController?.userData.source;}
function swapHand(){gunHand=gunHand==='right'?'left':'right';roles();}
function handLocal(c){gun.updateWorldMatrix(true,false);grips[controllers.indexOf(c)].updateWorldMatrix(true,false);handPoint.set(0,-.01,.02);grips[controllers.indexOf(c)].localToWorld(handPoint);return gun.worldToLocal(handPoint);}
function gripTarget(){gun.localToWorld(point.copy(handPoint));if(pouch.visible&&!weapon.seated&&point.distanceTo(pouch.position)<.22)return 4;cartridge.getWorldPosition(point);gun.worldToLocal(point);const cell=handPoint.distanceTo(point),grip=handPoint.distanceTo(pistolGrip.position);return weapon.primed&&grip<.07&&grip<cell?3:cell<.12?1:0;}
function gripStart(c){if(!active||c===inputController)return;if(weapon.assist||holding)return;
 handLocal(c);const target=gripTarget();if(target===3){gunHand=c.userData.source.handedness;roles();return;}if(target===4){discard.visible=true;cartridge.getWorldPosition(discard.position);cartridge.getWorldQuaternion(discard.quaternion);cartridge.getWorldScale(discard.scale);discardVelocity.copy(magazineVelocity);scene.attach(cartridge);cartridge.position.copy(pouch.position);weapon.energy=12;}if(target===4||target===1&&(weapon.remove()||!weapon.seated)){holding=1;weapon.stop();scene.attach(cartridge);magazineLast.copy(cartridge.position);magazineVelocity.set(0,0,0);}
 if(holding){firing=flash=0;beamMesh.visible=false;clickMechanism(1100);}}
function gripEnd(c){if(c===inputController)return;gun.localToWorld(point.copy(socket));if(holding===1&&cartridge.position.distanceTo(point)<.12){if(weapon.seat())clickMechanism(550);}holding=0;}
controllers.forEach((c,i)=>{rig.add(c,grips[i]);c.addEventListener('connected',e=>{c.userData.source=e.data;roles();});c.addEventListener('disconnected',()=>{c.userData.source=0;c.userData.squeezed=0;roles();});
 c.addEventListener('selectstart',()=>{if(c===inputController){if(!interact()&&d.state===1)weapon.press(true);}});c.addEventListener('selectend',()=>{if(c===inputController)weapon.press(false);});
 c.addEventListener('squeezestart',()=>{c.userData.squeezed=1;gripStart(c);});c.addEventListener('squeezeend',()=>{c.userData.squeezed=0;gripEnd(c);});});
renderer.xr.addEventListener('sessionend',()=>{interruptWeapon();vrButton.hidden=false;vrButton.disabled=false;vrButton.textContent='ENTER VR';});renderer.xr.addEventListener('sessionstart',interruptWeapon);
function fall(m,v,dt){if(!m.visible||m.parent!==scene)return;v.y-=dt*9.8;m.position.addScaledVector(v,dt);m.rotation.x+=v.z*dt;m.rotation.z-=v.x*dt;if(m.position.y<.08){m.position.y=.08;v.y=Math.abs(v.y)*.3;v.x*=.7;v.z*=.7;}}
function updateWeapon(dt,time){
 const xr=renderer.xr.isPresenting,parent=xr&&inputController?grips[controllers.indexOf(inputController)]:camera;if(gun.parent!==parent)parent.add(gun);
 gun.position.set(xr?0:Math.min(.18,camera.aspect*.13),xr?0:-.16,xr?0:-.5);gun.scale.setScalar(xr?1:.6);gun.rotation.set(gunPitch+kick,xr?0:.18,0);kick=Math.max(0,kick-dt*.6);gun.visible=!xr||!!inputSource;
 camera.getWorldDirection(point);if(point.x*point.x+point.z*point.z>.05)pouch.rotation.y=Math.atan2(-point.x,-point.z);camera.getWorldPosition(muzzle);pouch.position.set(inputSource?.handedness==='left'?.3:-.3,-.6,-.22).applyAxisAngle(up,pouch.rotation.y).add(muzzle);pouch.position.y=Math.max(.25,pouch.position.y);pouch.visible=xr&&active&&!!inputSource&&!holding&&!weapon.seated;
 const support=controllers.find(c=>c!==inputController&&c.userData.source);
 if(xr&&inputController&&(!inputController.visible||!parent.visible)){interruptWeapon();gun.visible=false;}if(holding&&(!support||!grips[controllers.indexOf(support)].visible))interruptWeapon();
 nearPart=0;handleMaterial.emissive.setHex(0);cartridgeMaterial.emissive.setHex(0);
 if(support&&grips[controllers.indexOf(support)].visible){handLocal(support);if(!holding){nearPart=gripTarget();if(nearPart===1)cartridgeMaterial.emissive.setHex(0x2299bb);}}
 shell.emissive.setHex(nearPart===3?0x2299bb:0);
 if(holding===1){gun.localToWorld(point.copy(handPoint));magazineVelocity.lerp(muzzle.copy(point).sub(magazineLast).divideScalar(Math.max(.001,dt)).clampLength(0,8),.5);magazineLast.copy(point);cartridge.position.copy(point);grips[controllers.indexOf(support)].getWorldQuaternion(cartridge.quaternion);}

 else if(weapon.seated){gun.add(cartridge);cartridge.scale.setScalar(1);cartridge.rotation.set(0,0,0);cartridge.position.copy(socket);}
 else if(weapon.assist){scene.attach(cartridge);gun.localToWorld(point.copy(socket).addScaledVector(up,-.22*Math.sin(Math.min(1,weapon.assist/.85)*Math.PI)));cartridge.position.lerp(point,Math.min(1,dt*12));}
 else fall(cartridge,magazineVelocity,dt);
 fall(discard,discardVelocity,dt);
 if(weapon.travel)handleMaterial.emissive.setHex(0x22bb66);
 handle.position.set(.062,.055,-.045+weapon.travel*.035);socketGuide.visible=!weapon.seated;gun.localToWorld(point.copy(socket));cartridge.getWorldPosition(muzzle);socketGuide.material.opacity=muzzle.distanceTo(point)<.12?.8:.25;
 for(let i=0;i<6;i++)segments[i].scale.x=.071*Math.max(.1,Math.min(1,weapon.energy/2-i));
 shapeGun(gunParts,mode);

 emitter.material.emissiveIntensity=weapon.primed?.6+lock:.05;
 const swap=inputSource?.gamepad?.buttons?.[5]?.pressed;if(swap&&!keys.xrMode)cycleMode();keys.xrMode=swap;updateHands(dt);}


function panel(w,h){const c=document.createElement('canvas');c.width=512;c.height=256;const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=T.LinearFilter;const mesh=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,toneMapped:false}));scene.add(mesh);return[mesh,c.getContext('2d'),texture];}
const [board,boardContext,boardTexture]=panel(2.8,1.4);board.position.set(0,3.2,0);
const gunParts=[barrel,secondBarrel,emitter,sight,scope],shapeParts=gunParts.map(p=>gun.children.indexOf(p));
function shapeGun(parts,mode){const [barrel,secondBarrel,emitter,sight,scope]=parts;  barrel.scale.y=mode===2?.4:mode===1?.15:.2;barrel.scale.x=barrel.scale.z=mode===1?.05:.033;barrel.position.z=-.14-barrel.scale.y/2;emitter.position.z=-.14-barrel.scale.y;sight.position.z=emitter.position.z+.045;
 barrel.position.x=mode===1?-.035:0;secondBarrel.visible=mode===1;secondBarrel.position.copy(barrel.position);secondBarrel.position.x=.035;secondBarrel.scale.copy(barrel.scale);scope.visible=mode===2;
}
const cards=[];
for(let i=0;i<5;i++){const [card,c,texture]=panel(1,.7),model=i<3?gun.clone():towerForms[i-3].clone();card.userData.item=i;card.add(model);if(i<3){shapeGun(shapeParts.map(j=>model.children[j]),i);model.rotation.y=-1.1;model.scale.setScalar(.65);model.position.set(0,.14,.16);}else{model.scale.setScalar(.11);model.position.set(0,.01,.12);}cards.push({card,c,texture,model});}
function updateCards(){const xr=renderer.xr.isPresenting,w=Math.min(.38,camera.aspect*.5);for(let i=0;i<5;i++){const {card}=cards[i],side=i<3?1:-1,row=i<3?i:i-3;card.visible=!!active;card.layers.mask=active?1:0;if(xr){scene.add(card);card.position.set(side*3.2,3.1-row*.9,2);card.rotation.set(0,-side*.6,0);card.scale.setScalar(1.15);}else{camera.add(card);card.position.set(side*(.927*camera.aspect-w*.55),.43-row*w*.78,-1.4);card.rotation.set(0,0,0);card.scale.setScalar(w);}}}

const [towerMenu,towerContext,towerTexture]=panel(2,1);let selectedPad=-1,celebrate=0;
function drawPanel(c,title,lines){c.fillStyle='#120d28';c.fillRect(0,0,512,256);c.textAlign='center';c.font='bold 32px sans-serif';c.fillStyle='#8af0dd';c.fillText(title,256,40);c.font='28px sans-serif';lines.forEach((line,i)=>{c.fillStyle='#292b48';c.fillRect(8,60+i*60,496,54);c.fillStyle='#fff';c.fillText(line,256,95+i*60);});}
for(const p of pads){const hit=part(p,trim,1.4,2,1.4,0,1,0);hit.visible=false;hit.userData=p.userData;}
const wrist=new T.Mesh(new T.PlaneGeometry(.20,.08),board.material);wrist.position.set(-.16,.10,-.24);wrist.rotation.x=-.25;gun.add(wrist);
const picker=new T.Raycaster(),pickTargets=[...pads,board,towerMenu,...cards.map(v=>v.card)],pickHits=[],screenPoint=new T.Vector2();let picked=-1,hoverX,hoverY;
function aim(){scene.updateMatrixWorld(true);if(renderer.xr.isPresenting&&inputController){emitter.getWorldPosition(rayOrigin);gun.getWorldQuaternion(quaternion);rayDirection.set(0,0,-1).applyQuaternion(quaternion);}else{camera.getWorldPosition(rayOrigin);camera.getWorldDirection(rayDirection);camera.getWorldQuaternion(quaternion);}}
function pick(px,py){aim();if(px!==undefined&&!renderer.xr.isPresenting){screenPoint.set(px/innerWidth*2-1,1-py/innerHeight*2);picker.setFromCamera(screenPoint,camera);}else picker.set(rayOrigin,rayDirection);pickHits.length=0;picker.intersectObjects(pickTargets,true,pickHits);return pickHits.find(h=>h.object.userData.item!==undefined)||pickHits.find(h=>h.object===towerMenu)||pickHits[0];}
function buyPad(i){if(i<0)return;toast(d.build(i,towerType)?(chord(440),'TOWER READY'):d.towers[i]>=3?'MAX LEVEL':'NEED MORE POINTS');}
function buildTower(){buyPad(d.towers.findIndex(v=>!v));}
function interact(px,py){if(!active||holding||weapon.assist)return;const hit=pick(px,py);if(!hit)return;const item=hit.object.userData.item;if(item!==undefined){const m=item<3?item:item-3;if(!d.allowed(m))toast('LOCKED · WAVE '+(m===2?5:3));else if(item<3){if(mode===m&&hit.uv.y<.28&&d.state===0)upgradeGun();else selectGun(m);}else if(d.state===0){towerType=m;toast('SELECT A PAD');}return true;}if(d.state!==0)return;const row=Math.floor((.77-hit.uv.y)/.235);
if(hit.object===board){d.towers.some(v=>v)?nextWave():buildTower();return;}
if(hit.object===towerMenu){if(row===0)buyPad(selectedPad);if(row===2)nextWave();return;}
selectedPad=hit.object.userData.pad;}
function selectGun(next){if(holding||weapon.assist||!d.allowed(next))return;mode=next;weapon.stop();shotClock=0;toast(names[mode]);}function cycleMode(){const next=(mode+1)%3;selectGun(d.allowed(next)?next:0);}
function upgradeGun(){toast(d.upgrade(mode)?(chord(550),'GUN UPGRADED'):!d.towers.some(v=>v)?'BUILD TOWER FIRST':d.gunLevels[mode]>=3?'MAX LEVEL':'NEED MORE POINTS');}
function nextWave(){if(!d.towers.some(v=>v)){toast('BUILD TOWER FIRST');return;}if(holding||weapon.assist||!weapon.primed||!weapon.energy)return;if(celebrate>0)return;if(d.start()){selectedPad=-1;weapon.press(false);chord(330);}}
function updatePlayer(dt){let mx=(keys.d?1:0)-(keys.a?1:0)+moveX,my=(keys.w?1:0)-(keys.s?1:0)+moveY;
 if(renderer.xr.isPresenting){let left,right;for(const c of controllers)if(c.visible&&c.userData.source)(c.userData.source.handedness==='left'?left=c:right=c);
 const axis=(c,n)=>c?.userData.source.gamepad?.axes?.[n+2]??c?.userData.source.gamepad?.axes?.[n]??0,turn=axis(right||left,0);
 if(Math.abs(turn)<.3)turnLatch=0;if(Math.abs(turn)>.7&&!turnLatch){camera.getWorldPosition(point);rig.rotation.y-=Math.sign(turn)*Math.PI/6;rig.updateMatrixWorld(true);camera.getWorldPosition(muzzle);rig.position.add(point.sub(muzzle));turnLatch=1;}
 camera.getWorldDirection(point);aimYaw=Math.atan2(-point.x,-point.z);mx=left&&right?axis(left,0):0;my=-axis(left||right,1);mx=Math.abs(mx)<.18?0:mx;my=Math.abs(my)<.18?0:my;
 }else{rig.rotation.y=aimYaw;camera.rotation.x=aimPitch;}
 const speed=2.6/Math.max(1,Math.hypot(mx,my));rig.position.x+=(-Math.sin(aimYaw)*my+Math.cos(aimYaw)*mx)*speed*dt;rig.position.z+=(-Math.cos(aimYaw)*my-Math.sin(aimYaw)*mx)*speed*dt;rig.position.x=Math.max(-9,Math.min(9,rig.position.x));rig.position.z=Math.max(-8,Math.min(10,rig.position.z));}

onkeydown=e=>{const k=e.key.toLowerCase();if(active&&(k===' '||k==='enter'))e.preventDefault();keys[k]=1;if(e.repeat)return;if(k==='r')assistReload();if(k==='h')swapHand();if(k==='q')cycleMode();if(k==='u')upgradeGun();if(k==='e')interact();if(e.code==='Enter')nextWave();if(e.code==='Space'){if(d.state===0)interact();else weapon.press(true);}};
onkeyup=e=>{keys[e.key.toLowerCase()]=0;if(e.code==='Space')weapon.press(false);};
function assistReload(){if(active&&!renderer.xr.isPresenting&&!holding&&weapon.reload())clickMechanism(1100);}
const pointers=new Map();canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);const left=e.pointerType==='touch'&&e.clientX<innerWidth*.42;if([...pointers.values()].some(p=>p.left===left))return;if(!left&&d.state===1&&pick(e.clientX,e.clientY)?.object.userData.item!==undefined){interact(e.clientX,e.clientY);return;}pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,left,moved:0});if(!left&&d.state===1)weapon.press(true);};
canvas.onpointermove=e=>{hoverX=e.clientX;hoverY=e.clientY;const p=pointers.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.moved+=Math.abs(dx)+Math.abs(dy);if(p.left){moveX=Math.max(-1,Math.min(1,dx/55));moveY=Math.max(-1,Math.min(1,-dy/55));}else{aimYaw-=dx*.004;aimPitch=Math.max(-.8,Math.min(.7,aimPitch-dy*.004));p.x=e.clientX;p.y=e.clientY;}};
function pointerUp(e){const p=pointers.get(e.pointerId);if(!p)return;if(p.left)moveX=moveY=0;else weapon.press(false);if(e.type==='pointerup'&&p.moved<10&&d.state===0)interact(e.clientX,e.clientY);pointers.delete(e.pointerId);}canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=pointerUp;
onblur=()=>{interruptWeapon();moveX=moveY=0;for(const k in keys)keys[k]=0;pointers.clear();};onresize=()=>{onblur();camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);};

function updateBeam(dt,time){shotClock=Math.max(0,shotClock-dt);flash=Math.max(0,flash-dt);const before=weapon.primed&&!weapon.assist;
 const demand=d.state!==1?0:shotClock?0:mode===0?1:mode===1?1.5:2.4;
 const emitted=active?weapon.step(dt,demand):0;if(!before&&weapon.primed&&!weapon.assist){clickMechanism(880);toast(!weapon.energy?'EMPTY MAGAZINE':weapon.trigger?'RELEASE TRIGGER':'READY');}firing=emitted>0;
 if(firing){aim();let best=-1,distance=36;const damage=1+(d.gunLevels[mode]-1)*.35;
  for(let i=0;i<d.high;i++)if(flags[i]&ACTIVE&&!(flags[i]&GOOD)){point.set(x[i],y[i]+1.25,z[i]).sub(rayOrigin);const along=point.dot(rayDirection),radius=flags[i]&BOSS?1.2:.75,off=point.addScaledVector(rayDirection,-along).lengthSq();
   if(mode===1){if(along>0&&along<10&&off<(radius+along*.2)**2)d.hit(i,.85*damage*(emitted/1.5)*(1-along*.035));}
   else if(along>0&&along<distance&&off<radius*radius){best=i;distance=along;}}
  if(mode!==1&&best>=0)d.hit(best,(mode===2?2.7*emitted/2.4:emitted*.65)*damage);
  lock=best>=0||mode===1?1:0;beamEnd.copy(rayOrigin).addScaledVector(rayDirection,mode===1?9:distance);if(best>=0)beamEnd.set(x[best],y[best]+1.25,z[best]);
  shotClock=mode===0?.18:mode===1?.7:1.2;flash=mode===0?.14:.1;kick=mode===1?.055:.035;tone([520,180,980][mode],.065,[.12,.22,.28][mode],.12,0,"sawtooth");tone(1600,.02,.025,.1,0,"square");twinkle(.5);if(mode===0)weapon.stop();}
 const buildAim=active&&d.state===0&&renderer.xr.isPresenting;if(buildAim){const hit=pick();beamEnd.copy(rayOrigin).addScaledVector(rayDirection,12);if(hit)beamEnd.copy(hit.point);}beamMesh.count=buildAim?1:6;beamMesh.visible=!!(firing||flash||buildAim);if(beamMesh.visible){emitter.getWorldPosition(muzzle);beamRight.set(1,0,0).applyQuaternion(quaternion);
  for(let i=0;i<beamMesh.count;i++){const spread=buildAim?0:(i-2.5)*(mode===1?.45:.04);beamMid.copy(muzzle).addScaledVector(beamRight,mode===1&&!buildAim?(i%2?.035:-.035):spread);point.copy(beamEnd).addScaledVector(beamRight,spread).sub(beamMid);const length=point.length();worldDummy.position.copy(beamMid).addScaledVector(point,.5);worldDummy.quaternion.setFromUnitVectors(up,point.normalize());worldDummy.scale.set(buildAim?.3:mode===2?.6:1,length,1);worldDummy.updateMatrix();beamMesh.setMatrixAt(i,worldDummy.matrix);}beamMesh.instanceMatrix.needsUpdate=true;}
 }
function updateTowers(time){let lines=0;for(let i=0;i<6;i++){const level=d.towers[i],model=towerModels[i],shot=d.towerFlash[i];if(shot>(model.userData.shot||0))tone(d.towerType[i]?660:330,.012,.08,.5);model.userData.shot=shot;pads[i].material.emissive.setHex(i===selectedPad?0x227766:0x18343a);pads[i].children[0].layers.mask=level?1:0;model.visible=!!level||d.state===0&&selectedPad===i;if(!model.visible)continue;
 model.scale.setScalar(level?1+(level-1)*.16:.8);model.children.forEach((m,j)=>{m.visible=j===(level?d.towerType[i]:towerType);m.children[1].rotation.y=time*.5;});if(!level)continue;
 const target=d.towerTarget[i];if(d.towerFlash[i]&&target>=0){const k=lines++*6,c=paletteColors[d.towerType[i]?4:0];towerPositions.set([PAD_X[i],1.4,PAD_Z[i],x[target],y[target]+1.25,z[target]],k);for(let j=0;j<2;j++){towerColors[k+j*3]=c.r;towerColors[k+j*3+1]=c.g;towerColors[k+j*3+2]=c.b;}}}
 towerLines.setDrawRange(0,lines*2);towerLines.attributes.position.needsUpdate=towerLines.attributes.color.needsUpdate=true;}
let audioContext;
function unlockAudio(){const A=window.AudioContext||window.webkitAudioContext;if(!audioContext&&A)audioContext=new A;audioContext?.resume().catch(()=>{});}
function tone(f,v,d,bend=1,delay=0,type="triangle"){if(!audioContext)return;const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),now=audioContext.currentTime+delay;oscillator.type=type;oscillator.frequency.setValueAtTime(f,now);oscillator.frequency.exponentialRampToValueAtTime(f*bend,now+d);gain.gain.setValueAtTime(.001,now);gain.gain.linearRampToValueAtTime(v,now+.003);gain.gain.exponentialRampToValueAtTime(.001,now+d);oscillator.connect(gain).connect(audioContext.destination);oscillator.start(now);oscillator.stop(now+d);oscillator.onended=()=>{gain.disconnect();};}
function chord(f=660){tone(f,.025,.16);tone(f*1.5,.018,.25,1,.07);}

const cover=document.querySelector('#c'),vrButton=document.querySelector('#v'),toastNode=document.querySelector('#t'),startNode=document.querySelector('#s');let toastTimer,uiClock=0;
function toast(message){toastNode.textContent=message;toastNode.style.opacity=1;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastNode.style.opacity=0,2200);}
function start(){active=1;cover.style.display='none';unlockAudio();vrButton.hidden=false;}
function resetRun(){toastNode.style.opacity=0;interruptWeapon();discard.visible=false;weapon=createWeapon();d.reset();sparkLife.fill(0);selectedPad=-1;celebrate=0;mode=towerType=shotClock=flash=kick=over=aimYaw=aimPitch=moveX=moveY=uiClock=0;rig.position.set(0,0,7);rig.rotation.set(0,0,0);camera.rotation.set(0,0,0);for(const k in keys)keys[k]=0;pointers.clear();start();}
function endRun(){if(over)return;over=1;active=0;interruptWeapon();if(d.state!==3)tone(220,.05,.8,.2);renderer.xr.getSession()?.end();cover.style.display='grid';cover.querySelector('h1').innerHTML=d.state===3?'RAINBOW<br>DEFENDED':'CRYSTAL<br>LOST';cover.querySelector('p').textContent='Wave '+d.wave+' · '+d.score+' points';startNode.textContent='NEW DEFENSE';}
startNode.onclick=()=>resetRun();
vrButton.hidden=false;document.body.append(vrButton);vrButton.onclick=async()=>{vrButton.disabled=true;try{const session=await navigator.xr.requestSession('immersive-vr',{requiredFeatures:['local-floor'],optionalFeatures:['dom-overlay'],domOverlay:{root:document.body}});over?resetRun():start();await renderer.xr.setSession(session);vrButton.hidden=true;}catch(error){toast('VR '+(error.name||'UNAVAILABLE'));}vrButton.disabled=false;};
document.querySelector('#reload').onclick=assistReload;document.querySelector('#next').onclick=nextWave;document.querySelector('#build').onclick=buildTower;
function padText(){return selectedPad<0?d.towers.some(v=>v)?'AIM AT A TOWER':'BUILD TOWER FIRST':'USE TOWER MENU';}
function reloadHint(){return weapon.assist?'RELOADING '+Math.min(99,Math.floor(weapon.assist*100))+'%':!renderer.xr.isPresenting?'R / RELOAD':!weapon.seated?holding?'INSERT + RELEASE':'GRIP HIP MAGAZINE':!weapon.primed?'CHAMBERING…':!weapon.energy?'DROP EMPTY MAGAZINE':nearPart===3?'GRIP: TAKE GUN':'GRIP MAGAZINE';}
function updateUI(dt){if((uiClock-=dt)>0)return;uiClock=.12;const ammo=Math.ceil(weapon.energy/12*100)+'%',building=d.state===0,owned=d.towers.some(v=>v),healthLabel='CRYSTAL '+d.health+'/20',phaseLabel=celebrate?'WAVE '+d.cleared+' COMPLETE!':building?owned?'PREPARE · WAVE '+(d.wave+1):'BUILD YOUR FIRST TOWER':'DEFEND · WAVE '+d.wave+'/6';
 document.querySelector('#phase').textContent=phaseLabel;document.querySelector('#score').textContent='POINTS '+d.credits;document.querySelector('#counters').textContent=healthLabel;
 const build=document.querySelector('#build'),next=document.querySelector('#next'),reload=document.querySelector('#reload');build.textContent='⛏ BUILD '+(towerType?'SLOW 55':'PRISM 35');build.hidden=!building;build.disabled=d.credits<(towerType?55:35)||d.towers.every(v=>v);next.textContent='START WAVE '+(d.wave+1);next.hidden=!building||!owned;next.disabled=celebrate>0||!weapon.primed||!weapon.energy||!!weapon.assist;reload.hidden=renderer.xr.isPresenting;reload.textContent=weapon.assist?reloadHint():'AMMO '+ammo+' · RELOAD';document.querySelector('#m').textContent=building?'SELECT TOWER · PAD · BUILD':(mode?'FIRE':'TAP TO FIRE')+' · '+reloadHint();
 drawPanel(boardContext,phaseLabel,[celebrate?'+'+(20+d.wave*3)+' BONUS POINTS':building?'POINTS '+d.credits:healthLabel,d.cleared===2?'SHOTGUN + SLOW UNLOCKED':d.cleared===4?'SNIPER UNLOCKED':building?owned?'START WAVE':'BUILD FIRST TOWER':'AMMO '+ammo,toastNode.style.opacity>0?toastNode.textContent:reloadHint()]);boardTexture.needsUpdate=true;
 for(let i=0;i<5;i++){const {c,texture}=cards[i],m=i<3?i:i-3,unlocked=d.allowed(m),chosen=i<3?mode===m:towerType===m;c.fillStyle=chosen&&unlocked?'#70efd3':'#443359';c.fillRect(0,0,512,256);c.fillStyle='#120d28';c.fillRect(5,5,502,246);c.textAlign='center';c.font='bold 56px sans-serif';c.fillStyle=unlocked?'#fff':'#aa93bf';c.fillText(i<3?names[m]:m?'SLOW':'PRISM',256,182);c.font='45px sans-serif';c.fillText(!unlocked?'🔒 LOCKED · WAVE '+(m===2?5:3):i<3?'LV'+d.gunLevels[m]+' · '+(chosen?building&&owned&&d.gunLevels[m]<3?'UPGRADE '+(30+d.gunLevels[m]*25):'EQUIPPED':'EQUIP'):(m?55:35)+' · '+(chosen?'SELECTED':'SELECT'),256,233);texture.needsUpdate=true;}
 if(selectedPad>=0){const i=selectedPad,level=d.towers[i];drawPanel(towerContext,(level?(d.towerType[i]?'SLOW':'PRISM')+' LV'+level:'BUILD '+(towerType?'SLOW':'PRISM'))+' · '+d.credits+' POINTS',[level===3?'MAX LEVEL':(level?'UPGRADE ':'BUILD ')+(level?d.price(i):towerType?55:35),level?'DAMAGE + RANGE':'SELECT TOWER ON LEFT',owned?'START WAVE':'BUILD FIRST TOWER']);towerTexture.needsUpdate=true;}
}



let last=0;
renderer.setAnimationLoop(milliseconds=>{const time=milliseconds*.001,dt=Math.min(.033,last?time-last:.016);last=time;
 if(active){updatePlayer(dt);const before=d.cleared,health=d.health;d.update(dt);if(d.health<health){toast('CRYSTAL HIT · STOP THE HERD');tone(160,.06,.3,.3,0,"sawtooth");twinkle(.8);}if(d.cleared!==before){celebrate=3;toast('WAVE '+d.cleared+' COMPLETE!');for(let i=0;i<6;i++){burst(i);tone((d.cleared===6?660:440)*[1,1.25,1.5,2,2.5,3][i],.035,.45,1,i*.08);}twinkle(.8);weapon.press(false);}celebrate=Math.max(0,celebrate-dt);if(d.state>1&&!celebrate)endRun();}
 updateWeapon(dt,time);updateBeam(dt,time);if(d.events.length)chord();for(const i of d.events){burst(i);twinkle(.3);}d.events.length=0;updateSparks(dt);updateTowers(time);species.sync(time);
 board.visible=active&&renderer.xr.isPresenting&&(d.state===0&&selectedPad<0||celebrate>0);board.layers.mask=board.visible?1:0;wrist.visible=renderer.xr.isPresenting;
 updateCards();
 const selected=active&&!celebrate&&d.state===0?pick(hoverX,hoverY):null;picked=selected?.object.userData.pad??-1;if(picked>=0)selectedPad=picked;
 towerMenu.visible=active&&d.state===0&&selectedPad>=0;towerMenu.layers.mask=towerMenu.visible?1:0;if(towerMenu.visible){towerMenu.position.set(PAD_X[selectedPad],2.5,PAD_Z[selectedPad]);camera.getWorldPosition(point);towerMenu.lookAt(point);towerMenu.scale.setScalar(point.distanceTo(towerMenu.position)/4);}

 core.rotation.y=time*.4;
 updateUI(dt);renderer.render(scene,camera);});
}
