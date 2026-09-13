// These allowlists are enforced by tests/build-optimization.test.mjs. In particular,
// stop is NOT private: AudioScheduledSourceNode.stop must retain its API name.
export const weaponProperties = /^(energy|seated|primed|grab|travel|full|trigger|blocked|assist|press|remove|seat|charge|pull|release|cancel|reload|step)$/;
export const defenseProperties=/^(towers|towerType|gunLevels|towerTarget|towerClock|towerFlash|cleared|credits|queued|endless|allowed|price|build|upgrade|spawn|hit|health|wave|high|timer|state|events|reset|vz|yaw|corruption|phase|action|hp|slow|fade|flags|score)$/;
export const inputProperties=/^(pad|squeezed|source|xrReload|xrMode)$/;
export const geometryProperties=/^(neck|ear|eye|horn|mane|frontLeg|rearLeg|tail|wing)$/;
export const privateProperties=new RegExp(weaponProperties.source.slice(0,-2)+'|'+defenseProperties.source.slice(2,-2)+'|'+inputProperties.source.slice(2,-2)+'|'+geometryProperties.source.slice(2));
// A fixed alphabet compresses better than frequency-ranked names in this payload.
const identifiers={get(n){let s='';do{s+='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$_'[n%54];n=Math.floor(n/54)-1;}while(n>=0);return s;}};
export const gameMinifyOptions = {
  module: true,
  format: { ascii_only: true },
  compress: { passes: 3, pure_funcs: ['Object.freeze'] },
  mangle: { nth_identifier: identifiers, properties: { builtins: true, regex: privateProperties } }
};
