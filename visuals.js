/* Procedural geometry: no textures, downloads or model dependencies. */
(()=>{'use strict';
const TAU=Math.PI*2,cache=new Map();
const dark=[.075,.10,.12],metal=[.20,.25,.27],strap=[.16,.18,.16];
function triangle(out,a,b,c,color){
 const u=b.map((v,i)=>v-a[i]),v=c.map((n,i)=>n-a[i]);
 const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(...n)||1;
 const light=.72+.28*Math.max(0,(n[0]*.35+n[1]*.86+n[2]*.37)/l);
 for(const p of [a,b,c])out.push(...p,...color.map(k=>Math.min(1,k*light)));
}
function quad(o,a,b,c,d,col){triangle(o,a,b,c,col);triangle(o,a,c,d,col)}
function cube(o,x,y,z,w,h,d,col){
 const a=[x,y,z],b=[x+w,y,z],c=[x+w,y+h,z],e=[x,y+h,z],f=[x,y,z+d],g=[x+w,y,z+d],h1=[x+w,y+h,z+d],i=[x,y+h,z+d];
 quad(o,i,h1,c,e,col);quad(o,b,g,f,a,col);quad(o,e,c,b,a,col);quad(o,h1,i,f,g,col);quad(o,i,e,a,f,col);quad(o,c,h1,g,b,col);
}
function rings(o,rows,col,sides=14){
 let prev=null;
 for(const [x,y,z,rx,rz] of rows){const row=[];for(let i=0;i<sides;i++){let a=TAU*i/sides;row.push([x+Math.cos(a)*rx,y,z+Math.sin(a)*rz])}
 if(prev)for(let i=0;i<sides;i++){let j=(i+1)%sides;quad(o,prev[j],prev[i],row[i],row[j],col)}prev=row}
 const first=rows[0],last=rows[rows.length-1];
 for(let i=0;i<sides;i++){let j=(i+1)%sides,a=TAU*i/sides,b=TAU*j/sides;
 triangle(o,[first[0],first[1],first[2]],[first[0]+Math.cos(a)*first[3],first[1],first[2]+Math.sin(a)*first[4]],[first[0]+Math.cos(b)*first[3],first[1],first[2]+Math.sin(b)*first[4]],col);
 triangle(o,[last[0],last[1],last[2]],prev[j],prev[i],col)}
}
function limb(o,a,b,r1,r2,col,sides=10){
 let axis=b.map((v,i)=>v-a[i]),len=Math.hypot(...axis)||1;axis=axis.map(v=>v/len);
 let ref=Math.abs(axis[1])<.9?[0,1,0]:[1,0,0];let u=[axis[1]*ref[2]-axis[2]*ref[1],axis[2]*ref[0]-axis[0]*ref[2],axis[0]*ref[1]-axis[1]*ref[0]],ul=Math.hypot(...u);u=u.map(v=>v/ul);
 let v=[axis[1]*u[2]-axis[2]*u[1],axis[2]*u[0]-axis[0]*u[2],axis[0]*u[1]-axis[1]*u[0]],p=[],q=[];
 for(let i=0;i<sides;i++){let t=TAU*i/sides,k=u.map((n,j)=>n*Math.cos(t)+v[j]*Math.sin(t));p.push(a.map((n,j)=>n+k[j]*r1));q.push(b.map((n,j)=>n+k[j]*r2))}
 for(let i=0;i<sides;i++){let j=(i+1)%sides;quad(o,p[j],p[i],q[i],q[j],col);triangle(o,a,p[i],p[j],col);triangle(o,b,q[j],q[i],col)}
}
function upper(team,gun){
 const key=team*3+gun;if(cache.has(key))return cache.get(key);let o=[];
 const suit=team?[.51,.39,.29]:[.29,.39,.43],armor=team?[.30,.28,.23]:[.15,.23,.27],accent=team?[.90,.32,.22]:[.25,.68,.90];
 // Shaped ribcage, plate carrier, shoulder straps, MOLLE pouches and pack.
 rings(o,[[0,.96,0,.22,.29],[0,1.17,0,.29,.39],[-.025,1.59,0,.27,.43],[-.04,1.74,0,.18,.29]],suit);
 rings(o,[[.015,1.15,0,.31,.36],[.015,1.49,0,.34,.40],[0,1.66,0,.28,.34]],armor);
 cube(o,.292,1.25,-.29,.075,.31,.58,armor);
 for(let z of [-.28,-.08,.12]){cube(o,.33,1.14,z,.105,.22,.17,strap);cube(o,.44,1.28,z+.025,.013,.028,.12,metal)}
 for(let z of [-.29,.23]){cube(o,.24,1.48,z,.08,.19,.065,strap);cube(o,.325,1.52,z,.025,.04,.065,[.55,.55,.44])}
 cube(o,-.39,1.22,-.27,.15,.38,.54,strap);cube(o,-.44,1.29,-.19,.06,.24,.38,armor);
 cube(o,-.23,1.03,-.36,.49,.10,.72,dark);cube(o,.27,1.045,-.06,.045,.07,.12,[.54,.57,.52]);
 cube(o,-.1,1.07,.37,.22,.26,.16,armor);cube(o,-.15,1.45,.37,.14,.19,.13,dark);cube(o,-.11,1.64,.41,.018,.22,.018,dark);
 // Balaclava, rounded helmet shell, separate tinted lenses and headset.
 const headStart=o.length;
 rings(o,[[0,1.70,0,.13,.14],[.025,1.84,0,.245,.24],[.015,2.12,0,.25,.25],[0,2.20,0,.16,.18]],dark);
 rings(o,[[-.02,2.01,0,.31,.31],[-.04,2.18,0,.30,.31],[-.06,2.29,0,.21,.23],[-.06,2.34,0,.08,.10]],team?[.32,.33,.28]:[.23,.29,.30]);
 cube(o,-.15,2.315,-.035,.20,.025,.07,strap);
 for(let z of [-.22,.015]){cube(o,.243,1.98,z,.04,.115,.205,metal);cube(o,.285,2.005,z+.014,.015,.063,.171,[.12,.31,.36]);cube(o,.302,2.052,z+.024,.006,.012,.14,[.49,.68,.65])}
 cube(o,.246,1.86,-.17,.04,.10,.34,[.19,.22,.22]);for(let z of [-.11,-.035,.04])cube(o,.288,1.885,z,.006,.035,.016,dark);
 for(let z of [-.35,.28]){cube(o,-.11,1.98,z,.19,.18,.07,dark);cube(o,-.08,2.02,z,.12,.09,.075,metal)}
 limb(o,[.04,2.02,-.36],[.25,1.89,-.30],.018,.018,dark);cube(o,.22,1.87,-.30,.10,.04,.04,dark);
 for(let i=headStart;i<o.length;i+=6){o[i]*=.85;o[i+1]=1.72+(o[i+1]-1.72)*.86;o[i+2]*=.85}
 // Colored shoulder bands remain visible at combat distance.
 for(let z of [-.52,.52]){rings(o,[[-.04,1.43,z,.15,.16],[-.04,1.63,z,.19,.18],[-.04,1.71,z,.10,.12]],armor,12);cube(o,.13,1.51,z-.105,.025,.085,.21,accent)}
 cube(o,-.355,1.47,-.24,.012,.045,.48,accent);
 // Three distinct rifle silhouettes, kept inside the animated two-hand grip.
 const wood=[.46,.28,.15],gunmetal=[.13,.17,.19],stock=gun===0?wood:gun===2?[.34,.40,.26]:metal;
 cube(o,.20,1.34,-.22,.31,.10,.15,stock);cube(o,.48,1.33,-.22,.40,.14,.16,gunmetal);
 cube(o,.86,1.35,-.205,.31,.10,.13,stock);limb(o,[1.12,1.405,-.14],[gun===2?1.68:1.48,1.405,-.14],.026,.023,dark);
 cube(o,.66,1.15,-.20,.11,.20,.12,gun===0?wood:metal);cube(o,.50,1.24,-.20,.075,.12,.12,dark);
 if(gun===2){limb(o,[.62,1.55,-.14],[1.03,1.55,-.14],.056,.07,dark,8);cube(o,.69,1.46,-.18,.065,.10,.08,metal)}
 else{cube(o,.62,1.48,-.20,.12,.035,.12,metal);cube(o,1.12,1.44,-.16,.02,.09,.04,dark)}
 for(let i=0;i<o.length;i+=6){let x=o[i],y=o[i+1],z=o[i+2],r=o[i+3],g=o[i+4],b=o[i+5];if(y<1.70&&r+g+b>.55&&r+g+b<1.5){let patch=Math.sin(Math.floor(x*19)*2.3+Math.floor(y*24)*1.7+Math.floor(z*19)*3.1)>.15?.91:1.07;for(let k=3;k<6;k++)o[i+k]*=patch}}
 cache.set(key,o);return o;
}
function soldier(a,out=[]){
 if(a.dead&&a.dead<1.75)return out;
 const suit=a.team?[.51,.39,.29]:[.29,.39,.43],armor=a.team?[.30,.28,.23]:[.15,.23,.27];
 let local=upper(a.team,a.gun).slice(),walk=a.walk||0,motion=a.motion||0,bounce=Math.abs(Math.sin(walk))*.035*motion;
 for(let sign of [-1,1]){
  let stride=Math.sin(walk+(sign<0?Math.PI:0))*.34*motion,lift=Math.max(0,Math.cos(walk+(sign<0?Math.PI:0)))*.13*motion,z=sign*.22;
  const hip=[0,1.04,z],knee=[stride*.5+.07,.58+lift*.4,z],ankle=[stride,.16+lift,z];
  limb(local,hip,knee,.175,.14,suit);limb(local,knee,ankle,.14,.10,suit);
  for(let f of [.2,.47,.76]){let p=hip.map((v,i)=>v+(knee[i]-v)*f),q=p.map((v,i)=>v+(knee[i]-hip[i])*.035);limb(local,p,q,.164-f*.03,.164-f*.03,suit.map(v=>v*.84),10)}
  cube(local,knee[0]+.10,knee[1]-.09,z-.115,.07,.20,.23,armor);
  rings(local,[[stride+.05,.025+lift,z,.23,.12],[stride+.07,.06+lift,z,.25,.13],[stride+.05,.15+lift,z,.21,.12],[stride-.02,.22+lift,z,.115,.105]],dark,12);
  const shoulder=[0,1.56,sign*.49],elbow=[.24,1.19,sign*.48],hand=sign<0?[.59,1.32,-.23]:[1.02,1.35,-.10];
  limb(local,shoulder,elbow,.14,.12,suit);limb(local,elbow,hand,.12,.085,suit);limb(local,hand,[hand[0]+.12,hand[1],hand[2]],.09,.07,dark);
  cube(local,.25,1.17,sign*.48-.10,.09,.12,.20,armor);
 }
 if(a.muzzle&&!a.dead){cube(local,a.gun===2?1.68:1.48,1.37,-.19,.22,.07,.10,[1,.73,.26]);cube(local,a.gun===2?1.73:1.53,1.34,-.17,.10,.14,.06,[1,.91,.62])}
 let cs=Math.cos(a.yaw),sn=Math.sin(a.yaw),fall=a.dead?Math.min(1,(2.8-a.dead)/.55)*1.48:0,cf=Math.cos(fall),sf=Math.sin(fall),base=a.y||0;

 for(let i=0;i<local.length;i+=6){let x=local[i],y=local[i+1]*1.045+bounce,z=local[i+2]*.88;if(fall){let nx=x*cf-y*sf;y=x*sf+y*cf+.12;x=nx}
 out.push(a.x+x*cs-z*sn,Math.max(.025,y+base),a.z+x*sn+z*cs,local[i+3],local[i+4],local[i+5])}
 return out;
}
function container(b,x,z,w,d,h,c){
 const frame=c.map(v=>v*.68),edge=c.map(v=>Math.min(1,v*1.25)),rust=[.37,.23,.14],white=[.73,.75,.67];
 // Corrugation on all four walls, steel corner posts and top beams.
 for(let s of [0,d])for(let i=1;i<w;i+=1.1)b(x+i,.18,z+s-.045,.06,h-.36,.09,frame);
 for(let s of [0,w])for(let i=1;i<d;i+=1.1)b(x+s-.045,.18,z+i,.09,h-.36,.06,frame);
 for(let xx of [x,x+w-.18])for(let zz of [z,z+d-.18]){b(xx,0,zz,.18,h,.18,edge);b(xx-.02,.1,zz-.02,.22,.16,.22,rust)}
 for(let zz of [z-.02,z+d-.09]){b(x,.12,zz,w,.11,.11,frame);b(x,h-.13,zz,w,.13,.11,edge)}
 for(let xx of [x-.02,x+w-.09])b(xx,h-.13,z,.11,.13,d,edge);
 // Door seams, lock rods, hinges and small identification plates at both ends.
 const longX=w>d;
 for(let end of [0,1]){
  if(longX){let xx=x+(end?w+.05:-.08);for(let t of [.26,.74]){b(xx,.28,z+d*t,.07,h-.50,.065,white);b(xx-.025,1.2,z+d*t-.2,.12,.08,.4,frame)}b(xx,.2,z+d/2,.08,h-.4,.055,frame);b(xx,h*.65,z+d*.55,.09,.4,d*.25,white)}
  else{let zz=z+(end?d+.05:-.08);for(let t of [.26,.74]){b(x+w*t,.28,zz,.065,h-.50,.07,white);b(x+w*t-.2,1.2,zz-.025,.4,.08,.12,frame)}b(x+w/2,.2,zz,.055,h-.4,.08,frame);b(x+w*.55,h*.65,zz,w*.25,.4,.09,white)}
 }
 // Small irregular paint wear, instead of image textures.
 for(let i=0;i<7;i++){let t=(i*.173+.17)%1;b(x+w*t,.17+(i%3)*.06,z-.055,.18+(i%2)*.17,.045,.016,rust)}
}
function scenery(b){
 const steel=[.36,.42,.43],yellow=[.84,.62,.25],shadow=[.22,.28,.28];
 // Deck panels, drains, tie-downs, route markings and hazard stripes.
 for(let x=6;x<178;x+=9)for(let z of [2.2,86.6])b(x,.135,z,4,.012,.32,shadow);
 for(let x=12;x<177;x+=13)for(let z of [4,85]){b(x,.15,z,.48,.09,.48,steel);b(x+.1,.24,z+.1,.28,.025,.28,dark)}
 for(let x of [27,152])for(let i=0;i<7;i++)b(x+i*.9,.145,25,.48,.015,2,yellow);
 for(let x=9;x<175;x+=12)b(x,.13,2,.055,.012,86,[.31,.37,.36]);
 for(let x of [4,171])for(let z of [13,73]){b(x,.18,z,1.6,.36,1.6,steel);b(x+.45,.54,z+.45,.7,.6,.7,dark);b(x-.3,.93,z+.55,2.2,.18,.5,steel)}
 // End bulkheads and deckhouse are outside the playable area.
 for(let x of [-10,181]){b(x,0,18,9,6.5,54,[.49,.55,.53]);b(x-1,6.5,17,11,.25,56,[.29,.36,.37]);b(x+1,6.75,26,6,4,37,[.72,.73,.66]);
 for(let z=28;z<61;z+=7)b(x+7.1,7.5,z,.1,1.5,4,[.14,.29,.33]);b(x+2,10.75,31,4,.25,27,steel);b(x+3,11,43,.17,5,.17,steel)}
 // Harbor cranes and silhouettes on the horizon; no new obstacles in lanes.
 for(let x of [26,134]){b(x,0,-36,1.4,26,1.4,yellow);b(x+24,0,-36,1.4,26,1.4,yellow);b(x-5,25,-38,36,1.5,5,yellow);b(x+8,26,-37,1,5,3,steel);b(x+14,14,-36,.12,11,.12,dark);b(x+12,13,-37,4,.7,2,steel)}
 for(let i=0;i<10;i++)b(-10+i*23,-1.65,-52,16,2+(i%3)*2,6,[.36,.43,.44]);
 for(let i=0;i<16;i++)b(-14+i*13,-2.32,-16+(i%4)*34,6,.015,.24,[.36,.55,.59]);
 // Long raised cable conduits along the rails, safely beyond player bounds.
 for(let z of [1.5,88]){b(2,.3,z,176,.17,.22,steel);b(2,1.48,z,176,.09,.1,steel)}
}
function cargoShadows(blocks){
 const out=[];
 function hull(p){p.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),lo=[],hi=[];for(const v of p){while(lo.length>1&&cross(lo[lo.length-2],lo[lo.length-1],v)<=0)lo.pop();lo.push(v)}for(const v of p.slice().reverse()){while(hi.length>1&&cross(hi[hi.length-2],hi[hi.length-1],v)<=0)hi.pop();hi.push(v)}return lo.slice(0,-1).concat(hi.slice(0,-1))}
 for(const b of blocks){let p=[];for(const x of [b.x,b.x+b.w])for(const z of [b.z,b.z+b.d]){p.push([x,z]);p.push([x+b.h*.55,z-b.h*.28])}p=hull(p);const center=p.reduce((r,v)=>[r[0]+v[0]/p.length,r[1]+v[1]/p.length],[0,0]);
  for(let layer=3;layer>=0;layer--){let radius=layer*.12,alpha=layer===0?.15:.035;const ring=p.map(v=>{let dx=v[0]-center[0],dz=v[1]-center[1],l=Math.hypot(dx,dz)||1;return[v[0]+dx/l*radius,.163+(3-layer)*.001,v[1]+dz/l*radius]});for(let i=0;i<ring.length;i++){for(const v of [[center[0],ring[0][1],center[1]],ring[i],ring[(i+1)%ring.length]])out.push(...v,alpha,0,0)}}
 }
 return out;
}
function actorShadows(actors){const o=[];for(const a of actors){if(a.dead)continue;const radius=(a.y||0)*.07+.47,opacity=.12/(1+(a.y||0));for(let ring=0;ring<3;ring++){const r=radius+ring*.10;for(let k=0;k<16;k++){let t=k*TAU/16,u=(k+1)*TAU/16;for(const v of [[a.x,.17,a.z],[a.x+Math.cos(t)*r+.20,.17,a.z+Math.sin(t)*r*.65-.10],[a.x+Math.cos(u)*r+.20,.17,a.z+Math.sin(u)*r*.65-.10]])o.push(...v,opacity/(ring+1),0,0)}}}return o}
const weaponCache=new Map();
function weaponBase(gun){
 if(weaponCache.has(gun))return weaponCache.get(gun);const o=[],steel=[.19,.22,.23],black=[.08,.10,.11],wood=[.37,.20,.095],green=[.29,.34,.22];
 const b=(x,y,z,w,h,d,col)=>cube(o,x,y,z,w,h,d,col),tube=(x,y,z,length,r,col,r2=r)=>limb(o,[x,y,z],[x+length,y,z],r,r2,col,16);
 // Weapon coordinates: forward X, vertical Y, lateral Z, in meters.
 if(gun===0){
  b(-.18,-.065,-.047,.27,.10,.094,wood);b(.07,-.03,-.041,.37,.095,.082,steel);
  tube(.08,.045,0,.32,.037,steel);b(.43,-.01,-.044,.22,.06,.088,wood);tube(.44,.062,0,.21,.019,black);
  tube(.64,.018,0,.34,.015,steel);tube(.94,.018,0,.075,.023,black);
  for(let i=0;i<7;i++)b(.46+i*.025,.005,-.046,.008,.025,.003,[.48,.28,.13]);
  b(.56,.06,-.015,.025,.075,.03,steel);b(.90,.025,-.018,.018,.075,.036,steel);b(.90,.10,-.024,.018,.016,.048,black);
  for(let i=0;i<6;i++){let y=-.04-i*.035,x=.27+i*i*.003;b(x,y-.035,-.025,.10,.04,.05,black);for(const z of [-.026,.024])b(x+.025,y-.027,z,.009,.029,.002,steel)}
 }else if(gun===1){
  tube(-.12,.005,0,.30,.027,black);b(-.20,-.09,-.046,.16,.16,.092,black);b(-.17,-.055,-.048,.11,.065,.096,steel);
  b(.10,-.045,-.045,.30,.11,.09,steel);b(.35,-.02,-.043,.26,.085,.086,black);tube(.35,.02,0,.26,.046,black);
  for(let i=0;i<10;i++){b(.345+i*.026,.065,-.042,.013,.015,.084,steel);for(const z of [-.045,.042])b(.37+i*.022,.005,z,.013,.027,.003,[.29,.32,.32])}
  tube(.60,.02,0,.29,.014,steel);tube(.85,.02,0,.07,.022,black);for(let i=0;i<4;i++)b(.87+i*.01,.015,-.024,.004,.01,.048,[.32,.34,.33]);
  b(.17,.073,-.04,.16,.02,.08,black);b(.21,.09,-.035,.02,.05,.07,steel);b(.30,.09,-.035,.02,.05,.07,steel);b(.21,.14,-.035,.11,.018,.07,black);
  b(.69,.032,-.016,.015,.09,.032,black);b(.69,.116,-.022,.015,.012,.044,steel);
  b(.24,-.22,-.027,.095,.18,.054,steel);for(let i=0;i<4;i++)b(.25,-.20+i*.038,-.028,.07,.006,.056,[.31,.34,.32]);
 }else{
  b(-.20,-.075,-.055,.29,.115,.11,green);b(-.19,-.015,-.057,.16,.045,.114,[.36,.40,.27]);b(.05,-.055,-.045,.38,.105,.09,green);
  tube(.08,.045,0,.36,.032,steel);tube(.42,.042,0,.59,.019,steel);tube(.96,.042,0,.09,.031,black);
  b(.20,-.18,-.029,.095,.15,.058,black);b(.14,.10,-.021,.027,.07,.042,steel);b(.39,.10,-.021,.027,.07,.042,steel);
  tube(.12,.19,0,.33,.035,black);tube(.40,.19,0,.12,.052,black,.058);tube(.05,.19,0,.09,.046,black);
  tube(.042,.19,0,.009,.037,[.11,.28,.31]);tube(.52,.19,0,.008,.050,[.12,.27,.29]);b(.28,.21,-.019,.04,.05,.038,steel);
  limb(o,[.31,.05,.035],[.34,-.015,.09],.012,.012,steel,10);rings(o,[[.34,-.03,.09,.02,.02],[.34,.005,.09,.022,.022]],black,10);
  for(const z of [-.035,.035])limb(o,[.65,.005,z],[.52,-.12,z*2],.009,.009,black,8);
 }
 // Receiver seams, trigger guard, fire selector, screws, ejection port and grip.
 b(.13,-.16,-.028,.075,.12,.056,black);b(.10,-.10,-.032,.12,.012,.064,steel);b(.20,-.09,-.032,.012,.08,.064,steel);
 b(.13,-.14,-.013,.012,.06,.026,steel);b(.20,.015,-.046,.105,.04,.003,black);b(.30,.026,-.049,.018,.012,.007,[.48,.50,.47]);
 b(.09,.05,-.043,.25,.004,.006,[.45,.47,.44]);for(let i=0;i<4;i++)b(.12+i*.06,-.022,-.047,.005,.007,.003,[.52,.53,.48]);
 // Cloth sleeves and shaped tactical gloves, with fingers around the pistol grip.
 limb(o,[-.20,-.34,.15],[.145,-.16,.045],.085,.045,[.23,.28,.26],12);limb(o,[.145,-.16,.045],[.17,-.09,.02],.047,.042,[.10,.12,.115],12);
 limb(o,[.05,-.36,-.16],[.53,-.05,-.04],.075,.038,[.23,.28,.26],12);limb(o,[.49,-.05,-.04],[.58,-.025,-.026],.04,.035,[.11,.13,.12],12);
 for(let i=0;i<4;i++){limb(o,[.14,-.09-i*.014,-.034],[.19,-.08-i*.014,-.032],.011,.010,[.16,.18,.16],8);b(.49+i*.019,-.054,-.071,.014,.035,.012,[.15,.17,.15])}
 weaponCache.set(gun,o);return o;
}
function weapon(o){
 const mesh=weaponBase(o.gun),out=[],reload=o.reloading>0?Math.sin(Math.min(1,o.reloading/2)*Math.PI)*.13:0,recoil=o.flash>0?o.flash*.37:0;
 const cx=.50-recoil,cy=-.235+Math.sin(o.bob||0)*.004-reload-(o.jump||0)*.006,cz=o.scoped?.10:.245,roll=reload*.9,cr=Math.cos(roll),sr=Math.sin(roll);
 for(let i=0;i<mesh.length;i+=6){let x=mesh[i],y=mesh[i+1],z=mesh[i+2];let color=mesh.slice(i+3,i+6);if(o.skin&&x>.05&&y>-.06&&Math.max(...color)<.65){let light=.5+Math.max(...color);color=o.skin.map(v=>v*light)}out.push(cx+x,cy+y*cr-z*sr,cz+z*cr+y*sr,...color)}
 if(o.flash>0){const x=cx+(o.gun===0?1.015:o.gun===1?.92:1.05),c=[1,.84,.42];limb(out,[x,cy+.02,cz],[x+.16,cy+.02,cz],.046,.006,c,8)}
 return out;
}
window.DeckVisuals={soldier,container,scenery,box:cube,cargoShadows,actorShadows,weapon};
})();
