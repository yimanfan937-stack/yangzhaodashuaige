/* Original guest experience and local-only progression. No accounts or payments. */
(()=>{'use strict';
const $=id=>document.getElementById(id),STORE='deckfire.profile.v1',SETTING='deckfire.settings.v1';
const defaults={volume:.55,sensitivity:1,quality:matchMedia('(pointer: coarse)').matches?'low':'standard',crosshair:'#d4f3df',difficulty:'normal',weapon:1,length:40,fov:78};
const skins=[{id:'service',name:'制式石墨',cost:0,color:'#6e7e80',rgb:null},{id:'sand',name:'沙漠远征',cost:250,color:'#b39a68',rgb:[.48,.39,.24]},{id:'ice',name:'极地巡航',cost:500,color:'#a3bdc8',rgb:[.48,.60,.64]},{id:'copper',name:'赤铜锋线',cost:900,color:'#bd7453',rgb:[.57,.28,.17]}];
function read(k){try{const v=JSON.parse(localStorage.getItem(k)||'null');return v&&typeof v==='object'?v:{}}catch{return {}}}
const finite=(v,d,min=0,max=1e8)=>Number.isFinite(Number(v))?Math.min(max,Math.max(min,Number(v))):d;
const saved=read(STORE),raw=read(SETTING);
const profile={name:typeof saved.name==='string'?saved.name.slice(0,16):'',xp:finite(saved.xp,0),credits:finite(saved.credits,0),games:finite(saved.games,0),wins:finite(saved.wins,0),kills:finite(saved.kills,0),deaths:finite(saved.deaths,0),best:finite(saved.best,0),unlocked:Array.isArray(saved.unlocked)?saved.unlocked.filter(k=>skins.some(s=>s.id===k)):['service'],skin:saved.skin||'service',history:Array.isArray(saved.history)?saved.history.filter(h=>h&&typeof h==='object').slice(0,5).map(h=>({win:!!h.win,kills:finite(h.kills,0),deaths:finite(h.deaths,0),score:typeof h.score==='string'?h.score.slice(0,40):'',date:finite(h.date,0)})):[]};
if(!profile.unlocked.includes('service'))profile.unlocked.push('service');if(!profile.unlocked.includes(profile.skin))profile.skin='service';
const settings={...defaults,volume:finite(raw.volume,defaults.volume,0,1),sensitivity:finite(raw.sensitivity,1,.3,2.5),quality:['low','standard','high'].includes(raw.quality)?raw.quality:matchMedia('(pointer: coarse)').matches?'low':'standard',crosshair:['#d4f3df','#ffd68a','#80d4ff'].includes(raw.crosshair)?raw.crosshair:defaults.crosshair,difficulty:['rookie','normal','veteran'].includes(raw.difficulty)?raw.difficulty:'normal',weapon:finite(raw.weapon,1,0,2)|0,length:[20,40,60].includes(raw.length)?raw.length:40,fov:finite(raw.fov,78,65,95)};
let storageOK=true,activeMatch=null,audio=null,noiseBuffer=null,lastBotShot=0,lastStep=0;
function persist(){try{localStorage.setItem(STORE,JSON.stringify(profile));localStorage.setItem(SETTING,JSON.stringify(settings));storageOK=true}catch{storageOK=false}if($('saveStatus'))$('saveStatus').textContent=storageOK?'进度保存在当前浏览器':'当前浏览器无法保存，进度仅在本次有效'}
function toast(text){const el=$('toast');if(!el)return;el.textContent=text;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.hidden=true,2600)}
function level(){return Math.floor(Math.sqrt(profile.xp/180))+1}
function stat(id,n){if($(id))$(id).textContent=String(n)}
function sync(){
 stat('profileName',profile.name||'游客');stat('profileLevel','LV.'+level());stat('credits',profile.credits);stat('careerMatches',profile.games);stat('careerKills',profile.kills);stat('careerKD',(profile.kills/Math.max(1,profile.deaths)).toFixed(2));stat('careerWins',profile.games?Math.round(profile.wins/profile.games*100)+'%':'—');
 if($('xpFill')){let l=level()-1;const pct=(profile.xp-l*l*180)/((l+1)*(l+1)*180-l*l*180)*100;$('xpFill').style.width=pct+'%'}
 stat('xpLabel',profile.xp+' XP');
 if($('history')){$('history').replaceChildren();if(!profile.history.length){const p=document.createElement('p');p.className='muted';p.textContent='完成第一场比赛，开始记录你的战绩。';$('history').append(p)}for(const h of profile.history){const row=document.createElement('div');row.className='history-row';const a=document.createElement('b'),b=document.createElement('span');a.textContent=h.win?'胜利':'落败';a.className=h.win?'blue':'muted';b.textContent=`${h.kills|0} 击杀 / ${h.deaths|0} 阵亡 · ${h.score||''}`;row.append(a,b);$('history').append(row)}}
 renderSkins();persist();
}
function renderSkins(){const target=$('skinList');if(!target)return;target.replaceChildren();for(const s of skins){const button=document.createElement('button'),swatch=document.createElement('span'),name=document.createElement('b'),meta=document.createElement('small');button.className='skin-card'+(profile.skin===s.id?' selected':'');button.type='button';swatch.className='skin-swatch';swatch.style.setProperty('--skin',s.color);name.textContent=s.name;meta.textContent=profile.skin===s.id?'已装备':profile.unlocked.includes(s.id)?'点击装备':s.cost+' 游戏积分解锁';button.setAttribute('aria-pressed',String(profile.skin===s.id));button.append(swatch,name,meta);button.onclick=()=>{if(!profile.unlocked.includes(s.id)){if(profile.credits<s.cost){toast('积分不足：完成比赛即可获得积分');return}profile.credits-=s.cost;profile.unlocked.push(s.id)}profile.skin=s.id;sync();toast('已装备 '+s.name)};target.append(button)}}
function unlockAudio(){try{if(!audio){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;audio=new C();noiseBuffer=audio.createBuffer(1,audio.sampleRate*.6,audio.sampleRate);const d=noiseBuffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}if(audio.state==='suspended')audio.resume().catch(()=>{})}catch{audio=null}}
function tone(freq,duration=.08,volume=.1,type='sine',delay=0){if(!audio||settings.volume===0)return;const t=audio.currentTime+delay,o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(Math.max(.0001,volume*settings.volume),t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+duration)}
function noise(duration,volume,cutoff,pan=0){if(!audio||!noiseBuffer||settings.volume===0)return;const t=audio.currentTime,b=audio.createBufferSource(),g=audio.createGain(),f=audio.createBiquadFilter();b.buffer=noiseBuffer;f.type='lowpass';f.frequency.value=cutoff;g.gain.setValueAtTime(Math.max(.0001,volume*settings.volume),t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);b.connect(f);f.connect(g);if(audio.createStereoPanner){const p=audio.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,pan));g.connect(p);p.connect(audio.destination)}else g.connect(audio.destination);b.start(t,Math.random()*.2);b.stop(t+duration)}
function sound(type,options={}){
 if(!audio)return;const now=audio.currentTime;
 if(type==='shot'){const {gun=1,distance=0,pan=0,human=false}=options;if(!human&&now-lastBotShot<.075)return;if(!human)lastBotShot=now;const v=human?.42:.28/(1+distance*.09);noise(gun===2?.25:.11,v,gun===0?3000:gun===1?5200:1900,pan);tone(gun===2?64:gun===0?95:128,gun===2?.20:.09,v*.9,'triangle');}
 if(type==='hit'){tone(850,.055,.09);tone(1250,.045,.045,'sine',.025)}
 if(type==='kill'){tone(520,.13,.12);tone(780,.15,.09,'sine',.06);tone(1040,.2,.07,'sine',.12)}
 if(type==='hurt')noise(.11,.11,900);
 if(type==='reload'){noise(.06,.12,8000);tone(180,.035,.07,'square',.25)}
 if(type==='step'&&now-lastStep>.24){lastStep=now;noise(.055,.07,480)}
 if(type==='win'){[392,523,659,784].forEach((f,i)=>tone(f,.35,.13,'sine',i*.12))}
 if(type==='lose'){tone(260,.4,.12);tone(196,.5,.1,'sine',.2)}
}
function begin(name){updateInsets();unlockAudio();profile.name=String(name||'游客').trim().slice(0,16)||'游客';activeMatch={id:Date.now()+'-'+Math.random(),done:false};sync();return {...settings}}
function settle({won,kills,deaths,score,seconds,accuracy,headshots}){
 if(!activeMatch||activeMatch.done)return;activeMatch.done=true;const earned=50+kills*8+(won?70:20),xp=80+kills*20+(won?120:30);
 profile.credits+=earned;profile.xp+=xp;profile.games++;profile.wins+=won?1:0;profile.kills+=kills;profile.deaths+=deaths;profile.best=Math.max(profile.best,kills);profile.history.unshift({win:won,kills,deaths,score,date:Date.now()});profile.history.length=Math.min(profile.history.length,5);sync();
 stat('rewardCredits','+'+earned);stat('rewardXP','+'+xp+' XP');stat('resultKD',`${kills} / ${deaths}`);stat('resultAccuracy',accuracy+'%');stat('resultHeadshots',headshots);stat('resultTime',`${Math.floor(seconds/60)}分${Math.floor(seconds%60)}秒`);sound(won?'win':'lose');return{earned,xp};
}
function board(actors,player,target){const tbody=$(target);if(!tbody)return;tbody.replaceChildren();const rows=actors.slice().sort((a,b)=>a.team-b.team||b.kills-a.kills);for(const a of rows){const tr=document.createElement('tr');if(a===player)tr.className='you';for(const val of [a===player?a.name+' · 你':a.name,a.team?'红队':'蓝队',a.kills,a.deaths]){const td=document.createElement('td');td.textContent=String(val);tr.append(td)}tbody.append(tr)}}
const insets={top:0,left:0,right:0,bottom:0};
function updateInsets(){try{const style=getComputedStyle(document.documentElement);for(const key of Object.keys(insets))insets[key]=parseFloat(style.getPropertyValue('--safe-'+key))||0}catch{}}
window.addEventListener('resize',updateInsets);
function drawHUD(ctx,{actors,player,blocks,width,scale}){
 if(!player)return;const s=scale||1,small=matchMedia('(pointer: coarse)').matches,k=small?.74:1,x=(15+insets.left)*s,y=(78+insets.top)*s,w=126*s*k,h=63*s*k;ctx.save();ctx.fillStyle='#081a24c9';ctx.fillRect(x-5*s,y-5*s,w+10*s,h+10*s);ctx.strokeStyle='#abc5c54d';ctx.lineWidth=s;ctx.strokeRect(x-5*s,y-5*s,w+10*s,h+10*s);
 ctx.fillStyle='#657f86';for(const b of blocks)ctx.fillRect(x+b.x*s*k,y+b.z*s*k,b.w*s*k,b.d*s*k);
 for(const a of actors){if(a.dead||a===player)continue;if(a.team===1&&!a.muzzle)continue;ctx.fillStyle=a.team?'#ef8c74':'#77c7df';ctx.beginPath();ctx.arc(x+a.x*s*k,y+a.z*s*k,1.7*s,0,Math.PI*2);ctx.fill()}
 const px=x+player.x*s*k,py=y+player.z*s*k;ctx.translate(px,py);ctx.rotate(player.yaw);ctx.fillStyle='#fff0c7';ctx.beginPath();ctx.moveTo(4*s,0);ctx.lineTo(-3*s,-3*s);ctx.lineTo(-2*s,0);ctx.lineTo(-3*s,3*s);ctx.closePath();ctx.fill();ctx.restore();
 if(player.reloading){let total=[2.15,1.85,2.7][player.gun],progress=1-player.reloading/total;ctx.save();ctx.strokeStyle='#f3c988';ctx.lineWidth=2*s;ctx.beginPath();ctx.arc(width/2,ctx.canvas?.height/2||innerHeight*s/2,27*s,-Math.PI/2,-Math.PI/2+Math.max(0,progress)*Math.PI*2);ctx.stroke();ctx.restore()}
}
function setupOffline(){
 if('serviceWorker' in navigator)window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js').catch(()=>{})});
 let prompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();prompt=e;if($('installApp'))$('installApp').hidden=false});
 if($('installApp'))$('installApp').onclick=async()=>{if(!prompt)return;prompt.prompt();await prompt.userChoice;prompt=null;$('installApp').hidden=true};
 window.addEventListener('appinstalled',()=>{if($('installApp'))$('installApp').hidden=true;toast('游戏已添加到设备')});
 window.addEventListener('offline',()=>toast('当前离线：可继续与电脑对战，进度保存在本机'));
}
function boot(){
 const nick=$('nickname');if(nick){nick.value=profile.name||'游客'+Math.floor(Math.random()*900+100);nick.addEventListener('change',()=>{profile.name=nick.value.trim().slice(0,16);sync()})}
 for(const [id,key] of [['volume','volume'],['sensitivity','sensitivity'],['quality','quality'],['crosshair','crosshair'],['difficulty','difficulty'],['loadout','weapon'],['matchLength','length'],['fov','fov']]){const el=$(id);if(!el)continue;el.value=settings[key];const update=()=>{settings[key]=['volume','sensitivity','weapon','length','fov'].includes(key)?Number(el.value):el.value;persist();if($(id+'Value'))$(id+'Value').textContent=key==='volume'?Math.round(settings[key]*100)+'%':key==='sensitivity'?settings[key].toFixed(1)+'×':settings[key];window.dispatchEvent(new Event('deck-settings'));};el.addEventListener('input',update);update()}
 document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>{const name=button.dataset.tab;document.querySelectorAll('[data-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.tab===name);b.setAttribute('aria-selected',String(b.dataset.tab===name))});document.querySelectorAll('[data-page]').forEach(p=>p.hidden=p.dataset.page!==name)}));
 $('fullscreen').onclick=()=>{const request=document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen;if(!request){toast('当前浏览器不支持网页全屏，可直接游玩');return}try{const p=request.call(document.documentElement);if(p?.catch)p.catch(()=>toast('当前浏览器不支持全屏'))}catch{toast('当前浏览器不支持全屏')}};
 $('share').onclick=async()=>{try{await navigator.clipboard.writeText(location.origin+location.pathname);toast('游戏链接已复制')}catch{toast('复制浏览器地址即可邀请朋友试玩')}};
 $('pauseSettings').onclick=()=>{$('pauseControls').hidden=!$('pauseControls').hidden};
 $('pauseVolume').value=settings.volume;$('pauseVolume').oninput=e=>{settings.volume=Number(e.target.value);if($('volume'))$('volume').value=settings.volume;persist()};
 $('pauseSensitivity').value=settings.sensitivity;$('pauseSensitivity').oninput=e=>{settings.sensitivity=Number(e.target.value);if($('sensitivity'))$('sensitivity').value=settings.sensitivity;persist()};
 sync();
}
window.DeckApp={settings,profile,skins,get skin(){return skins.find(s=>s.id===profile.skin)?.rgb||null},begin,settle,board,sound,drawHUD,unlockAudio,toast,sync,storageOK:()=>storageOK};
boot();updateInsets();setupOffline();
})();
