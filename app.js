const $ = s => document.querySelector(s), fmt = n => String(n).replace('.', ','), KEY = 'sprog-v1';
const mon = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return d; };
const S = { start: mon().toISOString(), logs: {}, done: [], body: [], cur: null, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
const save = () => localStorage.setItem(KEY, JSON.stringify(S));
const week = () => Math.max(1, Math.round((mon() - new Date(S.start)) / 6048e5) + 1);
const wc = () => (week() - 1) % 12 + 1, cy = () => Math.floor((week() - 1) / 12) + 1;
const TIPS = [[2, 'Apprends les réglages et la technique. Garde 3 répétitions en réserve ; baisse la charge si nécessaire.'], [6, 'Garde la fourchette de répétitions. Quand toutes les séries atteignent le haut de la fourchette, ajoute le plus petit incrément.'], [10, 'Même méthode. N’ajoute pas de séries si tu progresses déjà.'], [12, 'Évaluation : compare tes performances, ton poids moyen et ton tour de taille. En cas de fatigue persistante, réduis les séries de 30–40 % cette semaine.']];
const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'], MAP = [1, 2, 3, 0, 4, 5, 0], today = () => (new Date().getDay() + 6) % 7;
const V = { tab: 'home', day: today(), ex: null };
let rest = 0, restMax = 1;
const rng = r => { const m = r.match(/\d+/g); return [+m[0], +m[m.length - 1]]; };
const lastLog = n => (S.logs[n] || []).at(-1);
const clock = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const kgTxt = k => k > 0 ? `${fmt(k)} kg × ` : '';

function home() {
  const w = week(), n = MAP[V.day], P = PROGRAM[n - 1], m = mon();
  const strip = DAYS.map((l, i) => {
    const t = MAP[i], ok = t && S.done.some(x => x.w === w && x.n === t), d = new Date(m); d.setDate(d.getDate() + i);
    return `<button class="day${ok ? ' ok' : ''}${i === today() ? ' today' : ''}${i === V.day ? ' sel' : ''}" data-a="day" data-v="${i}"><small>${l}</small><b>${d.getDate()}</b></button>`;
  }).join('');
  const card = n
    ? `<section class="card"><div class="lbl">SÉANCE ${n}</div><h2>${P.name}</h2><p class="mut">${P.ex.length} exercices · ${P.dur}</p><ul>${P.ex.map(e => `<li><span>${e[0]}</span><span class="mut">${e[1]} × ${e[2]}</span></li>`).join('')}</ul><button class="cta" data-a="start" data-v="${n}">${S.cur && S.cur.n === n ? 'Reprendre la séance' : 'Commencer la séance'}</button></section>`
    : `<section class="card"><h2>${V.day === 3 ? 'Repos actif' : 'Repos'}</h2><p class="mut">${V.day === 3 ? 'Marche ou cardio facile, 20–35 min.' : 'Récupération, marche facultative.'}</p></section>`;
  return `<p class="lbl mut">Cycle ${cy()} · semaine ${wc()} sur 12</p><h1>${n ? 'Séance ' + n + ' · ' + P.name.split(' — ')[0] : 'Jour de repos'}</h1><div class="bar"><i style="width:${wc() / 12 * 100}%"></i></div><div class="strip">${strip}</div>${card}<p class="mut small">${TIPS.find(t => wc() <= t[0])[1]}</p>`;
}

function seance() {
  const c = S.cur;
  if (!c) { const n = MAP[V.day]; return `<h1>Séance</h1><p class="mut">Aucune séance en cours.</p>${n ? `<button class="cta" data-a="start" data-v="${n}">Commencer la séance ${n}</button>` : ''}`; }
  const P = PROGRAM[c.n - 1], [name, ns, reps, rs] = P.ex[c.i], [lo, hi] = rng(reps), last = lastLog(name);
  const sets = c.sets[c.i] = c.sets[c.i] || Array.from({ length: ns }, (_, k) => ({ kg: (last?.sets[k] || last?.sets.at(-1))?.kg ?? '', reps: '', ok: false }));
  const cur = sets.findIndex(s => !s.ok), lastEx = c.i === P.ex.length - 1;
  const rows = sets.map((s, k) => s.ok
    ? `<div class="set"><span>${k + 1}</span><span>${fmt(s.kg)}</span><span>${s.reps}</span><i>✓</i></div>`
    : `<div class="set${k === cur ? ' act' : ''}"><span>${k + 1}</span><input inputmode="decimal" aria-label="Charge série ${k + 1}" value="${fmt(s.kg)}" data-k="${k}" data-f="kg"><input inputmode="numeric" aria-label="Répétitions série ${k + 1}" placeholder="${lo}–${hi}" value="${s.reps}" data-k="${k}" data-f="reps"><i></i></div>`).join('');
  const hint = last
    ? `Dernière fois : ${last.sets.map(s => kgTxt(s.kg) + s.reps).join(' · ')}. ${last.sets.every(s => s.reps >= hi) ? 'Tu avais atteint ' + hi + ' partout : augmente légèrement la charge.' : 'Atteins ' + hi + ' sur toutes les séries pour augmenter la charge.'}`
    : 'Première fois : commence léger et soigne la technique.';
  return `<div class="top"><button class="ghost" data-a="quit">‹ Quitter</button><span id="clk" class="clk">${clock(Math.floor((Date.now() - c.t0) / 1000))}</span></div>
<p class="lbl">EXERCICE ${c.i + 1} SUR ${P.ex.length}</p><h1>${name}</h1>
<p class="mut">${ns} × ${reps} · repos ${rs >= 120 ? rs / 60 + ' min' : rs + ' s'} · garde 1–2 reps en réserve</p>
<section class="card rest"><div class="lbl mut">REPOS</div><div id="rest" class="big">${clock(rest || rs)}</div><div class="bar"><i id="restbar" style="width:${rest ? rest / restMax * 100 : 0}%"></i></div></section>
<div class="sets"><div class="set hd"><span>SÉRIE</span><span>CHARGE (KG)</span><span>REPS</span><i></i></div>${rows}</div>
<p class="mut small">${hint}</p>
<button class="cta" data-a="${cur < 0 ? 'next' : 'valid'}">${cur < 0 ? (lastEx ? 'Terminer la séance' : 'Exercice suivant') : 'Valider la série ' + (cur + 1)}</button>
<div class="top">${cur >= 0 ? `<button class="ghost" data-a="next">${lastEx ? 'Terminer maintenant' : 'Passer à l’exercice suivant'}</button>` : '<span></span>'}<button class="ghost" data-a="drop">Abandonner</button></div>`;
}

function prog() {
  const names = Object.keys(S.logs), stat = (a, b) => `<div class="card"><b class="big">${a}</b><small class="mut">${b}</small></div>`;
  if (!names.length) return `<h1>Progression</h1><p class="mut">Termine une séance pour voir tes courbes.</p><div class="two">${stat(S.done.length, 'séances faites')}</div>`;
  const nm = S.logs[V.ex] ? V.ex : names[0], L = S.logs[nm], pts = L.map(l => Math.max(...l.sets.map(s => s.kg)));
  const mn = Math.min(...pts), sp = (Math.max(...pts) - mn) || 1, X = i => pts.length > 1 ? 20 + i * 310 / (pts.length - 1) : 175, Y = v => 140 - (v - mn) / sp * 100;
  let prs = 0;
  names.forEach(n => { let m = 0; S.logs[n].forEach(l => { const t = Math.max(...l.sets.map(s => s.kg)); if (t > m) { if (m) prs++; m = t; } }); });
  const d = Math.round((pts.at(-1) - pts[0]) * 10) / 10;
  const svg = `<svg viewBox="0 0 350 170" role="img" aria-label="Charge maximale par séance : ${nm}"><polyline points="${pts.map((v, i) => X(i) + ',' + Y(v)).join(' ')}" fill="none" stroke="var(--ac)" stroke-width="3"/>${pts.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="5" fill="${i === pts.length - 1 ? 'var(--ac)' : 'var(--bg)'}" stroke="var(--ac)" stroke-width="3"/>`).join('')}<text x="${X(0)}" y="165">S${L[0].w}</text>${pts.length > 1 ? `<text x="${X(pts.length - 1)}" y="165">S${L.at(-1).w}</text>` : ''}</svg>`;
  return `<h1>Progression</h1><select aria-label="Exercice">${names.map(n => `<option${n === nm ? ' selected' : ''}>${n}</option>`).join('')}</select>
<div><b class="big">${fmt(pts.at(-1))} <small>kg</small></b><p class="acc">${pts.length > 1 ? (d >= 0 ? '+' : '') + fmt(d) + ' kg depuis S' + L[0].w : 'Première séance enregistrée'}</p></div>${svg}
<div class="two">${stat(prs, 'records battus')}${stat(S.done.length, 'séances faites')}</div>`;
}

function suivi() {
  const w = week(), e = S.body.find(b => b.w === w) || {};
  return `<h1>Suivi</h1><p class="mut">Semaine ${w} (cycle ${cy()}, semaine ${wc()} sur 12) : poids moyen, tour de taille et forme.</p>
<section class="card form"><label>Poids moyen (kg)<input id="b-kg" inputmode="decimal" value="${e.kg ? fmt(e.kg) : ''}"></label><label>Tour de taille (cm)<input id="b-cm" inputmode="decimal" value="${e.cm ? fmt(e.cm) : ''}"></label><label>Énergie / récupération (1–5)<input id="b-en" inputmode="numeric" value="${e.en || ''}"></label><button class="cta" data-a="body">Enregistrer</button></section>
<ul class="hist">${[...S.body].sort((a, b) => b.w - a.w).map(b => `<li><span>S${b.w}</span><span>${b.kg ? fmt(b.kg) + ' kg' : '—'} · ${b.cm ? fmt(b.cm) + ' cm' : '—'} · énergie ${b.en || '—'}/5</span></li>`).join('')}</ul>`;
}

const act = {
  day(v) { V.day = +v; render(); },
  start(v) { if (!S.cur || S.cur.n !== +v) S.cur = { n: +v, i: 0, sets: {}, t0: Date.now() }; V.tab = 'seance'; save(); render(); },
  quit() { V.tab = 'home'; render(); },
  drop() { if (confirm('Abandonner la séance en cours ?')) { S.cur = null; rest = 0; V.tab = 'home'; save(); render(); } },
  valid() {
    const c = S.cur, s = c.sets[c.i], x = s.find(y => !y.ok), reps = parseInt(x.reps);
    if (!reps) return alert('Indique le nombre de répétitions.');
    x.kg = parseFloat(String(x.kg).replace(',', '.')) || 0; x.reps = reps; x.ok = true;
    rest = restMax = PROGRAM[c.n - 1].ex[c.i][3]; save(); render();
  },
  next() {
    const c = S.cur, P = PROGRAM[c.n - 1]; rest = 0;
    if (c.i < P.ex.length - 1) { c.i++; save(); return render(); }
    const d = new Date().toISOString();
    P.ex.forEach((e, i) => { const ss = (c.sets[i] || []).filter(s => s.ok); if (ss.length) (S.logs[e[0]] = S.logs[e[0]] || []).push({ d, w: week(), sets: ss.map(s => ({ kg: s.kg, reps: s.reps })) }); });
    S.done.push({ w: week(), n: c.n, d }); S.cur = null; V.tab = 'home'; save(); render();
  },
  body() {
    const g = id => parseFloat($('#' + id).value.replace(',', '.')) || 0, w = week();
    S.body = S.body.filter(b => b.w !== w); S.body.push({ w, kg: g('b-kg'), cm: g('b-cm'), en: g('b-en') }); save(); render();
  }
};

const views = { home, seance, prog, suivi };
function render() {
  $('#app').innerHTML = views[V.tab]();
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.t === V.tab));
}
document.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) act[b.dataset.a]?.(b.dataset.v); });
document.addEventListener('input', e => { const t = e.target; if (t.dataset.f && S.cur) { S.cur.sets[S.cur.i][t.dataset.k][t.dataset.f] = t.value; save(); } });
document.addEventListener('change', e => { if (e.target.matches('select')) { V.ex = e.target.value; render(); } });
document.querySelectorAll('nav button').forEach(b => b.onclick = () => { V.tab = b.dataset.t; render(); });
setInterval(() => {
  if (rest > 0 && !--rest) navigator.vibrate?.(400);
  if (V.tab === 'seance' && S.cur) {
    $('#clk').textContent = clock(Math.floor((Date.now() - S.cur.t0) / 1000));
    $('#rest').textContent = clock(rest || PROGRAM[S.cur.n - 1].ex[S.cur.i][3]);
    $('#restbar').style.width = (rest ? rest / restMax * 100 : 0) + '%';
  }
}, 1000);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
render();
