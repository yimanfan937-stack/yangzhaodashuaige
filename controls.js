/* Shared multi-pointer controls. Each thumb owns its own captured pointer. */
(()=>{'use strict';
window.DeckControls={mount(o){
 const {canvas,joy,stick,fireButton:fire,scopeButton:scope}=o;
 let joyID=null,firePoint=null,lookPoint=null;
 const active=()=>o.active(),capture=(el,id)=>{try{el.setPointerCapture(id)}catch{}},release=(el,id)=>{try{if(id!==null&&el.hasPointerCapture(id))el.releasePointerCapture(id)}catch{}};
 function touchMode(){document.body.classList.add('touch-mode')}
 function look(point,e){const dx=e.clientX-point.x,dy=e.clientY-point.y;o.look(dx,dy,point.mouse===true);point.x=e.clientX;point.y=e.clientY}
 function center(){o.aim(0,0);stick.style.transform=''}
 function joystick(e){const r=joy.getBoundingClientRect(),radius=r.width*.34,dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,d=Math.hypot(dx,dy)||1,n=Math.min(d,radius);o.aim(dx/d*n/radius,dy/d*n/radius);stick.style.transform=`translate(${dx/d*n}px,${dy/d*n}px)`}
 joy.addEventListener('pointerdown',e=>{if(!active()||joyID!==null)return;e.preventDefault();touchMode();joyID=e.pointerId;capture(joy,joyID);joystick(e)});
 joy.addEventListener('pointermove',e=>{if(e.pointerId===joyID&&active())joystick(e)});
 const stopJoy=e=>{if(e.pointerId!==joyID)return;const id=joyID;joyID=null;center();release(joy,id)};
 for(const type of ['pointerup','pointercancel','lostpointercapture'])joy.addEventListener(type,stopJoy);
 fire.addEventListener('pointerdown',e=>{if(!active()||firePoint)return;e.preventDefault();touchMode();firePoint={id:e.pointerId,x:e.clientX,y:e.clientY};capture(fire,e.pointerId);o.fire(true)});
 fire.addEventListener('pointermove',e=>{if(firePoint?.id===e.pointerId&&active())look(firePoint,e)});
 const stopFire=e=>{if(firePoint?.id!==e.pointerId)return;const id=firePoint.id;firePoint=null;o.fire(false);release(fire,id)};
 for(const type of ['pointerup','pointercancel','lostpointercapture'])fire.addEventListener(type,stopFire);
 canvas.addEventListener('pointerdown',e=>{if(!active()||lookPoint)return;const mouse=e.pointerType==='mouse';if(mouse&&!o.dragMouse())return;if(!mouse&&e.clientX<innerWidth*.30)return;if(mouse&&e.button!==0&&e.button!==2)return;if(!mouse){e.preventDefault();touchMode()}lookPoint={id:e.pointerId,x:e.clientX,y:e.clientY,mouse};capture(canvas,e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(lookPoint?.id===e.pointerId&&active())look(lookPoint,e)});
 const stopLook=e=>{if(lookPoint?.id!==e.pointerId)return;const id=lookPoint.id;lookPoint=null;release(canvas,id)};
 for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,stopLook);
 scope.onclick=()=>{if(!active())return;const enabled=o.scope();scope.textContent=enabled?'收镜':'开镜';scope.setAttribute('aria-pressed',String(enabled));scope.classList.toggle('is-active',enabled)};
 const reset=()=>{const ji=joyID,fi=firePoint?.id,li=lookPoint?.id;joyID=null;firePoint=lookPoint=null;center();o.fire(false);scope.textContent='开镜';scope.setAttribute('aria-pressed','false');scope.classList.remove('is-active');release(joy,ji);if(fi!==undefined)release(fire,fi);if(li!==undefined)release(canvas,li)};
 if(matchMedia('(pointer: coarse)').matches)touchMode();
 return {reset};
}};
})();
