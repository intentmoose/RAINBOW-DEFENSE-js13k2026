// Reuse the pinned A-Frame component's default loader, model orientation and poses.
// This small entity adapter shares our existing renderer and XR grip spaces.
export function createEngineHand(T,index){
 const hand=Object.create(AFRAME.components['hand-controls'].Component.prototype),root=new T.Group();
 hand.el={object3D:root,sceneEl:{hasWebXR:true},addEventListener(){},setAttribute(){},
  getObject3D:()=>root.children[0],
  setObject3D(name,mesh){root.add(mesh);hand.onControllerConnected();}};
 hand.data={hand:index?'right':'left',handModelStyle:'lowPoly'};
 hand.init();hand.update();return hand;
}
