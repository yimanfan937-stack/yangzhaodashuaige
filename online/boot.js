/* Visible startup state and an explicit compatibility route; never erase saves. */
(()=>{'use strict';
let ready=false,timer;
const start=()=>document.getElementById('start'),message=()=>document.getElementById('bootStatus');
function status(text,state='loading'){const el=message();if(el){el.textContent=text;el.setAttribute('data-state',state)}}
function fail(){if(ready)return;clearTimeout(timer);status('加载未完成。请点击下方“兼容模式打开”重试。','error');const b=start();if(b){b.disabled=true;b.textContent='游戏尚未就绪'}}
window.DeckBoot={ready(renderer){if(!window.DeckCombat||!window.DeckApp||!window.DeckControls||!window.DeckVisuals||!window.combatFx){fail();return}ready=true;clearTimeout(timer);const error=document.getElementById('netError');if(error?.textContent==='正在加载游戏资源…')error.textContent='';const b=start();if(b){b.disabled=false;b.textContent='游客开始战斗 ↗'}status(renderer==='canvas'?'兼容模式已就绪':'3D 模式已就绪','ready')},compatibility(){status('正在切换兼容模式…')},fail};
window.addEventListener('error',e=>{if(e.target?.tagName==='SCRIPT'||e.message)fail()},true);
window.addEventListener('unhandledrejection',()=>fail());
const compatibility=document.getElementById('compatibility');if(compatibility)compatibility.onclick=()=>{const url=new URL(location.href);url.searchParams.set('renderer','canvas');url.searchParams.set('v','20261116public1');location.assign(url.href)};
timer=setTimeout(fail,15000);
})();
