/* Canvas draws the same weapon-space mesh as WebGL, with one cached raster. */
(()=>{'use strict';let cached=null;
window.drawWeaponModel=function(ctx,o){
 const w=o.width,h=o.height,flash=o.flash>0?.07:0,reload=Math.round((o.reloading||0)*8)/8;
 const key=[w,h,o.gun,flash,reload,!!o.scoped,o.skin?.join(',')||'service'].join('|');
 if(!cached||cached.key!==key){
  const mesh=window.DeckVisuals.weapon({gun:o.gun,flash,reloading:reload,scoped:o.scoped,skin:o.skin,aspect:w/h}),plane=h/(2*Math.tan(Math.PI/6)),faces=[];
  let minX=w,minY=h,maxX=0,maxY=0;
  for(let i=0;i<mesh.length;i+=18){const p=[];let depth=0;for(let j=0;j<18;j+=6){const x=mesh[i+j];if(x<.035){p.length=0;break}p.push([w/2+mesh[i+j+2]/x*plane,h/2-mesh[i+j+1]/x*plane]);depth+=x}if(p.length!==3)continue;
   if((p[1][0]-p[0][0])*(p[2][1]-p[0][1])-(p[1][1]-p[0][1])*(p[2][0]-p[0][0])>=0)continue;
   if(p.every(v=>v[0]<0)||p.every(v=>v[0]>w)||p.every(v=>v[1]<0)||p.every(v=>v[1]>h))continue;
   for(const v of p){minX=Math.min(minX,v[0]);minY=Math.min(minY,v[1]);maxX=Math.max(maxX,v[0]);maxY=Math.max(maxY,v[1])}
   faces.push({p,depth,color:`rgb(${mesh.slice(i+3,i+6).map(c=>Math.round(Math.max(0,Math.min(1,c))*255)).join(',')})`});
  }
  const x=Math.max(0,Math.floor(minX)-2),y=Math.max(0,Math.floor(minY)-2),cw=Math.max(1,Math.min(w,Math.ceil(maxX)+2)-x),ch=Math.max(1,Math.min(h,Math.ceil(maxY)+2)-y),canvas=cached?.canvas||document.createElement('canvas');canvas.width=cw;canvas.height=ch;const paint=canvas.getContext('2d');
  faces.sort((a,b)=>b.depth-a.depth);for(const f of faces){paint.fillStyle=f.color;paint.beginPath();paint.moveTo(f.p[0][0]-x,f.p[0][1]-y);paint.lineTo(f.p[1][0]-x,f.p[1][1]-y);paint.lineTo(f.p[2][0]-x,f.p[2][1]-y);paint.closePath();paint.fill()}
  cached={key,canvas,x,y};
 }
 const sway=Math.sin(o.bob||0)*h*.002+(o.jump||0)*h*.002;ctx.drawImage(cached.canvas,cached.x,cached.y+sway);
};})();
