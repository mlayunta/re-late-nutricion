'use strict';
const PREFIX='relate-shell-'+encodeURIComponent(self.registration.scope)+'-';
const CACHE=PREFIX+'2.1.0';
const shell=['./','./index.html','./manifesto.json'];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(shell);
    await Promise.all(['./pwa-192.png','./pwa-512.png'].map(p=>cache.add(p).catch(()=>{})));
  })());
});
self.addEventListener('message',event=>{
  if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const hit=await cache.match(req,{ignoreSearch:true});
    if(hit){
      fetch(req).then(res=>{if(res&&res.ok)cache.put(req,res.clone());}).catch(()=>{});
      return hit;
    }
    try{
      const res=await fetch(req);
      if(res&&res.ok)cache.put(req,res.clone());
      return res;
    }catch(e){
      const fallback=await cache.match('./index.html');
      if(fallback)return fallback;
      throw e;
    }
  })());
});