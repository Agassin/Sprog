'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const D = require('../data.js');
const {count, app} = require('./suite.cjs')(D, fs.readFileSync(path.join(root, 'program.js'), 'utf8'), fs.readFileSync(path.join(root, 'app.js'), 'utf8'));
(async () => {
  const a = app();
  await a.importFile({size:10, text:async () => '{broken'});
  if (a.S.done.length || !a.node('#status').textContent.includes('Import refusé')) throw Error('Invalid import changes state');
  const data = D.fresh(); data.body.push({w:1,kg:92,cm:90,en:4});
  await a.importFile({size:100, text:async () => JSON.stringify({app:'Sprog',version:2,data})});
  if (a.S.body[0]?.kg !== 92) throw Error('Valid import failed');
  await a.importFile({size:6*1024*1024,text:async () => '{}'});
  if (a.S.body[0]?.kg !== 92) throw Error('Oversized import mutated state');
  const workerChecks = await require('./sw.cjs')(fs.readFileSync(path.join(root, 'sw.js'), 'utf8'));
  console.log(`${count + 3 + workerChecks} checks passed.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
