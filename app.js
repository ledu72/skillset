/* Skillset: sajt u stilu "film na skrol", isti tok za svaki projekat (podaci u projekti.js)
   1. karta Srbije → 2. let do parcele + gradnja (AI kadrovi) → 3. gotova zgrada, mere na fasadi → ulaz → lift → obilazak stana
   Kadrovi se prave skriptom tools/build-film.js iz klipova u za-ai/. */

const LOKACIJE = [
  { id: 'zlatibor', naziv: 'Zlatibor', status: 'predprodaja' },
  { id: 'lestane', naziv: 'Leštane', status: 'izgradnja' },
  { id: 'visnjica', naziv: 'Višnjica', status: 'predprodaja' },
  { id: 'kopaonik', naziv: 'Kopaonik', status: 'predprodaja' },
  { id: 'park', naziv: 'Ćuprija', status: 'izgradnja' },
  { id: 'podujevska', naziv: 'Podujevska', status: 'useljivo' },
  { id: 'francuska', naziv: 'Francuska 21', status: 'useljivo' },
  { id: 'vmaslese', naziv: 'Veselina Masleše 51', status: 'useljivo' },
  { id: 'beograd', naziv: 'Beograd', status: 'useljivo' }
];
const STATUS = { useljivo: 'Useljivo', izgradnja: 'U izgradnji', predprodaja: 'Predprodaja' };
const $ = id => document.getElementById(id);

const stage = document.querySelector('.stage');
const crumb = $('crumb');
// prelaz bez crnog međukadra: stara scena ostaje cela ispod dok nova ne izađe preko nje
let prelaz;
const scena = (s, c) => {
  const stara = stage.querySelector('.scene-' + stage.dataset.scene), nova = stage.querySelector('.scene-' + s);
  if (stara && stara !== nova) {
    stage.querySelectorAll('.scene').forEach(x => { x.classList.remove('ispod'); x.style.zIndex = ''; });
    stara.classList.add('ispod'); nova.style.zIndex = 2;
    clearTimeout(prelaz); prelaz = setTimeout(() => { stara.classList.remove('ispod'); nova.style.zIndex = ''; }, 1050);
  }
  stage.dataset.scene = s; crumb.textContent = c;
};

let P = null;          // trenutni projekat
let F = {};            // nizovi kadrova trenutnog projekta: film, stan, ulaz

/* ---------- 1. Karta Srbije ---------- */
const wrap = $('srbija');
let svg;
fetch('mapa-srbije.svg').then(r => r.text()).then(t => {
  wrap.innerHTML = t;
  svg = wrap.querySelector('svg');
  svg.removeAttribute('width'); svg.removeAttribute('height');
  LOKACIJE.forEach(l => svg.querySelector('#pin-' + l.id)?.addEventListener('click', () => izaberi(l)));
  const h = location.hash.slice(1);
  if (PROJEKTI[h]) izaberi(LOKACIJE.find(l => l.id === h));
});
const list = $('locList');
list.innerHTML = LOKACIJE.map(l => `<li><button data-id="${l.id}">${l.naziv}<small><i class="dot dot-${l.status}"></i>${PROJEKTI[l.id] ? STATUS[l.status] : 'Uskoro'}</small></button></li>`).join('');
list.addEventListener('click', e => { const b = e.target.closest('button'); if (b) izaberi(LOKACIJE.find(l => l.id === b.dataset.id)); });
list.addEventListener('mouseover', e => { const b = e.target.closest('button'); svg?.querySelectorAll('.pin').forEach(p => p.classList.toggle('on', b && p.id === 'pin-' + b.dataset.id)); });

function izaberi(l) {
  if (!svg || !PROJEKTI[l.id]) return;
  postaviProjekat(l.id);
  const dot = svg.querySelector(`#pin-${l.id} circle:nth-child(2)`);
  const cx = +dot.getAttribute('cx'), cy = +dot.getAttribute('cy');
  const f = [0, 0, 1600, 2108], w = 120, h = w * f[3] / f[2], to = [cx - w / 2, cy - h / 2, w, h];
  const t0 = performance.now(), D = 1500, ease = t => 1 - Math.pow(1 - t, 4);
  stage.classList.add('zooming');
  const step = now => {
    const p = ease(Math.min(1, (now - t0) / D));
    svg.setAttribute('viewBox', f.map((v, i) => v + (to[i] - v) * p).join(' '));
    if (p < 1) requestAnimationFrame(step); else F.film.prvi.then(uFilm);   // film tek kad stigne prvi kadar, da ne bude prazan ekran
  };
  requestAnimationFrame(step);
  F.film.ucitaj();
}

/* ---------- Niz kadrova vezan za skrol ---------- */
function NizKadrova(base, canvas) {
  const o = { canvas, ctx: canvas.getContext('2d'), frames: [], N: 0, seg: [], p: 0, target: 0, run: false, ready: null, onDraw: null };
  o.ready = base ? fetch(`${base}/manifest.json`).then(r => r.json()).then(m => { o.N = m.broj; o.seg = m.segmenti; }).catch(() => {}) : Promise.resolve();
  let gotov; o.prvi = new Promise(r => gotov = r); o.ready.then(() => { if (!o.N) gotov(); });
  o.ucitaj = () => o.ready.then(() => {
    if (o.frames.length || !o.N) return;
    for (let i = 1; i <= o.N; i++) { const im = new Image(); im.onload = () => { if (i === 1) { o.crtaj(); gotov(); } }; im.src = `${base}/f_${String(i).padStart(4, '0')}.jpg`; o.frames.push(im); }
  });
  o.velicina = () => { const d = Math.min(devicePixelRatio || 1, 2); canvas.width = innerWidth * d; canvas.height = innerHeight * d; o.crtaj(); };
  o.crtaj = () => {
    if (!Object.values(F).includes(o)) return;              // samo nizovi trenutnog projekta crtaju
    if (!o.N) return o.onDraw?.(o);
    const idx = Math.round(o.p * (o.N - 1));
    let im = o.frames[idx];
    for (let d = 1; im && !im.complete && d < o.N; d++) im = o.frames[idx - d] || o.frames[idx + d];
    if (im?.complete && im.naturalWidth) {
      const c = canvas;
      // odzumiranje tokom gradnje: kadar kreće krupno i polako se udaljava dok zgrada raste
      const z = o.zoom ? o.zoom(idx) : { k: 1, cx: .5, cy: .5 };
      // telefon (uspravno): kadar preko celog ekrana, bez dodatnog zuma
      const port = c.height > c.width;
      const base = Math.max(c.width / im.naturalWidth, c.height / im.naturalHeight);
      const s = base * (port ? 1 : z.k), w = im.naturalWidth * s, h = im.naturalHeight * s;
      o.ctx.fillStyle = '#0b0b0a'; o.ctx.fillRect(0, 0, c.width, c.height);
      // pomeraj ograničen tako da nikad ne ostane prazna traka
      const x = Math.min(0, Math.max(c.width - w, c.width / 2 - w * (port ? P.mobX / 100 : z.cx)));
      let y = port ? 0 : Math.min(0, Math.max(c.height - h, c.height / 2 - h * z.cy));
      o.ctx.drawImage(im, x, y, w, h);
      // kraj filma: pretapanje u pravi render, cela zgrada u kadru (kao scena izbora), sa zamućenim nastavkom sa strane
      const end = $('zImg');
      // kraj filma: pretapanje u oštru fotografiju gotove zgrade preko celog ekrana (isti kadar kao sledeća scena)
      if (z.fit && !port && end.complete && end.naturalWidth) {
        const es = Math.max(c.width / end.naturalWidth, c.height / end.naturalHeight), ew = end.naturalWidth * es, eh = end.naturalHeight * es;
        o.ctx.globalAlpha = z.fit;
        o.ctx.drawImage(end, (c.width - ew) / 2, (c.height - eh) / 2, ew, eh);
        o.ctx.globalAlpha = 1;
      }
    }
    o.onDraw?.(o);
  };
  const loop = () => { o.p += (o.target - o.p) * .12; if (Math.abs(o.target - o.p) < .0005) o.p = o.target; o.crtaj(); if (o.p !== o.target) requestAnimationFrame(loop); else o.run = false; };
  o.idi = t => { o.target = Math.min(1, Math.max(0, t)); if (!o.run) { o.run = true; requestAnimationFrame(loop); } };
  addEventListener('resize', o.velicina);
  return o;
}

/* Odzumiranje tokom gradnje (od prvog kadra "Iskop" do kraja):
   kreće krupno na temeljima (dole), pa se kamera penje i udaljava dok ne uhvati vrh zgrade;
   na kraju (fit → 1) kadar je identičan slici gotove zgrade u sledećoj sceni */
function zoomGradnje(idx) {
  const seg = F.film.seg, start = seg.find(s => /Iskop|Konstrukcija|Rekonstrukcija/.test(s.faza))?.od ?? 0, end = F.film.N - 1;
  if (idx < start && /dron|lokacij/i.test(seg[0]?.faza)) return { k: 1, cx: .5, cy: .5, fit: 0 };   // satelit i dron bez dodatnog zuma
  const t = Math.max(0, Math.min(1, (idx - start) / Math.max(1, end - start)));
  const e = 1 - Math.pow(1 - t, 2);
  return { k: 1.18 - .18 * e, cx: .5, cy: .66 - .38 * e, fit: Math.max(0, (e - .75) / .25) };
}

/* HUD za film */
function hudFilma(o) {
  const idx = Math.round(o.p * (o.N - 1));
  const si = Math.max(0, o.seg.findIndex(s => idx >= s.od && idx <= s.do));
  const f = $('faza');
  if (o.seg[si] && f.textContent !== o.seg[si].faza) f.textContent = o.seg[si].faza;
  document.querySelectorAll('#faze li').forEach((li, i) => { li.classList.toggle('on', i === si); li.classList.toggle('done', i < si); });
  $('bar').style.width = (o.p * 100).toFixed(1) + '%';
  $('hint').textContent = o.p > .99 ? 'Skrolujte dalje do zgrade ↓' : o.p < .01 ? 'Skrolujte ↓' : 'Skrol gore vraća unazad ↑';
}

/* Obilazak stana: klip ako postoji, inače pretapanje kroz slike stana */
let TURA = { slike: [] };
function hudStana(o) {
  $('stanBar').style.width = (o.p * 100).toFixed(1) + '%';
  const sl = TURA.slike, n = sl.length, imgs = $('stanSlike').children;
  const klip = !!o.N;
  if (klip) { $('stanFaza').textContent = o.p < .5 ? sl[0]?.[1] || '' : sl[1]?.[1] || ''; [...imgs].forEach(i => i.style.opacity = 0); return; }
  // prelaz kao ulazak u sobu: trenutna slika se uvećava ka sredini i nestaje, sledeća se otvara iz blagog uvećanja
  const pos = o.p * (n - 1), cur = Math.min(n - 1, Math.floor(pos)), t = pos - cur, e = t * t * (3 - 2 * t);
  [...imgs].forEach((im, i) => {
    let op = 0, sc = 1;
    if (i === cur) { op = 1 - Math.max(0, (e - .45) / .55); sc = 1 + e * 1.4; }
    else if (i === cur + 1) { op = Math.min(1, Math.max(0, (e - .35) / .5)); sc = 1.25 - .25 * e; }
    im.style.opacity = op.toFixed(3);
    im.style.transform = 'scale(' + sc.toFixed(3) + ')';
    im.style.zIndex = i === cur ? 2 : 1;
  });
  $('stanFaza').textContent = sl[Math.round(pos)]?.[1] || '';
}

/* ---------- Izbor projekta ---------- */
let tip;
function postaviProjekat(id) {
  if (P === PROJEKTI[id]) return;
  P = PROJEKTI[id];
  history.replaceState(null, '', '#' + id);
  F = {
    film: NizKadrova(P.film, $('film')),
    stan: NizKadrova(null, $('stanCanvas')),
    ulaz: NizKadrova(P.ulaz, $('ulazCanvas'))
  };
  F.film.zoom = zoomGradnje;
  F.film.onDraw = hudFilma;
  F.stan.onDraw = hudStana;
  F.film.ready.then(() => { $('faze').innerHTML = F.film.seg.map(s => `<li>${s.faza}</li>`).join(''); });
  document.title = `${P.naziv}, ${P.mesto} | Skillset`;
  document.querySelectorAll('[data-p-naziv]').forEach(e => e.textContent = P.naziv);
  $('filmNaslov').textContent = `${P.naziv} · ${P.adresa}`;
  // gotova zgrada
  const zw = document.querySelector('.z-wrap');
  zw.style.setProperty('--ar', `${P.w} / ${P.h}`);
  zw.style.setProperty('--mx', `-${P.mobX}%`);
  zw.querySelector('.z-bg').src = P.kraj;
  $('zImg').src = P.kraj; $('zImg').alt = `${P.naziv}, fasada`;
  $('zSvg').setAttribute('viewBox', `0 0 ${P.w} ${P.h}`);
  $('zSvg').setAttribute('preserveAspectRatio', 'xMidYMid slice');   // isto sečenje kao slika (cover)
  P.el = P.fasada();
  $('units').innerHTML = P.el.map((e, i) => `<rect class="el ${e.tip === 'Glavni ulaz' ? 'el-ulaz' : ''}" data-i="${i}" x="${e.x0}" y="${e.y0}" width="${e.x1 - e.x0}" height="${e.y1 - e.y0}" rx="2"/>`).join('')
    + `<g class="ulaz-pin" transform="translate(${P.pin[0]} ${P.pin[1]})"><circle r="16"/><circle r="6"/><text y="-26" text-anchor="middle">UĐI</text></g>`;
}

/* Uvodni video (npr. zgrada iz svih uglova) pre filma gradnje; prvi skrol ga sklanja */
function uvod(pokazi) {
  const v = $('uvod'), box = v.parentElement;
  if (pokazi && P.uvod) { v.src = P.uvod; v.currentTime = 0; v.play().catch(() => {}); box.hidden = false; box.classList.remove('gone'); }
  else if (!box.hidden) { box.classList.add('gone'); v.pause(); setTimeout(() => { box.hidden = true; }, 700); }
}
function uFilm() {
  scena('film', `Srbija → ${P.mesto}`); F.film.velicina(); F.film.p = F.film.target = 0; uvod(true);
  F.film.ready.then(() => { if (!F.film.N) uZgradu(); else F.film.crtaj(); });   // bez filma odmah na zgradu
}
function uZgradu() { uvod(false); posle(false, true); scena('zgrada', `${P.mesto} → ${P.naziv}`); }
function uStan(s) {
  TURA = P.tura(s);
  F.stan = NizKadrova(TURA.klip, $('stanCanvas')); F.stan.onDraw = hudStana;
  $('stanSlike').innerHTML = TURA.slike.map(([src, alt]) => `<img class="stan-img${/karta|3d|apartment_3d/.test(src) ? ' stan-cela' : ''}" src="${src}" alt="${alt}">`).join('');
  $('stanNaziv').textContent = `${P.naziv} · ${s.naziv}`;
  $('stanInfo').textContent = TURA.info || '';
  scena('stan', `${P.naziv} → ${s.naziv}`);
  F.stan.ready.then(() => { F.stan.ucitaj(); F.stan.velicina(); F.stan.p = F.stan.target = 0; F.stan.crtaj(); });
}

/* ---------- 3. Gotova zgrada: dimenzije na fasadi + ulaz ---------- */
const unitsG = $('units');
tip = document.createElement('div');
tip.className = 'tip'; tip.hidden = true; document.body.appendChild(tip);
unitsG.addEventListener('mousemove', ev => {
  const r = ev.target.closest('.el');
  unitsG.querySelectorAll('.el.on').forEach(x => x !== r && x.classList.remove('on'));
  if (!r) { tip.hidden = true; return; }
  r.classList.add('on');
  const e = P.el[r.dataset.i];
  tip.innerHTML = `<b>${e.tip}</b><span>${e.sprat} · ${e.mere}</span>`;
  tip.style.left = ev.clientX + 'px'; tip.style.top = ev.clientY + 'px'; tip.hidden = false;
});
unitsG.addEventListener('mouseleave', () => { tip.hidden = true; unitsG.querySelectorAll('.el.on').forEach(x => x.classList.remove('on')); });
unitsG.addEventListener('click', ev => {
  const r = ev.target.closest('.el-ulaz, .ulaz-pin');
  if (r) { tip.hidden = true; uLift(); return; }
  // telefon: dodir na prozor/terasu prikazuje mere (nema hover-a)
  const el = ev.target.closest('.el');
  if (el) el.dispatchEvent(new MouseEvent('mousemove', { clientX: ev.clientX, clientY: ev.clientY, bubbles: true }));
});

/* ---------- 4. Ulaz → lift ---------- */
function uLift() {
  scena('ulaz', `${P.naziv} → Ulaz`);
  const ul = F.ulaz;
  ul.ready.then(() => {
    if (!ul.N) return pokaziLift();
    ul.ucitaj(); ul.velicina(); ul.p = ul.target = 0; ul.crtaj();
    setTimeout(() => ul.idi(1), 200);                          // prolaz kroz vrata ide sam
    const cek = setInterval(() => { if (ul.p >= .999) { clearInterval(cek); pokaziLift(); } }, 100);
  });
}
const oznaka = sp => P.dugmad.find(d => d[1] === sp)?.[0] ?? sp;
function pokaziLift() {
  scena('lift', `${P.naziv} → Lift`);
  const pan = $('liftDugmad');
  pan.innerHTML = P.dugmad.map(([t, sp]) => `<button data-sprat="${sp}">${t}</button>`).join('');
  $('liftStanovi').hidden = true;
  $('liftDisplej').textContent = oznaka(0);
  $('liftDisplej').dataset.sp = 0;
}
$('liftDugmad').addEventListener('click', ev => {
  const b = ev.target.closest('button'); if (!b) return;
  const sp = +b.dataset.sprat;
  document.querySelectorAll('#liftDugmad button').forEach(x => x.classList.toggle('on', x === b));
  // displej "vozi" do sprata
  const d = $('liftDisplej'); let cur = +d.dataset.sp;
  const korak = () => { d.dataset.sp = cur; d.textContent = oznaka(cur); if (cur === sp) return pokaziSprat(sp); cur += cur < sp ? 1 : -1; setTimeout(korak, 380); };
  korak();
});
let SPRAT = null;
function pokaziSprat(sp) {
  const box = $('liftStanovi');
  SPRAT = P.sprat(sp);
  if (SPRAT.info) {
    const [m, h, l] = SPRAT.info;
    box.innerHTML = `<p class="mono">${m}</p><h3>${h}</h3><p class="lead">${l}</p>`;
  } else {
    box.innerHTML = `<p class="mono">${SPRAT.naslov}</p><h3>Obilazak stanova</h3>` +
      SPRAT.stanovi.map((s, i) => `<button class="stan-row" data-i="${i}"><span>${s.naziv}</span><small><i class="dot dot-useljivo"></i>${s.opis} · obilazak ↗</small></button>`).join('');
  }
  box.hidden = false;
}
$('liftStanovi').addEventListener('click', ev => {
  const b = ev.target.closest('.stan-row'); if (!b) return;
  const s = SPRAT.stanovi[+b.dataset.i];
  const vrata = $('liftVrata');
  vrata.classList.add('open');                               // vrata lifta se otvaraju
  setTimeout(() => { vrata.classList.remove('open'); uStan(s); }, 1100);
});
document.querySelector('[data-zgrada]').addEventListener('click', uZgradu);
document.querySelector('[data-lift]').addEventListener('click', pokaziLift);
document.querySelector('[data-home]').addEventListener('click', e => {
  e.preventDefault(); stage.classList.remove('zooming'); svg?.setAttribute('viewBox', '0 0 1600 2108'); scena('srbija', 'Srbija');
  history.replaceState(null, '', location.pathname);
});

/* ---------- Skrol (točkić, dodir, tastatura) ---------- */
/* ---------- Posle gradnje: prave fotografije i renderi menjaju se na skrol ---------- */
const POSLE = { on: false, q: 0, cilj: 0, n: 1, run: false };
const posleBox = $('posle');
POSLE.crtaj = () => {
  const im = posleBox.querySelectorAll('img'), n = im.length, pos = POSLE.q * (n - 1 + .999);
  im.forEach((el, i) => {
    const t = pos - i;                                  // <0 još nije, 0..1 aktivna, >1 prošla
    const op = t < -1 ? 0 : t < 0 ? 1 + t : 1;          // sledeća se pretapa preko prethodne
    el.style.opacity = op.toFixed(3);
    el.style.transform = 'scale(' + (1.12 - .1 * Math.min(1, Math.max(0, (t + 1) / 2))).toFixed(4) + ')';
    el.style.zIndex = i;
  });
  const cur = Math.min(n - 1, Math.max(0, Math.round(pos - .3)));
  $('posleNaslov').textContent = P.posle[cur]?.[1] || '';
  $('posleBroj').textContent = (cur + 1) + ' / ' + n;
  $('bar').style.width = '100%';
};
POSLE.idi = c => { POSLE.cilj = Math.min(1, Math.max(0, c)); if (POSLE.run) return; POSLE.run = true;
  const k = () => { POSLE.q += (POSLE.cilj - POSLE.q) * .12; if (Math.abs(POSLE.cilj - POSLE.q) < .0005) POSLE.q = POSLE.cilj; POSLE.crtaj(); if (POSLE.q !== POSLE.cilj) requestAnimationFrame(k); else POSLE.run = false; }; requestAnimationFrame(k); };
function posle(ukljuci, tiho) {
  if (ukljuci) {
    if (posleBox.dataset.p !== P.naziv) { posleBox.querySelector('.posle-slike').innerHTML = P.posle.map(([src, alt]) => '<img src="' + src + '" alt="' + alt + '">').join(''); posleBox.dataset.p = P.naziv; }
    POSLE.n = P.posle.length; POSLE.on = true; POSLE.q = POSLE.cilj = 0; posleBox.hidden = false; requestAnimationFrame(() => posleBox.classList.add('on')); POSLE.crtaj();
  } else if (POSLE.on) {
    POSLE.on = false; posleBox.classList.remove('on'); setTimeout(() => { if (!POSLE.on) posleBox.hidden = true; }, tiho ? 0 : 600);
  }
}
let lock = 0;
function pomeri(d) {
  const s = stage.dataset.scene, now = performance.now();
  if (s === 'film') {
    const f = F.film;
    if (!$('uvod').parentElement.hidden && !$('uvod').parentElement.classList.contains('gone')) { if (d > 0 && now - lock > 700) { lock = now; uvod(false); } return; }
    if (POSLE.on) {                                   // slike posle gradnje: skrol ih menja, kraj vodi na zgradu
      if (POSLE.q >= 1 && d > 0) { if (now - lock > 700) { lock = now; uZgradu(); } return; }
      if (POSLE.q <= 0 && d < 0) { posle(false); return; }
      POSLE.idi(POSLE.q + d * 1.8 / POSLE.n); return;
    }
    if (f.target >= 1 && d > 0) { if (now - lock > 700) { lock = now; if (P.posle?.length && f.p > .99) posle(true); else uZgradu(); } return; }
    if (f.target <= 0 && d < 0) return;
    f.idi(f.target + d * (f.N ? 120 / f.N : 1));
  } else if (s === 'zgrada') {
    if (now - lock < 700) return; lock = now;
    if (d < 0 && F.film.N) { scena('film', `Srbija → ${P.mesto}`); F.film.crtaj(); if (P.posle?.length) { posle(true); POSLE.q = POSLE.cilj = 1; POSLE.crtaj(); } }   // nadole nema dalje: u zgradu se ulazi klikom na vrata
  } else if (s === 'stan') {
    const st = F.stan;
    if (st.target <= 0 && d < 0) { if (now - lock > 700) { lock = now; pokaziLift(); } return; }
    st.idi(st.target + d * (TURA.klip ? .9 : 2.4 / Math.max(1, TURA.slike.length - 1)));
  }
}
addEventListener('wheel', e => {
  if (stage.dataset.scene === 'srbija' || !document.getElementById('firma').hidden) return;
  e.preventDefault();
  pomeri(Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 120) / 1600);
}, { passive: false });
let ty = null;
addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
addEventListener('touchmove', e => { if (ty == null || !document.getElementById('firma').hidden) return; const dy = ty - e.touches[0].clientY; ty = e.touches[0].clientY; if (Math.abs(dy) > 1) pomeri(dy / 1200); }, { passive: true });
addEventListener('keydown', e => {
  if (['ArrowDown', 'PageDown', ' '].includes(e.key)) pomeri(.04);
  if (['ArrowUp', 'PageUp'].includes(e.key)) pomeri(-.04);
});

/* ---------- Video o firmi ---------- */
const firma = $('firma'), fv = $('firmaVideo');
document.querySelector('[data-firma]').addEventListener('click', () => { firma.hidden = false; fv.currentTime = 0; fv.play().catch(() => {}); });
const zatvoriFirmu = () => { fv.pause(); firma.hidden = true; };
document.querySelector('[data-firma-close]').addEventListener('click', zatvoriFirmu);
firma.addEventListener('click', e => { if (e.target === firma) zatvoriFirmu(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && !firma.hidden) zatvoriFirmu(); });
