const $ = s => document.querySelector(s), fmt = n => String(n).replace('.', ','), KEY = SprogData.KEY;
const esc = SprogData.escape, mon = SprogData.monday;
let storage;
try { storage = window.localStorage; } catch {}
const loaded = SprogData.read(storage, PROGRAM);
const S = loaded.state;
let storageBlocked = !!loaded.error;
function notice(message) { $('#status').textContent = message; }
function storageWarning(message) { $('#storage-warning').hidden = false; $('#storage-warning').textContent = message; }
function save() {
  if (storageBlocked) { storageWarning('Stockage illisible : les anciennes données sont préservées. Exporte-les dans Réglages avant de restaurer une sauvegarde ou de réinitialiser.'); return false; }
  try { storage.setItem(KEY, JSON.stringify(S)); $('#storage-warning').hidden = true; return true; }
  catch { storageWarning('Enregistrement impossible. Les changements restent en mémoire : exporte une sauvegarde avant de fermer.'); return false; }
}
const week = () => SprogData.week(S.start);
const wc = () => (week() - 1) % 12 + 1, cy = () => Math.floor((week() - 1) / 12) + 1;
const TIPS = [[2, 'Apprends les réglages et la technique. Garde 3 répétitions en réserve ; baisse la charge si nécessaire.'], [6, 'Garde la fourchette de répétitions. Quand toutes les séries atteignent le haut de la fourchette, ajoute le plus petit incrément.'], [10, 'Même méthode. N’ajoute pas de séries si tu progresses déjà.'], [12, 'Évaluation : compare tes performances, ton poids moyen et ton tour de taille. En cas de fatigue persistante, réduis les séries de 30–40 % cette semaine.']];
const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'], MAP = [1, 2, 3, 0, 4, 5, 0], today = () => (new Date().getDay() + 6) % 7;
const V = { tab: 'home', day: today(), ex: null };
let rest = SprogData.remaining(S.cur?.restUntil || 0), restMax = S.cur?.restMax || 1;
function clearRest() { rest = 0; if (S.cur) S.cur.restUntil = 0; }
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
  return `${!S.done.length && !S.cur ? '<section class="card"><p>Bienvenue dans Sprog. Choisis un jour, démarre ta séance et valide chaque série. Pense à exporter tes données dans Réglages.</p></section>' : ''}<p class="lbl mut">Cycle ${cy()} · semaine ${wc()} sur 12</p><h1>${n ? 'Séance ' + n + ' · ' + P.name.split(' — ')[0] : 'Jour de repos'}</h1><div class="bar"><i style="width:${wc() / 12 * 100}%"></i></div><div class="strip">${strip}</div>${card}<p class="mut small">${TIPS.find(t => wc() <= t[0])[1]}</p>`;
}

function seance() {
  const c = S.cur;
  if (!c) { const n = MAP[V.day]; return `<h1>Séance</h1><p class="mut">Aucune séance en cours.</p>${n ? `<button class="cta" data-a="start" data-v="${n}">Commencer la séance ${n}</button>` : ''}`; }
  const P = PROGRAM[c.n - 1], [name, ns, reps, rs] = P.ex[c.i], [lo, hi] = rng(reps), last = lastLog(name);
  const sets = c.sets[c.i] = c.sets[c.i] || Array.from({ length: ns }, (_, k) => ({ kg: (last?.sets[k] || last?.sets.at(-1))?.kg ?? '', reps: '', ok: false }));
  const cur = sets.findIndex(s => !s.ok), lastEx = c.i === P.ex.length - 1;
  const rows = sets.map((s, k) => s.ok
    ? `<div class="set"><span>${k + 1}</span><span>${esc(fmt(s.kg))}</span><span>${esc(s.reps)}</span><i>✓</i></div>`
    : `<div class="set${k === cur ? ' act' : ''}"><span>${k + 1}</span><input inputmode="decimal" aria-label="Charge série ${k + 1}" maxlength="32" value="${esc(fmt(s.kg))}" data-k="${k}" data-f="kg"><input inputmode="numeric" aria-label="Répétitions série ${k + 1}" placeholder="${lo}–${hi}" maxlength="32" value="${esc(s.reps)}" data-k="${k}" data-f="reps"><i></i></div>`).join('');
  const hint = last
    ? `Dernière fois : ${last.sets.map(s => kgTxt(s.kg) + s.reps).join(' · ')}. ${last.sets.every(s => s.reps >= hi) ? 'Tu avais atteint ' + hi + ' partout : augmente légèrement la charge.' : 'Atteins ' + hi + ' sur toutes les séries pour augmenter la charge.'}`
    : 'Première fois : commence léger et soigne la technique.';
  return `<div class="top"><button class="ghost" data-a="quit">‹ Quitter</button><span id="clk" class="clk">${clock(Math.floor((Date.now() - c.t0) / 1000))}</span></div>
<p class="lbl">EXERCICE ${c.i + 1} SUR ${P.ex.length}</p><h1>${name}</h1>
<p class="mut">${ns} × ${reps} · repos ${rs >= 120 ? rs / 60 + ' min' : rs + ' s'} · garde 1–2 reps en réserve</p>
<section class="card rest"><div class="lbl mut">REPOS</div><div id="rest" class="big">${clock(S.cur.restUntil ? rest : rs)}</div><div class="bar"><i id="restbar" style="width:${rest ? rest / restMax * 100 : 0}%"></i></div></section>
<div class="sets"><div class="set hd"><span>SÉRIE</span><span>CHARGE (KG)</span><span>REPS</span><i></i></div>${rows}</div>
<p class="mut small">${hint}</p>
<button class="cta" data-a="${cur < 0 ? 'next' : 'valid'}">${cur < 0 ? (lastEx ? 'Terminer la séance' : 'Exercice suivant') : 'Valider la série ' + (cur + 1)}</button>
<div class="top"><button class="ghost" data-a="previous" ${c.i === 0 ? 'disabled' : ''}>Exercice précédent</button><button class="ghost" data-a="undo" ${sets.some(s => s.ok) ? '' : 'disabled'}>Corriger la dernière série</button></div>
<button class="ghost" data-a="skipRest">Arrêter le repos</button>
<div class="top">${cur >= 0 ? `<button class="ghost" data-a="next">${lastEx ? 'Terminer maintenant' : 'Passer à l’exercice suivant'}</button>` : '<span></span>'}<button class="ghost" data-a="drop">Abandonner</button></div>`;
}

function prog() {
  const names = Object.keys(S.logs), stat = (a, b) => `<div class="card"><b class="big">${a}</b><small class="mut">${b}</small></div>`;
  if (!names.length) return `<h1>Progression</h1><button class="ghost" data-a="history">Voir l’historique des séances</button><p class="mut">Termine une séance pour voir tes courbes.</p><div class="two">${stat(S.done.length, 'séances faites')}</div>`;
  const nm = S.logs[V.ex] ? V.ex : names[0], L = S.logs[nm], pts = L.map(l => Math.max(...l.sets.map(s => s.kg)));
  const mn = Math.min(...pts), sp = (Math.max(...pts) - mn) || 1, X = i => pts.length > 1 ? 20 + i * 310 / (pts.length - 1) : 175, Y = v => 140 - (v - mn) / sp * 100;
  let prs = 0;
  names.forEach(n => { let m = 0; S.logs[n].forEach(l => { const t = Math.max(...l.sets.map(s => s.kg)); if (t > m) { if (m) prs++; m = t; } }); });
  const d = Math.round((pts.at(-1) - pts[0]) * 10) / 10;
  const svg = `<svg viewBox="0 0 350 170" role="img" aria-label="Charge maximale par séance : ${nm}"><polyline points="${pts.map((v, i) => X(i) + ',' + Y(v)).join(' ')}" fill="none" stroke="var(--ac)" stroke-width="3"/>${pts.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="5" fill="${i === pts.length - 1 ? 'var(--ac)' : 'var(--bg)'}" stroke="var(--ac)" stroke-width="3"/>`).join('')}<text x="${X(0)}" y="165">S${L[0].w}</text>${pts.length > 1 ? `<text x="${X(pts.length - 1)}" y="165">S${L.at(-1).w}</text>` : ''}</svg>`;
  return `<h1>Progression</h1><button class="ghost" data-a="history">Voir l’historique des séances</button><select aria-label="Exercice">${names.map(n => `<option${n === nm ? ' selected' : ''}>${n}</option>`).join('')}</select>
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
  start(v) {
    if (S.cur && S.cur.n !== +v && !confirm('Une séance est déjà en cours. La remplacer par la séance ' + v + ' ?')) return;
    if (storageBlocked) return notice('Restaure ou réinitialise les données dans Réglages avant de commencer.');
    if (!S.cur || S.cur.n !== +v) { clearRest(); S.cur = { n: +v, i: 0, sets: {}, t0: Date.now(), restUntil: 0, restMax: 1 }; } V.tab = 'seance'; save(); render(); },
  quit() { V.tab = 'home'; render(); },
  drop() { if (confirm('Abandonner la séance en cours ?')) { clearRest(); S.cur = null; V.tab = 'home'; save(); render(); } },
  valid() {
    const c = S.cur; if (!c) return;
    const x = c.sets[c.i].find(y => !y.ok); if (!x) return;
    try {
      const reps = SprogData.parseNumber(x.reps, 1, 1000, true);
      const kg = SprogData.parseNumber(x.kg, 0, 2000, false, true);
      Object.assign(x, {kg, reps, ok:true});
    } catch (error) { return notice(error.message); }
    rest = restMax = PROGRAM[c.n - 1].ex[c.i][3];
    c.restUntil = Date.now() + rest * 1000; c.restMax = restMax;
    const saved = save(); render(); notice(saved ? 'Série enregistrée.' : 'Série en mémoire uniquement. Exporte une sauvegarde.');
  },
  next() {
    const c = S.cur; if (!c) return;
    const P = PROGRAM[c.n - 1];
    if ((c.sets[c.i] || []).some(s => !s.ok) && !confirm('Continuer sans enregistrer les séries non validées ?')) return;
    clearRest();
    if (c.i < P.ex.length - 1) { c.i++; save(); return render(); }
    if (!Object.values(c.sets).some(rows => rows.some(s => s.ok))) return notice('Valide au moins une série ou abandonne cette séance.');
    const d = new Date().toISOString();
    P.ex.forEach((e, i) => { const ss = (c.sets[i] || []).filter(s => s.ok); if (ss.length) (S.logs[e[0]] = S.logs[e[0]] || []).push({ d, w: week(), sets: ss.map(s => ({ kg: s.kg, reps: s.reps })) }); });
    S.done.push({ w: week(), n: c.n, d }); S.cur = null; V.tab = 'home'; save(); render();
  },
  body() {
    const w = week(); let entry;
    try {
      entry = {w, kg:SprogData.parseNumber($('#b-kg').value, 1, 500, false, true),
        cm:SprogData.parseNumber($('#b-cm').value, 1, 300, false, true),
        en:SprogData.parseNumber($('#b-en').value, 1, 5, true, true)};
    } catch (error) { return notice(error.message); }
    if (!entry.kg && !entry.cm && !entry.en) return notice('Renseigne au moins une mesure.');
    S.body = S.body.filter(b => b.w !== w); S.body.push(entry); const saved = save(); render();
    notice(saved ? 'Mesures enregistrées.' : 'Mesures en mémoire uniquement.');
  }
};

const views = { home, seance, prog, suivi, settings, history };
function render() {
  $('#app').innerHTML = views[V.tab]();
  document.querySelectorAll('nav button').forEach(b => {
    b.classList.toggle('on', b.dataset.t === V.tab);
    if (b.dataset.t === V.tab) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  const heading = $('#app h1');
  if (heading) { heading.tabIndex = -1; heading.focus({preventScroll:true}); }
}
document.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b) act[b.dataset.a]?.(b.dataset.v); });
document.addEventListener('input', e => { const t = e.target; if (t.dataset.f && S.cur) { S.cur.sets[S.cur.i][t.dataset.k][t.dataset.f] = t.value.slice(0, 32); save(); } });
document.addEventListener('change', e => { if (V.tab === 'prog' && e.target.matches('select')) { V.ex = e.target.value; render(); } });
document.querySelectorAll('nav button').forEach(b => b.onclick = () => { V.tab = b.dataset.t; render(); });
function tick() {
  const previous = rest; rest = SprogData.remaining(S.cur?.restUntil || 0);
  if (previous > 0 && !rest) { if (typeof navigator.vibrate === 'function') { try { navigator.vibrate(400); } catch {} } notice('Repos terminé.'); }
  if (V.tab === 'seance' && S.cur) {
    $('#clk').textContent = clock(Math.max(0, Math.floor((Date.now() - S.cur.t0) / 1000)));
    $('#rest').textContent = clock(S.cur.restUntil ? rest : PROGRAM[S.cur.n - 1].ex[S.cur.i][3]);
    $('#restbar').style.width = Math.min(100, rest / restMax * 100) + '%';
  }
}
setInterval(tick, 1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });

function download(filename, content, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], {type}));
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function settings() {
  return '<h1>Réglages</h1><section class="card"><h2>Installation</h2><p>Android : utilise le menu du navigateur puis « Installer l’application ». Sur iPhone : ouvre Sprog dans Safari, puis Partager → Sur l’écran d’accueil.</p><button class="cta" data-a="install"' + (installPrompt ? '' : ' disabled') + '>Installer Sprog</button><p class="small mut">Le mode hors ligne devient disponible après le premier chargement complet en ligne. Le repos reprend à la bonne heure après une veille ; aucune alarme n’est garantie lorsque l’application est fermée.</p></section>' +
    '<section class="card form"><h2>Mes données</h2><p>Les séances et mesures restent dans ce navigateur. Une suppression des données du site ou un changement de téléphone peut les effacer. Exporte régulièrement une copie.</p><button class="cta" data-a="export">Exporter une sauvegarde</button><label>Restaurer une sauvegarde JSON (5 Mo maximum)<input id="import-file" type="file" accept=".json,application/json"></label><button class="ghost" data-a="raw">Exporter les données brutes sauvegardées</button><button class="ghost" data-a="recover">Restaurer la copie avant import</button><button class="ghost danger" data-a="reset">Effacer toutes mes données</button></section>' +
    '<section class="card"><h2>Confidentialité</h2><p>Aucun compte, publicité, outil d’analyse ou envoi de tes mesures à un serveur n’est intégré. Les données locales et les exports ne sont pas chiffrés par Sprog : protège ton appareil et tes fichiers. L’hébergeur reçoit les requêtes nécessaires au chargement du site.</p><p><a href="privacy.html">Lire les informations de confidentialité</a></p></section>' +
    '<section class="card"><h2>Aide</h2><p>Une charge vide correspond à 0 kg (poids du corps). Seules les séries validées sont ajoutées à l’historique. « Quitter » garde la séance en cours ; « Abandonner » la supprime.</p><p><a href="https://github.com/Agassin/Sprog/issues" target="_blank" rel="noopener noreferrer">Signaler un problème</a> — n’inclus pas de données personnelles dans un signalement public.</p><p class="small mut">Sprog 2.0 · stockage local · programme fixe</p></section>';
}
function history() {
  const sessions = [...S.done].reverse();
  return '<h1>Historique</h1>' + (sessions.length ? sessions.map(d => {
    const entries = Object.entries(S.logs).flatMap(([name, logs]) => logs.filter(l => l.d === d.d).map(l =>
      '<li><span>' + esc(name) + '</span><span>' + l.sets.map(s => esc(kgTxt(s.kg) + s.reps)).join(' · ') + '</span></li>')).join('');
    return '<details class="card"><summary>' + esc(new Date(d.d).toLocaleDateString('fr-FR')) + ' · ' + esc(PROGRAM[d.n - 1].name) + ' · S' + d.w + '</summary><ul>' + entries + '</ul></details>';
  }).join('') : '<p class="mut">Aucune séance terminée pour le moment.</p>') + '<button class="ghost" data-a="backProgress">Retour à la progression</button>';
}
Object.assign(act, {
  previous() { if (S.cur?.i > 0) { clearRest(); S.cur.i--; save(); render(); } },
  undo() {
    if (!S.cur) return;
    const rows = S.cur.sets[S.cur.i], index = rows.map(s => s.ok).lastIndexOf(true);
    if (index >= 0) { rows[index].ok = false; clearRest(); save(); render(); notice('Série modifiable.'); }
  },
  skipRest() { clearRest(); save(); render(); },
  history() { V.tab = 'history'; render(); },
  backProgress() { V.tab = 'prog'; render(); },
  export() {
    download('sprog-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify({app:'Sprog', version:2, exportedAt:new Date().toISOString(), data:S}, null, 2));
    notice('Export préparé. Conserve le fichier dans un endroit privé.');
  },
  raw() {
    try {
      const raw = storage.getItem(KEY); if (raw === null) return notice('Aucune donnée sauvegardée.');
      download('sprog-donnees-brutes.json', raw); notice('Export brut préparé.');
    } catch { notice('Le navigateur refuse l’accès au stockage.'); }
  },
  recover() {
    try {
      const raw = storage.getItem(KEY + '-avant-import');
      if (!raw) return notice('Aucune copie avant import disponible.');
      const next = SprogData.validate(JSON.parse(raw), PROGRAM);
      if (!confirm('Remplacer les données actuelles par la copie avant import ? Exporte d’abord les données actuelles si nécessaire.')) return;
      storage.setItem(KEY, JSON.stringify(next));
      Object.assign(S, next); storageBlocked = false; syncRest(); render(); $('#storage-warning').hidden = true;
      notice('Copie restaurée.');
    } catch { notice('Copie illisible ou stockage indisponible. Aucune donnée remplacée.'); }
  },
  reset() {
    if (!confirm('Effacer toutes les séances, mesures et copies locales de Sprog ? Cette action est irréversible. Exporte une sauvegarde avant de continuer.')) return;
    const next = SprogData.fresh();
    try {
      storage.removeItem(KEY + '-avant-import'); storage.removeItem(KEY + '-corrompu');
      storage.setItem(KEY, JSON.stringify(next));
    } catch { return notice('Effacement incomplet : utilise les réglages de ton navigateur pour supprimer les données du site.'); }
    Object.assign(S, next); storageBlocked = false; syncRest(); $('#storage-warning').hidden = true; render(); notice('Données effacées.');
  },
  async install() {
    if (!installPrompt) return;
    await installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; render();
  },
  update() {
    if (S.cur) return notice('Termine ou abandonne la séance avant la mise à jour.');
    if (!save()) return;
    if (waitingWorker) { updating = true; waitingWorker.postMessage({type:'SKIP_WAITING'}); }
  }
});
function syncRest() { rest = SprogData.remaining(S.cur?.restUntil || 0); restMax = S.cur?.restMax || 1; }
async function importFile(file) {
  if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024) throw new Error('Fichier trop volumineux (maximum 5 Mo).');
    const parsed = JSON.parse(await file.text());
    if (parsed.app !== undefined && (parsed.app !== 'Sprog' || parsed.version !== 2)) throw new Error('Format de sauvegarde non pris en charge.');
    const next = SprogData.validate(parsed.app === 'Sprog' ? parsed.data : parsed, PROGRAM);
    if (!confirm('Remplacer toutes les données par cette sauvegarde ? Les données actuellement enregistrées seront conservées dans une copie avant import.')) return;
    const previous = storage.getItem(KEY);
    if (previous !== null) storage.setItem(KEY + '-avant-import', previous);
    storage.setItem(KEY, JSON.stringify(next));
    Object.assign(S, next); storageBlocked = false; syncRest(); $('#storage-warning').hidden = true; render(); notice('Sauvegarde restaurée.');
  } catch (error) { notice('Import refusé : ' + error.message); }
}
document.addEventListener('change', e => { if (e.target.id === 'import-file') { importFile(e.target.files[0]); e.target.value = ''; } });
let installPrompt = null, waitingWorker = null, updating = false;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; if (V.tab === 'settings') render(); });
window.addEventListener('appinstalled', () => { installPrompt = null; notice('Sprog est installé.'); });
function networkStatus() { $('#network').hidden = navigator.onLine; }
window.addEventListener('online', networkStatus); window.addEventListener('offline', networkStatus); networkStatus();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (updating) location.reload(); });
  navigator.serviceWorker.register('sw.js').then(registration => {
    function offer() { if (registration.waiting && navigator.serviceWorker.controller) { waitingWorker = registration.waiting; $('#update-banner').hidden = false; } }
    offer();
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => { if (worker.state === 'installed') offer(); });
    });
  }).catch(() => notice('Le mode hors ligne n’a pas pu être activé. Réessaie en ligne sur une connexion HTTPS.'));
}
window.addEventListener('storage', e => {
  if (e.key === KEY) { storageBlocked = true; storageWarning('Les données ont changé dans une autre fenêtre. Exporte tes changements si nécessaire, puis recharge pour éviter de les écraser.'); }
});
render();
if (storageBlocked) storageWarning('Données illisibles ou stockage indisponible. Les données originales sont préservées. Ouvre Réglages pour exporter les données brutes ou restaurer une sauvegarde.');
