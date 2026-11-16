/* Shared damage rules and bounded, lightweight combat feedback. */
(()=>{'use strict';
const profiles=[{base:34,start:15,end:70,min:.60},{base:25,start:12,end:60,min:.64},{base:100,start:35,end:100,min:.82}];
let hit=null,hurt=null,particles=[],timer;
function damage(gun,distance,head=false,scale=1){const p=profiles[gun]||profiles[1],d=Math.max(0,Number(distance)||0),t=Math.max(0,Math.min(1,(d-p.start)/(p.end-p.start))),factor=1-(1-p.min)*t;return Math.max(1,Math.round(p.base*factor*(head?1.7:1)*scale))}
function reset(){hit=hurt=null;particles=[];clearTimeout(timer);document.body.classList.remove('combat-hit');document.body.classList.remove('critical-health')}
function impact(x,y,z,wall=false){particles.push({x,y,z,wall,t:.18});if(particles.length>12)particles.shift()}
function confirm(amount,head,x,y,z){hit={amount,head,t:.35};impact(x,y,z)}
function wounded(amount,angle,hp){hurt={amount,angle,t:.65};document.body.classList.add('combat-hit');clearTimeout(timer);timer=setTimeout(()=>document.body.classList.remove('combat-hit'),160);health(hp)}
function health(hp){document.body.classList.toggle('critical-health',hp>0&&hp<=25)}
function tick(dt){if(hit){hit.t-=dt;if(hit.t<=0)hit=null}if(hurt){hurt.t-=dt;if(hurt.t<=0)hurt=null}for(const p of particles)p.t-=dt;particles=particles.filter(p=>p.t>0)}
function draw(ctx,{player,width:w,height:h,fov}){
 const s=w/innerWidth,cx=w/2,cy=h/2;ctx.save();
 if(hit){ctx.globalAlpha=Math.min(1,hit.t/.12);ctx.fillStyle=hit.head?'#ffcc70':'#e7f4eb';ctx.font=`700 ${15*s}px system-ui`;ctx.fillText('−'+hit.amount,cx+28*s,cy-20*s);if(hit.head){ctx.font=`700 ${10*s}px system-ui`;ctx.fillText('爆头',cx+28*s,cy-37*s)}}
 if(hurt){ctx.globalAlpha=Math.min(1,hurt.t/.25);ctx.strokeStyle='#ff6859';ctx.lineWidth=5*s;ctx.beginPath();ctx.arc(cx,cy,Math.min(w,h)*.10,hurt.angle-Math.PI/2-.32,hurt.angle-Math.PI/2+.32);ctx.stroke();ctx.font=`700 ${13*s}px system-ui`;ctx.fillStyle='#ff9687';ctx.fillText('受击 −'+hurt.amount,18*s,h-110*s)}
 const c=Math.cos(player.yaw),sn=Math.sin(player.yaw),cp=Math.cos(player.pitch),sp=Math.sin(player.pitch),plane=h/(2*Math.tan(fov*Math.PI/360)),eye=1.62+(player.y||0);
 for(const p of particles){const dx=p.x-player.x,dz=p.z-player.z,dy=p.y-eye,front=dx*c+dz*sn,depth=front*cp+dy*sp;if(depth<.2)continue;const x=cx+(-dx*sn+dz*c)/depth*plane,y=cy-(dy*cp-front*sp)/depth*plane;if(x<0||x>w||y<0||y>h)continue;const size=Math.min(18,Math.max(4,38/depth))*s*(1+(1-p.t/.18));ctx.globalAlpha=Math.min(1,p.t/.08);ctx.strokeStyle=p.wall?'#ffd58a':'#f7ba91';ctx.lineWidth=1.5*s;for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*size*.3,y+Math.sin(a)*size*.3);ctx.lineTo(x+Math.cos(a)*size,y+Math.sin(a)*size);ctx.stroke()}}
 ctx.restore();
}
window.DeckCombat={damage,profiles,reset,health,tick,draw,impact,confirm,wounded};
})();
