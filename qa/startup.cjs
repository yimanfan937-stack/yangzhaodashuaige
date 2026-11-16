const assert=require('assert'),{sandbox}=require('./harness.cjs');
for(const failure of ['link','compile','no-webgl']){
 const env=sandbox(failure!=='no-webgl'),{s,els,gl,calls}=env,old=els.world;
 if(failure==='link')gl.getProgramParameter=()=>false;
 if(failure==='compile')gl.getShaderParameter=()=>false;
 assert(els.start.disabled);env.load('game.js');assert.equal(calls.fallback,'fallback.js?v=20261116scope1');assert.notEqual(els.world,old,'2D must receive a fresh canvas');assert(els.start.disabled);env.load('fallback.js');assert.equal(els.start.disabled,false);assert.equal(els.bootStatus.textContent,'兼容模式已就绪');els.start.click();assert.equal(s.__qa.mode,'playing');env.frame(16);assert.equal(els.menu.hidden,true);
 console.log(failure+': auto fallback, fresh canvas and working start passed.');
}
const forced=sandbox(true);forced.s.location.search='?renderer=canvas';forced.load('game.js');assert.equal(forced.calls.fallback,'fallback.js?v=20261116scope1');
const broken=sandbox();broken.listeners.error[0]({target:{tagName:'SCRIPT'}});assert.equal(broken.els.start.disabled,true);assert.match(broken.els.bootStatus.textContent,/兼容模式/);broken.els.compatibility.click();assert.match(broken.calls.navigation,/renderer=canvas/);
const healthy=sandbox();healthy.load('game.js');assert.equal(healthy.els.start.disabled,false);assert.equal(healthy.els.bootStatus.textContent,'3D 模式已就绪');
console.log('Explicit compatibility route, script-failure notice and healthy startup passed.');
