'use strict';
const CACHE='deckfire-startup-20261116fix1',VERSION='20261116fix1';
const ASSETS=['./','./index.html','./deck-preview.webp','./icon-192.png','./icon-512.png','./manifest.webmanifest',...['boot.js','style.css','controls.js','app.js','visuals.js','weapon.js','combat-fx.js','game.js','fallback.js'].map(p=>'./'+p+'?v='+VERSION)];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('deckfire-')&&key!==CACHE).map(key=>caches.delete(key))))));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin)return;
 if(request.mode==='navigate'){event.respondWith(fetch(request).catch(async()=>{const cache=await caches.open(CACHE);return await cache.match('./index.html')||Response.error()}));return}
 event.respondWith(caches.open(CACHE).then(async cache=>{const hit=await cache.match(request);if(hit)return hit;return fetch(request)}));
});
