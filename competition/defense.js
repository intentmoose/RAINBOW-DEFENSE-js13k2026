// Fixed pools and a renderer-independent economy. No scene objects are allocated
// when a wave spawns, an enemy dissolves, or a tower upgrades.
export const CAPACITY=40, ACTIVE=1, GOOD=2, WING=16, BOSS=32;
export const PAD_X=[-4,0,4,-4,0,4], PAD_Z=[-3,-5,-3,3,1,3];
export function createDefense(){
 const d={flags:new Uint8Array(CAPACITY),
  towers:new Uint8Array(6),towerType:new Uint8Array(6),gunLevels:new Uint8Array([1,1,1]),
  wave:0,cleared:0,credits:70,health:20,score:0,high:0,queued:0,timer:0,state:0,events:[],
  towerTarget:new Int8Array(6).fill(-1)};
 d.x=new Float32Array(CAPACITY);d.y=new Float32Array(CAPACITY);d.z=new Float32Array(CAPACITY);d.vz=new Float32Array(CAPACITY);d.yaw=new Float32Array(CAPACITY);d.corruption=new Float32Array(CAPACITY);d.phase=new Float32Array(CAPACITY);d.action=new Float32Array(CAPACITY);d.scale=new Float32Array(CAPACITY);d.hp=new Float32Array(CAPACITY);d.max=new Float32Array(CAPACITY);d.slow=new Float32Array(CAPACITY);d.fade=new Float32Array(CAPACITY);
 d.towerClock=new Float32Array(6);d.towerFlash=new Float32Array(6);
 d.reset=()=>{d.flags.fill(0);d.towers.fill(0);d.towerType.fill(0);d.gunLevels.fill(1);d.towerClock.fill(0);d.towerFlash.fill(0);d.towerTarget.fill(-1);d.wave=d.cleared=d.score=d.high=d.queued=d.timer=0;d.credits=70;d.health=20;d.state=0;d.events.length=0;};
 d.allowed=mode=>mode>=0&&mode<3&&mode<=(d.cleared>=4?2:d.cleared>=2?1:0);
 d.price=i=>d.towers[i]?25+d.towers[i]*25:d.towerType[i]?55:35;
 d.build=(i,type=0)=>{if(d.state!==0||i<0||i>=6||type<0||type>1||type===1&&d.cleared<2||d.towers[i]>=3)return false;
  const cost=d.towers[i]?25+d.towers[i]*25:type?55:35;if(d.credits<cost)return false;
  d.credits-=cost;if(!d.towers[i])d.towerType[i]=type;d.towers[i]++;return true;};
 d.upgrade=mode=>{const cost=30+d.gunLevels[mode]*25;if(d.state!==0||!d.towers.some(v=>v)||!d.allowed(mode)||d.gunLevels[mode]>=3||d.credits<cost)return false;d.credits-=cost;d.gunLevels[mode]++;return true;};
 d.start=()=>{if(d.state!==0)return false;d.wave++;d.queued=Math.min(40,3+d.wave*3);d.timer=0;d.state=1;return true;};
 d.spawn=()=>{let i=0;while(i<CAPACITY&&d.flags[i])i++;if(i===CAPACITY)return -1;
  const boss=d.wave%6===0&&d.queued===1,kind=boss?3:d.wave<3?0:d.queued%4;
  d.flags[i]=ACTIVE|(kind<<2)|(kind===3?WING:0)|(boss?BOSS:0);
  d.x[i]=d.wave<3?(d.queued%3-1)*.8:(d.queued%3-1)*4;d.z[i]=d.wave===1?-11:-18;
  d.y[i]=kind===3?1:0;d.yaw[i]=-Math.PI/2;d.vz[i]=.65+d.wave*.055+(kind===1?.45:0);
  d.max[i]=d.hp[i]=boss?8+d.wave*.25:(.9+d.wave*.25)*(kind===2?1.65:kind===1?.75:1);
  d.corruption[i]=1;d.slow[i]=d.fade[i]=d.action[i]=0;d.phase[i]=i*.7;d.scale[i]=boss?.8:.43;
  d.high=Math.max(d.high,i+1);return i;};
 d.hit=(i,damage)=>{if(i<0||!(d.flags[i]&ACTIVE)||d.flags[i]&GOOD||damage<=0)return false;
  d.hp[i]=Math.max(0,d.hp[i]-damage);d.corruption[i]=d.hp[i]/d.max[i];d.action[i]=.3;
  if(d.hp[i])return false;d.flags[i]|=GOOD;d.corruption[i]=0;d.fade[i]=.55;
  const reward=d.flags[i]&BOSS?60:10+((d.flags[i]>>2)&3)*3;d.credits+=reward;d.score+=reward*10;d.events.push(i);return true;};
 d.update=dt=>{
  for(let i=0;i<d.high;i++)if(d.flags[i]&GOOD){d.fade[i]-=dt;d.scale[i]*=Math.max(0,1-dt*4);d.y[i]+=dt*.6;if(d.fade[i]<=0)d.flags[i]=0;}
  for(let t=0;t<6;t++)d.towerFlash[t]=Math.max(0,d.towerFlash[t]-dt);
  if(d.state!==1)return;
  d.timer-=dt;if(d.queued&&d.timer<=0&&d.spawn()>=0){d.queued--;d.timer=Math.max(.32,1.5-d.wave*.08);}
  let living=0;
  for(let i=0;i<d.high;i++)if(d.flags[i]&ACTIVE&&!(d.flags[i]&GOOD)){
   d.slow[i]=Math.max(0,d.slow[i]-dt);d.action[i]=Math.max(0,d.action[i]-dt);const speed=d.vz[i]*(d.slow[i]>0?.45:1);d.phase[i]+=speed*dt*7;d.y[i]=d.flags[i]&WING?1+Math.sin(d.phase[i]*.4)*.12:0;d.yaw[i]=Math.atan2(-speed,-d.x[i]*.025);d.z[i]+=speed*dt;
   d.x[i]*=Math.max(0,1-dt*.025);if(d.z[i]>7.5){d.health-=d.flags[i]&BOSS?5:1;d.flags[i]=0;}else living++;
  }
  if(d.health<=0){d.health=0;d.state=2;return;}
  for(let t=0;t<6;t++)if(d.towers[t]){
   d.towerClock[t]-=dt;let target=-1,front=-99,range=5.2+d.towers[t]*.6;
   for(let i=0;i<d.high;i++)if(d.flags[i]&ACTIVE&&!(d.flags[i]&GOOD)){
    const dx=d.x[i]-PAD_X[t],dz=d.z[i]-PAD_Z[t];if(dx*dx+dz*dz<range*range&&d.z[i]>front){target=i;front=d.z[i];}}
   if(target>=0&&d.towerClock[t]<=0){d.towerTarget[t]=target;d.towerFlash[t]=.15;d.towerClock[t]=d.towerType[t]?.65:.55;
    d.hit(target,(d.towerType[t]?.035:.08)*(1+(d.towers[t]-1)*.55));if(d.towerType[t])d.slow[target]=1.8;}
  }
  if(!d.queued&&!living){d.cleared=d.wave;d.credits+=20+d.wave*3;d.state=d.wave>=6?3:0;}
 };
 return d;
}
