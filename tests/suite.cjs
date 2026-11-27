'use strict';
module.exports = function runTests(D, programSource, appSource) {
  let count = 0;
  function check(value, message) { if (!value) throw new Error(message); count++; }
  function rejects(fn, message) { let rejected = false; try { fn(); } catch { rejected = true; } check(rejected, message); }
  const PROGRAM = new Function(programSource + ';return PROGRAM;')();
  check(D.parseNumber('12,5', 0, 100) === 12.5, 'French decimals');
  check(D.parseNumber('', 0, 2000, false, true) === 0, 'Bodyweight');
  for (const value of ['-1', '1abc', 'Infinity', '<img>', '1e3', '']) rejects(() => D.parseNumber(value, 0, 2000), 'Reject invalid number ' + value);
  rejects(() => D.parseNumber('1.5', 1, 1000, true), 'Integer reps');
  rejects(() => D.parseNumber('6', 1, 5, true), 'Energy limit');
  check(!D.escape('"><img src=x onerror=alert(1)>').includes('<'), 'Escape HTML');
  check(D.remaining(10000, 11000) === 0, 'Expired timer');
  check(D.remaining(10000, 1500) === 9, 'Timer rounds up');
  check(D.week('2026-03-23T10:00:00Z', new Date('2026-03-30T10:00:00Z')) === 2, 'DST week');
  check(D.week('2026-10-19T10:00:00Z', new Date('2026-10-26T10:00:00Z')) === 2, 'Autumn DST');
  const fresh = D.fresh();
  check(D.validate(fresh, PROGRAM).schema === 3, 'Current schema');
  const legacy = {...fresh}; delete legacy.schema;
  check(D.validate(legacy, PROGRAM).schema === 3, 'Legacy migration');
  for (const bad of [null, [], {...fresh, schema:999}, {...fresh, logs:{'<script>':[]}}, {...fresh, cur:{n:99}}, {...fresh, body:[{w:1, kg:-2, cm:90, en:4}]}]) {
    rejects(() => D.validate(bad, PROGRAM), 'Reject bad schema');
  }
  const custom = JSON.parse(JSON.stringify(PROGRAM));
  custom[0].name = 'Mon entraînement'; custom[0].ex[0][0] = '<img src=x onerror=alert(1)>';
  check(D.validateProgram(custom)[0].name === 'Mon entraînement', 'Custom program valid');
  const customState = D.validate({...fresh, program:custom, schedule:[0,1,2,3,4,5,0]}, PROGRAM);
  check(customState.program[0].ex[0][0].startsWith('<img'), 'Editable names treated as text');
  rejects(() => D.validateProgram(custom.map((p,i) => i ? p : {...p,ex:[['__proto__',3,'8–12',90]]})), 'Prototype key rejected');
  rejects(() => D.validateProgram(custom.map((p,i) => i ? p : {...p,ex:[['Test',3,'12–8',90]]})), 'Reversed reps rejected');
  rejects(() => D.validate({...fresh, schedule:[9]}, PROGRAM), 'Invalid schedule rejected');
  rejects(() => D.validateProgram(custom.map((p,i) => i ? p : {...p,ex:[[' constructor ',3,'8–12',90]]})), 'Trimmed prototype key rejected');
  let writes = 0;
  check(!!D.read({getItem(){return '{broken';},setItem(){writes++;}}, PROGRAM).error, 'Corrupt data detected');
  check(writes === 0, 'Corrupt data never overwritten');
  check(!!D.read({getItem(){throw Error('Denied');}}, PROGRAM).error, 'Blocked storage handled');

  function app(seed, failWrites = false) {
    const memory = new Map(seed ? [[D.KEY, JSON.stringify(seed)]] : []);
    const nodes = new Map();
    const node = selector => {
      if (!nodes.has(selector)) nodes.set(selector, {textContent:'', innerHTML:'', hidden:true, style:{}, value:'', focus(){}, classList:{toggle(){}}, setAttribute(){}, removeAttribute(){}});
      return nodes.get(selector);
    };
    const document = {querySelector:node, querySelectorAll:() => [], addEventListener(){}, hidden:false};
    const storage = {getItem:k => memory.get(k) ?? null, setItem(k,v){if(failWrites) throw Error('Quota'); memory.set(k,v);}, removeItem:k => memory.delete(k)};
    const window = {localStorage:storage, addEventListener(){}};
    const make = new Function('SprogData','document','window','navigator','setInterval','confirm','location',
      programSource + '\n' + appSource + '\nreturn {S,V,act,render,tick,importFile, nodes, blocked:()=>storageBlocked};'.replace(', nodes', ''));
    const instance = make(D, document, window, {onLine:true}, () => 0, () => true, {reload(){}});
    return {...instance, nodes, memory, node};
  }
  const customApp = app(customState); customApp.act.day('1');
  check(!customApp.node('#app').innerHTML.includes('<img'), 'Custom exercise escaped on home');
  customApp.act.start('1');
  check(!customApp.node('#app').innerHTML.includes('<img'), 'Custom exercise escaped in session');
  const a = app();
  for (const tab of ['home','seance','prog','suivi','settings','history','complement']) {
    a.V.tab = tab; a.render(); check(a.node('#app').innerHTML.includes('<h1>'), 'Render ' + tab);
  }
  a.act.start('1');
  let row = a.S.cur.sets[0][0];
  row.kg = '20,5'; row.reps = '-2'; a.act.valid();
  check(!row.ok, 'Invalid reps cannot complete series');
  row.reps = '6'; a.act.valid();
  check(row.ok && row.kg === 20.5 && row.reps === 6, 'Series stores numeric values');
  check(a.S.cur.restUntil > Date.now(), 'Absolute timer saved');
  a.act.undo(); check(!row.ok && a.S.cur.restUntil === 0, 'Undo series');
  row.kg = '"><img src=x onerror=alert(1)>'; a.render();
  check(!a.node('#app').innerHTML.includes('<img'), 'Draft input cannot inject HTML');
  row.kg = '30'; a.act.valid();
  a.S.cur.restUntil = Date.now() - 1000; a.tick();
  check(a.node('#rest').textContent === '00:00', 'Finished rest displays zero');
  for (let i=0; i<PROGRAM[0].ex.length; i++) a.act.next();
  check(a.S.cur === null && a.S.done.length === 1, 'Finish session');
  check(a.S.logs[PROGRAM[0].ex[0][0]][0].sets[0].kg === 30, 'History stores completed sets');
  check(D.validate(JSON.parse(a.memory.get(D.KEY)), PROGRAM).done.length === 1, 'Saved session roundtrip');
  a.act.start('2');
  for (let i=0; i<PROGRAM[1].ex.length; i++) a.act.next();
  check(a.S.done.length === 1 && a.S.cur !== null, 'Empty session not counted');
  a.act.drop();
  a.node('#b-kg').value = '92,5'; a.node('#b-cm').value = '95'; a.node('#b-en').value = '8'; a.act.body();
  check(a.S.body.length === 0, 'Invalid body data rejected');
  a.node('#b-en').value = '4'; a.act.body();
  check(a.S.body[0].kg === 92.5, 'Body data saved');
  const quota = app(null, true); quota.act.start('1');
  check(!quota.node('#storage-warning').hidden, 'Quota failure visible');
  const corrupted = app({schema:999});
  check(corrupted.blocked(), 'Corrupt storage blocked');
  corrupted.act.start('1'); check(corrupted.S.cur === null, 'Cannot overwrite corrupt data');
  const life = app(JSON.parse(a.memory.get(D.KEY)));
  life.act.lifetime();
  check(life.S.lifetime && life.S.program.length === 6 && life.S.schedule.join() === '1,2,3,4,5,6,0', 'Permanent six-day programme activates');
  check(life.S.done.length === 1 && life.S.body.length === 1, 'Activation keeps history and body data');
  life.act.day('5');
  check(life.node('#app').innerHTML.includes('Legs B'), 'Sixth session visible');
  check(!life.node('#app').innerHTML.includes('sur 12'), 'No fixed cycle');
  life.V.tab = 'complement'; life.render();
  check(life.node('#app').innerHTML.includes('Isométrie cervicale') && life.node('#app').innerHTML.includes('Dead bug'), 'Complementary exercises visible');
  life.act.start('6');
  check(D.validate(JSON.parse(life.memory.get(D.KEY)), PROGRAM).cur.n === 6, 'Sixth session persists');
  return {count, app};
};
