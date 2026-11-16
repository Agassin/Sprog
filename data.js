/* Shared validation: browser and Node tests, no dependencies. */
(function (root) {
  'use strict';
  const KEY = 'sprog-v1', SCHEMA = 2;
  const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const number = (v, min, max, integer = false) =>
    typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max && (!integer || Number.isInteger(v));
  function parseNumber(value, min, max, integer = false, blank = false) {
    const s = String(value).trim().replace(',', '.');
    if (!s && blank) return 0;
    if (!/^\d+(?:\.\d+)?$/.test(s)) throw new Error('Saisis un nombre positif valide.');
    const n = Number(s);
    if (!number(n, min, max, integer)) throw new Error('Valeur attendue : ' + min + ' à ' + max + (integer ? ', nombre entier.' : '.'));
    return n;
  }
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function monday(now = new Date()) {
    const d = new Date(now); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return d;
  }
  function week(start, now = new Date()) {
    const ordinal = d => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.max(1, Math.round((ordinal(monday(now)) - ordinal(monday(new Date(start)))) / 604800000) + 1);
  }
  const fresh = () => ({schema: SCHEMA, start: monday().toISOString(), logs: {}, done: [], body: [], cur: null});
  function validate(input, program) {
    const fail = () => { throw new Error('Sauvegarde incompatible ou données invalides.'); };
    if (!object(input) || (input.schema !== undefined && input.schema !== SCHEMA)) fail();
    const date = v => typeof v === 'string' && v.length <= 40 && Number.isFinite(Date.parse(v));
    if (!date(input.start) || !object(input.logs) || !Array.isArray(input.done) || !Array.isArray(input.body)) fail();
    const w = n => number(n, 1, 100000, true);
    const set = s => object(s) && number(s.kg, 0, 2000) && number(s.reps, 1, 1000, true);
    const names = new Set(program.flatMap(p => p.ex.map(e => e[0])));
    const out = fresh(); out.start = input.start;
    for (const [name, logs] of Object.entries(input.logs)) {
      if (!names.has(name) || !Array.isArray(logs) || !logs.length || logs.length > 100000) fail();
      out.logs[name] = logs.map(l => {
        if (!object(l) || !date(l.d) || !w(l.w) || !Array.isArray(l.sets) || !l.sets.length || l.sets.length > 100 || !l.sets.every(set)) fail();
        return {d:l.d, w:l.w, sets:l.sets.map(s => ({kg:s.kg, reps:s.reps}))};
      });
    }
    out.done = input.done.map(d => {
      if (!object(d) || !date(d.d) || !w(d.w) || !number(d.n, 1, program.length, true)) fail();
      return {d:d.d, w:d.w, n:d.n};
    });
    out.body = input.body.map(b => {
      if (!object(b) || !w(b.w) || !number(b.kg, 0, 500) || !number(b.cm, 0, 300) || !number(b.en, 0, 5, true)) fail();
      return {w:b.w, kg:b.kg, cm:b.cm, en:b.en};
    });
    if (input.cur != null) {
      const c = input.cur;
      if (!object(c) || !number(c.n, 1, program.length, true)) fail();
      const p = program[c.n - 1];
      if (!number(c.i, 0, p.ex.length - 1, true) || !number(c.t0, 0, 8640000000000000) || !object(c.sets)) fail();
      const sets = {};
      for (const [i, rows] of Object.entries(c.sets)) {
        if (!/^\d+$/.test(i) || !p.ex[+i] || !Array.isArray(rows) || rows.length !== p.ex[+i][1]) fail();
        sets[i] = rows.map(s => {
          if (!object(s) || typeof s.ok !== 'boolean') fail();
          if (s.ok && !set(s)) fail();
          const draft = v => typeof v === 'string' && v.length <= 32 || number(v, 0, 2000);
          if (!s.ok && (!draft(s.kg) || !draft(s.reps))) fail();
          return {kg:s.kg, reps:s.reps, ok:s.ok};
        });
      }
      const restUntil = c.restUntil ?? 0, restMax = c.restMax ?? 1;
      if (!number(restUntil, 0, 8640000000000000) || !number(restMax, 1, 3600)) fail();
      out.cur = {n:c.n, i:c.i, t0:c.t0, sets, restUntil, restMax};
    }
    return out;
  }
  function read(storage, program) {
    try {
      const raw = storage.getItem(KEY);
      return {state:raw === null ? fresh() : validate(JSON.parse(raw), program), error:null};
    } catch (error) { return {state:fresh(), error}; }
  }
  const remaining = (until, now = Date.now()) => Math.max(0, Math.ceil((until - now) / 1000));
  const api = {KEY, SCHEMA, parseNumber, escape, monday, week, fresh, validate, read, remaining};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SprogData = api;
})(globalThis);
