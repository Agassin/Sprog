const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const sleep = ms => new Promise(r=>setTimeout(r,ms));
(async () => {
  const pid=execFileSync('adb',['shell','pidof','-s','fr.agassin.sprog'],{encoding:'utf8'}).trim();
  execFileSync('adb',['forward','tcp:9223','localabstract:webview_devtools_remote_'+pid]);
  let pages;
  for(let i=0;i<60;i++){try{pages=await (await fetch('http://127.0.0.1:9223/json/list')).json();if(pages.length)break;}catch{}await sleep(500);}
  if(!pages?.length) throw Error('Android WebView debug target unavailable');
  const target=pages.find(p=>p.type==='page') || pages[0];
  const url=new URL(target.webSocketDebuggerUrl);url.hostname='127.0.0.1';url.port='9223';
  const socket=new WebSocket(url);
  const timeout=setTimeout(()=>{console.error('WebView checks timed out');process.exit(1);},45000);
  try {
    await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
    let id=0;const pending=new Map();
    socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Log.entryAdded') console.log('WebView:',m.params.entry.text);});
    const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
    await send('Log.enable');
    for(let i=0;i<40;i++){if(await evaluate("!!document.querySelector('#app h1')"))break;await sleep(500);}
    const state=await evaluate("({text:document.body.innerText,ready:!!document.querySelector('#app h1'),native:!!window.NativeBridge?.isNative,buttons:document.querySelectorAll('nav button').length})");
    console.log('Android initial state:',JSON.stringify(state));
    if(!state.ready || !state.native || state.buttons!==5)throw Error('Android interface or native bridge did not load');
    await evaluate("document.querySelector('[data-t=\"settings\"]').click()");
    if(!await evaluate("document.querySelector('#app h1').textContent === 'Réglages'"))throw Error('Settings navigation');
    execFileSync('adb',['shell','input','keyevent','4']);
    await sleep(500);
    if(!await evaluate("V.tab === 'home'"))throw Error('Android Back button');
    await evaluate("act.start('1');S.cur.sets[0][0]={kg:25,reps:8,ok:false};act.valid()");
    if(!await evaluate('S.cur.sets[0][0].ok'))throw Error('Native session validation');
    await evaluate('location.reload()');
    await sleep(1500);
    if(!await evaluate('S.cur.sets[0][0].kg === 25 && S.cur.sets[0][0].ok'))throw Error('Native storage persistence');
    console.log('Android WebView: native bridge, navigation, hardware Back, series and persistence passed.');
  } finally {clearTimeout(timeout);socket.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
