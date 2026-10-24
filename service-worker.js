
'use strict';
const PREFIX='relate-shell-'+encodeURIComponent(self.registration.scope)+'-';
const CACHE=PREFIX+'2.0.0';
const shell=['./','./index.html','./manifesto.json'];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(shell);
    await Promise.all(['./pwa-192.png','./pwa-512.png'].map(p=>cache.add(p).catch(()=>{})));
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('message',event=>{
  if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  const scope=new URL(self.registration.scope);
  if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
  if(request.mode==='navigate'){
    // Solo el documento principal: no almacenar respuestas API ni datos sanitarios.
    if(url.pathname!==scope.pathname&&url.pathname!==scope.pathname+'index.html')return;
    event.respondWith((async()=>{
      try{return await fetch(request);}
      catch(error){
        const cached=await caches.match(new URL('index.html',scope).href);
        return cached||new Response('Aplicación no disponible sin conexión todavía.',{status:503});
      }
    })());
    return;
  }
  const allowed=['manifesto.json','pwa-192.png','pwa-512.png'];
  if(!allowed.some(name=>url.pathname===scope.pathname+name)||url.search)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(request);
    if(cached)return cached;
    const response=await fetch(request);
    if(response.ok)await cache.put(request,response.clone());
    return response;
  })());
});
