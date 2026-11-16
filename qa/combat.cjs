const assert=require('assert'),{sandbox}=require('./harness.cjs');
const plain=sandbox(),rules=plain.s.DeckCombat;
for(let gun=0;gun<3;gun++){const p=rules.profiles[gun];assert.equal(rules.damage(gun,0),p.base);assert.equal(rules.damage(gun,p.start),p.base);assert.equal(rules.damage(gun,10000),Math.round(p.base*p.min));let last=Infinity;for(let d=0;d<=150;d++){const value=rules.damage(gun,d);assert(value<=last);last=value}assert(rules.damage(gun,30,true)>rules.damage(gun,30,false))}
for(const backend of ['game.js','fallback.js']){
 const env=sandbox(backend==='game.js'),{s,els}=env;env.load(backend);els.start.click();const qa=s.__qa,p=qa.player,target=qa.actors.find(a=>a.team===1);
 for(const a of qa.actors)if(a!==p&&a!==target)a.dead=100;
 const oldRandom=s.Math.random;s.Math.random=()=>.5;
 function shoot(distance){Object.assign(p,{x:4,z:3,y:0,yaw:0,pitch:0,gun:0,cd:0,reloading:0});Object.assign(target,{x:4+distance,z:3,hp:100,dead:0});qa.fire(p);return 100-target.hp}
 const near=shoot(10),far=shoot(60);s.Math.random=oldRandom;assert.equal(near,34);assert(far<near);assert(target.hitFlash>0);
 // The B panel pauses the clock, can select a pack, and preserves each magazine.
 p.ammo=[7,9,2];const before=qa.seconds;for(const f of env.listeners.keydown)f({key:'b',repeat:false,preventDefault(){}});assert.equal(qa.mode,'backpack');qa.update(.5,.5);assert.equal(qa.seconds,before);assert.equal(els.backpack.hidden,false);for(const f of env.listeners.keydown)f({key:'3',repeat:false,preventDefault(){}});assert.equal(qa.mode,'playing');assert.equal(p.gun,2);assert.deepEqual(Array.from(p.ammo),[7,9,2]);
 els.backpackBtn.click();assert.equal(qa.mode,'backpack');els.bag1.click();assert.equal(p.gun,1);assert.equal(qa.mode,'playing');assert.equal(els.backpack.hidden,true);
 // High kill totals must not end a fixed-duration match early.
 for(let i=0;i<45;i++){Object.assign(target,{dead:0,hp:1});qa.hurt(target,1,p)}assert.equal(qa.mode,'playing');
 qa.update(.01,119.75);assert.equal(qa.mode,'playing');assert.equal(els.clock.textContent,'00:01');qa.update(.01,.25);assert.equal(qa.mode,'ended');assert.equal(els.clock.textContent,'00:00');assert.equal(qa.seconds,120);assert.equal(s.DeckApp.profile.games,1);
 console.log(backend+': real hit damage falls with range; hit flash; B/mobile pack selection; magazines preserved; backpack clock pause; fixed 120s ending passed.');
}
console.log('All three falloff curves are monotonic, capped and support headshot damage.');
