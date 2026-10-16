const fs=require('fs'),assert=require('assert'),{sandbox,root}=require('./harness.cjs');
for(const backend of ['game.js','fallback.js']){
 const env=sandbox(backend==='game.js'),{s,els,calls}=env;env.load(backend);els.start.click();assert.equal(s.__qa.actors.length,10);assert.equal(els.menu.hidden,true);assert.equal(els.hud.hidden,false);
 const a=s.__qa.player;s.__qa.jump();assert(a.vy>0);s.__qa.update(.1);assert(a.y>0);for(let i=0;i<30;i++)s.__qa.update(.05);assert.equal(a.y,0);
 const enemy=s.__qa.actors.find(x=>x.team===1);Object.assign(a,{x:4,z:30,y:0,yaw:0,pitch:0,gun:2,cd:0,reloading:0});Object.assign(enemy,{x:8,z:30,hp:100,dead:0});for(const other of s.__qa.actors)if(other!==enemy&&other!==a)other.z=55;
 s.__qa.fire(a);assert.equal(a.kills,1);assert.equal(els.kills.textContent,'1');assert(enemy.dead>0);assert.equal(a.hits,1);assert.equal(a.shots,1);assert(calls.audio>0);
 // A separate shot at eye level must count as a headshot kill.
 Object.assign(enemy,{x:8,z:30,hp:100,dead:0});Object.assign(a,{cd:0,pitch:Math.atan((2.09-1.62)/4)});s.__qa.fire(a);assert.equal(a.headshots,1);
 const block=s.__qa.blocks[0];Object.assign(a,{x:block.x-1,z:block.z+1});const old=a.x;s.__qa.move(a,.4,0);assert.equal(a.x,old,'collision failed');
 Object.assign(a,{x:16,z:31,yaw:0,pitch:0});for(let i=0;i<12;i++)env.frame(i*16.67);
 const still=s.DeckVisuals.soldier({x:0,z:0,yaw:0,team:0,gun:1,motion:0}),walking=s.DeckVisuals.soldier({x:0,z:0,yaw:0,team:0,gun:1,motion:1,walk:1.1});assert.equal(still.length,walking.length);assert.notDeepEqual(still,walking);assert(still.every(Number.isFinite));
 for(let gun=0;gun<3;gun++){const base=s.DeckVisuals.weapon({gun}),shot=s.DeckVisuals.weapon({gun,flash:.07}),reload=s.DeckVisuals.weapon({gun,reloading:1}),paint=s.DeckVisuals.weapon({gun,skin:[.6,.4,.2]});assert(base.length>1000&&base.every(Number.isFinite));assert(shot.length>base.length);assert.notDeepEqual(base,reload);assert.notDeepEqual(base,paint)}
 const y=still.filter((_,i)=>i%6===1);assert(Math.max(...y)<=2.4);assert(Math.min(...y)>=0);
 s.__qa.finish();const credits=s.DeckApp.profile.credits,xp=s.DeckApp.profile.xp;assert.equal(s.DeckApp.profile.games,1);assert.equal(els.end.hidden,false);assert.equal(els.resultRows.children.length,10);assert(credits>0);s.__qa.finish();assert.equal(s.DeckApp.profile.credits,credits);assert.equal(s.DeckApp.profile.xp,xp);assert.equal(els.resultHeadshots.textContent,'1');
 // Changing quality and sensitivity updates persisted settings and the live renderer.
 els.quality.value='low';els.quality.dispatchEvent({type:'input'});assert.equal(s.DeckApp.settings.quality,'low');assert(els.world.width<1280);els.sensitivity.value='1.7';els.sensitivity.dispatchEvent({type:'input'});assert.equal(s.DeckApp.settings.sensitivity,1.7);
 s.__qa.start();s.document.hidden=true;env.listeners['doc:visibilitychange']();assert.equal(s.__qa.mode,'paused');els.quit.click();assert.equal(s.__qa.mode,'menu');assert.equal(s.DeckApp.profile.games,1,'abandoning a match must not give rewards');
 console.log(backend,{guest:true,jump:true,shoot:true,headshot:true,killCounter:true,collision:true,audio:true,settlementOnce:true,tenPlayerResults:true,qualitySettings:true,backgroundPause:true,abandonNoReward:true});
 if(calls.scene)fs.writeFileSync(__dirname+'/geometry.json',JSON.stringify({shaders:calls.shaders,shadows:s.DeckVisuals.cargoShadows(s.__qa.blocks).concat(s.DeckVisuals.actorShadows([{x:23,z:30},{x:25,z:33}])),weapons:[0,1,2].map(gun=>s.DeckVisuals.weapon({gun})),scene:calls.scene,blue:s.DeckVisuals.soldier({x:23,z:30,yaw:Math.PI,team:0,gun:1,motion:.8,walk:.7}),red:s.DeckVisuals.soldier({x:25,z:33,yaw:Math.PI-.35,team:1,gun:0,motion:1,walk:1.9}),front:s.DeckVisuals.soldier({x:0,z:0,yaw:0,team:0,gun:1,motion:0}),side:s.DeckVisuals.soldier({x:0,z:0,yaw:0,team:1,gun:2,motion:1,walk:1.3})}));
}
const env=sandbox(false);env.load('game.js');assert.equal(env.calls.fallback,'fallback.js?v=20261016p3');console.log('WebGL unavailable: automatic Canvas fallback loads.');
const html=fs.readFileSync(root+'index.html','utf8');for(const match of html.matchAll(/(?:src|href)="([^"?#]+)(?:[^"\s]*)"/g)){if(match[1]==='#')continue;assert(fs.existsSync(root+match[1]),'missing asset '+match[1])}const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'duplicate ids');
const app=sandbox();const {s,els}=app;
// Earned-only cosmetics: locked selections cannot consume unavailable points.
els.skinList.children[1].click();assert.equal(s.DeckApp.profile.skin,'service');assert.equal(s.DeckApp.profile.credits,0);
s.DeckApp.begin('Test <name>');s.DeckApp.settle({won:true,kills:40,deaths:4,score:'40 : 20',seconds:240,accuracy:50,headshots:5});const before=s.DeckApp.profile.credits;els.skinList.children[1].click();assert.equal(s.DeckApp.profile.skin,'sand');assert.equal(s.DeckApp.profile.credits,before-250);els.skinList.children[1].click();assert.equal(s.DeckApp.profile.credits,before-250);
const saved=sandbox(true,Object.fromEntries(app.storage));assert.equal(saved.s.DeckApp.profile.skin,'sand');assert.equal(saved.s.DeckApp.profile.name,'Test <name>');assert.equal(saved.s.DeckApp.settings.volume,.55);assert.equal(saved.els.profileName.textContent,'Test <name>');
const invalid=sandbox(true,{'deckfire.profile.v1':'not-json','deckfire.settings.v1':'[]'});assert.equal(invalid.s.DeckApp.profile.games,0);const denied=sandbox(true,{},true);assert.equal(denied.s.DeckApp.storageOK(),false);denied.load('game.js');denied.els.start.click();assert.equal(denied.s.__qa.mode,'playing');
for(const tab of s.document.querySelectorAll('[data-tab]')){tab.click();assert.equal(s.document.querySelectorAll('[data-page]').filter(p=>!p.hidden).length,1)}
console.log('Local saves, invalid/denied storage, settings restore, nickname text safety, earned cosmetics, tab navigation and asset references passed.');
