// Noma app shell - cache only public assets, never personal learning state.
const CACHE='noma-app-shell-0.20.1-beta.2';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const SQLITE_ASSETS=[
  'https://cdn.jsdelivr.net/npm/sql.js@1.14.2/dist/sql-wasm.min.js',
  'https://cdn.jsdelivr.net/npm/sql.js@1.14.2/dist/sql-wasm.wasm'
];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    // Both WASM and JS are essential for opening SQLite offline.
    await cache.addAll([...SHELL,...SQLITE_ASSETS]);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    for(const key of await caches.keys()){
      if(key.startsWith('noma-app-shell-')&&key!==CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;
  const url=new URL(request.url);
  const isRuntime=SQLITE_ASSETS.includes(url.href);
  if(isRuntime){
    event.respondWith((async()=>{
      const hit=await caches.match(request);
      if(hit) return hit;
      const response=await fetch(request);
      if(response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}
      return response;
    })());
    return;
  }
  if(url.origin!==self.location.origin) return;
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request);
        if(response.ok){const cache=await caches.open(CACHE);await cache.put('./index.html',response.clone());}
        return response;
      }catch(e){
        return await caches.match('./index.html')||await caches.match('./')||Response.error();
      }
    })());
    return;
  }
  if(SHELL.some(path=>new URL(path,self.registration.scope).href===url.href)){
    event.respondWith((async()=>await caches.match(request)||await fetch(request))());
  }
});
