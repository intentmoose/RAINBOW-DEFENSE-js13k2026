import {Packer} from 'roadroller';
import vm from 'node:vm';

// Fixed, measured parameters make every release deterministic. Text mode preserves
// the minified program byte-for-byte; strict mode preserves module semantics.
export const packingOptions=Object.freeze({"modelRecipBaseCount":17,"sparseSelectors":[0,1,2,3,7,12,13,21,42,50,57,177,204,263,265,346,4,5,6,8],"precision":15,"recipLearningRate":1800,"modelMaxCount":4,"numAbbreviations":0,"dynamicModels":0,"maxMemoryMB":128,"allowFreeVars":false});
export function decodeGame(packed){
 let source,calls=0;
 vm.runInNewContext(packed,{TextDecoder,eval:value=>{source=value;calls++;}},{timeout:10000});
 if(calls!==1||typeof source!=='string')throw Error('Unexpected game decoder');
 return source;
}
export async function packGame(minified){
 const source='"use strict";'+minified;
 const packer=new Packer([{data:source,type:'text',action:'eval'}],packingOptions);
 // Skip optimize entirely: its API treats level 0 as level 1 and retunes randomly.
 const {firstLine,secondLine}=packer.makeDecoder();
 const game=(firstLine+secondLine).replace(/<\/script/gi,'<\\/script');
 if(decodeGame(game)!==source)throw Error('Packed game did not round-trip exactly');
 return {game,source,modelMemoryMB:packer.memoryUsageMB};
}
