(()=>{
  const count=document.getElementById('kills');
  const effect=document.getElementById('killEffect');
  const title=document.getElementById('killTitle');
  const sub=document.getElementById('killSub');
  let streak=0,lastKill=0,timer;
  window.combatFx={
    reset(){streak=0;lastKill=0;clearTimeout(timer);count.textContent='0';effect.classList.remove('active')},
    kill(total,head=false){
      const now=performance.now();
      streak=now-lastKill<5000?streak+1:1;
      lastKill=now;
      count.textContent=String(total);
      title.textContent=head?'爆头击杀':['击杀','双杀','三连杀','四连杀'][Math.min(streak,4)-1];
      sub.textContent=streak>4?`连杀 ×${streak} · 击杀 +1`:'击杀 +1';
      effect.classList.remove('active');
      void effect.offsetWidth;
      effect.classList.add('active');
      clearTimeout(timer);
      timer=setTimeout(()=>effect.classList.remove('active'),1450);
    }
  };
})();
