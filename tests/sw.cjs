'use strict';
module.exports = async function testWorker(source) {
  const handlers = {}, removed = [], cached = new Map();
  let installed = [], claimed = false, skipped = false, count = 0;
  const check = (condition, message) => { if (!condition) throw Error(message); count++; };
  const self = {
    registration:{scope:'https://example.org/Sprog/'}, location:{origin:'https://example.org'},
    clients:{claim:async () => {claimed = true;}},
    skipWaiting(){skipped = true;},
    addEventListener(type, callback){handlers[type] = callback;}
  };
  const cache = {addAll:async urls => {installed = urls;}, match:async key => cached.get(key)};
  const caches = {open:async () => cache, keys:async () => ['sprog-v3','sprog-v4','sprog-v5','sprog-v6','unrelated-app'],delete:async key => {removed.push(key);}};
  new Function('self','caches','fetch','URL',source)(self,caches,async () => 'network', URL);
  let pending;
  handlers.install({waitUntil:p => {pending = p;}}); await pending;
  check(installed.includes('https://example.org/Sprog/data.js'), 'Data module precached');
  check(installed.includes('https://example.org/Sprog/privacy.html'), 'Privacy available offline');
  handlers.activate({waitUntil:p => {pending = p;}}); await pending;
  check(removed.join() === 'sprog-v3,sprog-v4,sprog-v5', 'Other apps caches preserved');
  check(claimed, 'Clients claimed');
  handlers.message({data:{type:'SKIP_WAITING'}}); check(skipped, 'User-controlled activation');
  cached.set('https://example.org/Sprog/index.html', 'offline-shell');
  handlers.fetch({request:{method:'GET',url:'https://example.org/Sprog/index.html?source=home'},respondWith:p => {pending = p;}});
  check(await pending === 'offline-shell', 'Subdirectory and query work offline');
  let intercepted = false;
  handlers.fetch({request:{method:'GET',url:'https://other.org/tracker'},respondWith(){intercepted = true;}});
  handlers.fetch({request:{method:'POST',url:'https://example.org/Sprog/'},respondWith(){intercepted = true;}});
  check(!intercepted, 'External and mutating requests ignored');
  return count;
};
