const assert=require('assert'),{sandbox}=require('./harness.cjs');
for(const backend of ['game.js','fallback.js']){
 const env=sandbox(backend==='game.js'),{s,els}=env;env.load(backend);els.start.click();s.document.pointerLockElement=els.world;
 function right(){els.world.dispatchEvent({type:'mousedown',button:2});for(const f of env.listeners.mouseup)f({button:2})}
 right();assert.equal(s.__qa.scoped,true,'releasing right mouse must retain aim');assert.equal(els.scopeBtn.textContent,'收镜');right();assert.equal(s.__qa.scoped,false);assert.equal(els.scopeBtn.textContent,'开镜');
 // Touch and mouse share the same toggle state.
 els.scopeBtn.click();assert(s.__qa.scoped);right();assert(!s.__qa.scoped);right();for(const f of env.listeners.keydown)f({key:'3'});assert(!s.__qa.scoped);assert.equal(els.scopeBtn.textContent,'开镜');
 right();els.pauseBtn.click();assert(!s.__qa.scoped);els.resume.click();right();const opponent=s.__qa.actors.find(a=>a.team===1);s.__qa.hurt(s.__qa.player,100,opponent);assert(!s.__qa.scoped);right();assert(!s.__qa.scoped,'dead players cannot open sights');
 console.log(backend+': single-click aim toggle, release persistence, touch/mouse consistency and reset on switch/pause/death passed.');
}
