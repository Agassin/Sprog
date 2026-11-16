'use strict';
// Real Chrome smoke checks through its DevTools protocol. No npm dependencies.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const {spawn} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function main() {
  const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.webmanifest':'application/manifest+json', '.svg':'image/svg+xml', '.png':'image/png'};
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (!pathname.startsWith('/Sprog/')) {response.writeHead(404).end(); return;}
      const name = pathname.slice('/Sprog/'.length) || 'index.html';
      const file = path.resolve(root, name);
      if (!file.startsWith(root + path.sep)) {response.writeHead(403).end(); return;}
      const content = await fs.readFile(file);
      response.writeHead(200, {'Content-Type':mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store'}).end(content);
    } catch {response.writeHead(404).end();}
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'sprog-chrome-'));
  let chrome, socket;
  const timeout = setTimeout(() => {console.error('Browser checks timed out'); process.exit(1);}, 90000);
  try {
    chrome = spawn(process.env.CHROME_BIN || 'google-chrome', [
      '--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--remote-debugging-port=0',
      '--user-data-dir=' + profile, 'about:blank'
    ], {stdio:['ignore','ignore','pipe']});
    let chromeError;
    chrome.on('error', error => {chromeError = error;});
    chrome.stderr.on('data', () => {});
    let debugPort;
    for (let i=0; i<100; i++) {
      if (chromeError) throw chromeError;
      try {debugPort = (await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]; break;} catch {}
      await sleep(100);
    }
    if (!debugPort) throw Error('Chrome debugging endpoint unavailable');
    const pages = await (await fetch('http://127.0.0.1:' + debugPort + '/json/list')).json();
    socket = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve,reject) => {socket.addEventListener('open', resolve, {once:true}); socket.addEventListener('error', reject, {once:true});});
    let id = 0; const pending = new Map(), errors = [];
    socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.id) {const p = pending.get(message.id); pending.delete(message.id); if(message.error) p.reject(Error(JSON.stringify(message.error))); else p.resolve(message.result);}
      else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    });
    const send = (method, params = {}) => new Promise((resolve,reject) => {const request = ++id; pending.set(request,{resolve,reject});socket.send(JSON.stringify({id:request,method,params}));});
    const evaluate = async expression => {
      const result = await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
      if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
      return result.result.value;
    };
    const until = async expression => {
      for(let i=0;i<100;i++){try{if(await evaluate(expression))return;}catch{}await sleep(100);}
      throw Error('Timed out: ' + expression);
    };
    let checks = 0;
    const check = async (expression,label) => {if(!await evaluate(expression))throw Error(label);checks++;};
    await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
    await send('Emulation.setDeviceMetricsOverride',{width:320,height:740,deviceScaleFactor:1,mobile:true});
    await send('Page.navigate',{url:'http://127.0.0.1:' + port + '/Sprog/'});
    await until("document.querySelector('#app h1') && typeof S !== 'undefined'");
    await until('!!navigator.serviceWorker.controller');
    for (const tab of ['home','seance','prog','suivi','settings']) {
      await evaluate('document.querySelector(' + JSON.stringify('[data-t="' + tab + '"]') + ').click()');
      await check("!!document.querySelector('#app h1')", 'Missing screen ' + tab);
      await check('document.documentElement.scrollWidth <= innerWidth', 'Horizontal overflow at 320px: ' + tab);
    }
    await evaluate("act.start('1')");
    for (const [field,value] of [['kg','40,5'],['reps','6']]) {
      const selector = JSON.stringify('[data-k="0"][data-f="' + field + '"]');
      await evaluate('document.querySelector(' + selector + ').value=' + JSON.stringify(value) + ';document.querySelector(' + selector + ').dispatchEvent(new Event("input",{bubbles:true}))');
    }
    await evaluate("document.querySelector('[data-a=\"valid\"]').click()");
    await check('S.cur.sets[0][0].ok && S.cur.sets[0][0].kg === 40.5', 'DOM input and validation');
    await check('document.documentElement.scrollWidth <= innerWidth', 'Session overflow at 320px');
    await evaluate("S.cur.restUntil = Date.now()-1000; save(); tick()");
    await check("document.querySelector('#rest').textContent === '00:00'", 'Expired timer');
    await send('Network.setCacheDisabled',{cacheDisabled:true});
    // Stop the origin server: a reload must now be served by the actual worker.
    await new Promise(resolve => {server.close(resolve); server.closeAllConnections();});
    await send('Page.reload',{ignoreCache:true});
    await until("typeof S !== 'undefined' && !!document.querySelector('#app h1')");
    await check('S.cur.sets[0][0].kg === 40.5', 'Offline reload preserves session');
    await evaluate("document.querySelector('[data-t=\"settings\"]').click()");
    await check("document.querySelector('#app').textContent.includes('Confidentialité')", 'Settings work offline');
    await send('Page.navigate',{url:'http://127.0.0.1:' + port + '/Sprog/privacy.html'});
    await until("document.querySelector('h1')?.textContent === 'Confidentialité'");
    checks++;
    if (errors.length) throw Error('Browser exceptions: ' + errors.join(', '));
    console.log(checks + ' real browser checks passed at 320px, including offline reload.');
  } finally {
    clearTimeout(timeout);
    socket?.close(); chrome?.kill();
    server.close(); server.closeAllConnections();
  }
}
main().catch(error => {console.error(error);process.exitCode=1;});
