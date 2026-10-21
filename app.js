/* MASSIV ressidence: sajt u stilu "film na skrol"
   1. karta Srbije → 2. let do parcele + gradnja (AI kadrovi) → 3. gotova zgrada, hover na stan → 4. obilazak stana
   Kadrovi se prave skriptom tools/build-film.js iz klipova u za-ai/. */

const LOKACIJE = [
  { id: 'zlatibor', naziv: 'Zlatibor', status: 'predprodaja', aktivno: true },
  { id: 'kopaonik', naziv: 'Kopaonik', status: 'useljivo' },
  { id: 'beograd', naziv: 'Beograd', status: 'useljivo' },
  { id: 'lestane', naziv: 'Leštane', status: 'izgradnja' }
];
const STATUS = { useljivo: 'Useljivo', izgradnja: 'U izgradnji', predprodaja: 'Predprodaja' };

const stage = document.querySelector('.stage');
const crumb = document.getElementById('crumb');
const scena = (s, c) => { stage.dataset.scene = s; crumb.textContent = c; };

/* ---------- 1. Karta Srbije ---------- */
const wrap = document.getElementById('srbija');
let svg;
fetch('mapa-srbije.svg').then(r => r.text()).then(t => {
  wrap.innerHTML = t;
  svg = wrap.querySelector('svg');
  svg.removeAttribute('width'); svg.removeAttribute('height');
  LOKACIJE.forEach(l => svg.querySelector('#pin-' + l.id)?.addEventListener('click', () => izaberi(l)));
});
const list = document.getElementById('locList');
list.innerHTML = LOKACIJE.map(l => `<li><button data-id="${l.id}">${l.naziv}<small><i class="dot dot-${l.status}"></i>${l.aktivno ? STATUS[l.status] : 'Uskoro'}</small></button></li>`).join('');
list.addEventListener('click', e => { const b = e.target.closest('button'); if (b) izaberi(LOKACIJE.find(l => l.id === b.dataset.id)); });
list.addEventListener('mouseover', e => { const b = e.target.closest('button'); svg?.querySelectorAll('.pin').forEach(p => p.classList.toggle('on', b && p.id === 'pin-' + b.dataset.id)); });

function izaberi(l) {
  if (!svg || !l.aktivno) return;
  const dot = svg.querySelector(`#pin-${l.id} circle:nth-child(2)`);
  const cx = +dot.getAttribute('cx'), cy = +dot.getAttribute('cy');
  const f = [0, 0, 1600, 2108], w = 120, h = w * f[3] / f[2], to = [cx - w / 2, cy - h / 2, w, h];
  const t0 = performance.now(), D = 1500, ease = t => 1 - Math.pow(1 - t, 4);
  stage.classList.add('zooming');
  const step = now => {
    const p = ease(Math.min(1, (now - t0) / D));
    svg.setAttribute('viewBox', f.map((v, i) => v + (to[i] - v) * p).join(' '));
    if (p < 1) requestAnimationFrame(step); else { uFilm(); }
  };
  requestAnimationFrame(step);
  Film.film.ucitaj();
}

/* ---------- Niz kadrova vezan za skrol ---------- */
function NizKadrova(dir, canvas) {
  const o = { dir, canvas, ctx: canvas.getContext('2d'), frames: [], N: 0, seg: [], p: 0, target: 0, run: false, ready: null, onDraw: null };
  o.ready = fetch(`film/${dir}/manifest.json`).then(r => r.json()).then(m => { o.N = m.broj; o.seg = m.segmenti; }).catch(() => {});
  o.ucitaj = () => o.ready.then(() => {
    if (o.frames.length || !o.N) return;
    for (let i = 1; i <= o.N; i++) { const im = new Image(); im.onload = () => { if (i === 1) o.crtaj(); }; im.src = `film/${dir}/f_${String(i).padStart(4, '0')}.jpg`; o.frames.push(im); }
  });
  o.velicina = () => { const d = Math.min(devicePixelRatio || 1, 2); canvas.width = innerWidth * d; canvas.height = innerHeight * d; o.crtaj(); };
  o.crtaj = () => {
    if (!o.N) return o.onDraw?.(o);
    const idx = Math.round(o.p * (o.N - 1));
    let im = o.frames[idx];
    for (let d = 1; im && !im.complete && d < o.N; d++) im = o.frames[idx - d] || o.frames[idx + d];
    if (im?.complete && im.naturalWidth) {
      const c = canvas;
      // odzumiranje tokom gradnje: kadar kreće krupno i polako se udaljava dok zgrada raste
      const z = o.zoom ? o.zoom(idx) : { k: 1, cx: .5, cy: .5 };
      const s = Math.max(c.width / im.naturalWidth, c.height / im.naturalHeight) * z.k, w = im.naturalWidth * s, h = im.naturalHeight * s;
      o.ctx.fillStyle = '#0b0b0a'; o.ctx.fillRect(0, 0, c.width, c.height);
      // pomeraj ograničen tako da nikad ne ostane prazna traka
      const x = Math.min(0, Math.max(c.width - w, c.width / 2 - w * z.cx));
      let y = Math.min(0, Math.max(c.height - h, c.height / 2 - h * z.cy));
      o.ctx.drawImage(im, x, y, w, h);
      // kraj filma: pretapanje u pravi render, cela zgrada u kadru (kao scena izbora), sa zamućenim nastavkom sa strane
      const end = document.getElementById('zImg');
      if (z.fit && end.complete && end.naturalWidth) {
        const t = z.fit, ar = end.naturalWidth / end.naturalHeight;
        const nav = (innerWidth >= 768 ? 76 : 64) * (c.width / innerWidth), ah = c.height - nav;
        let cw = c.width, ch = cw / ar; if (ch > ah) { ch = ah; cw = ch * ar; }
        const cx2 = (c.width - cw) / 2, cy2 = nav + (ah - ch) / 2;
        o.ctx.globalAlpha = t;
        o.ctx.filter = 'blur(30px) brightness(.55)';
        o.ctx.drawImage(end, x, y, w, w / ar);
        o.ctx.filter = 'none';
        const rw = w + (cw - w) * t;
        o.ctx.globalAlpha = Math.min(1, t * 1.6);
        o.ctx.drawImage(end, x + (cx2 - x) * t, y + (cy2 - y) * t, rw, rw / ar);
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
const Film = {
  film: NizKadrova('film', document.getElementById('film')),
  stan: NizKadrova('stan', document.getElementById('stanCanvas')),
  ulaz: NizKadrova('ulaz', document.getElementById('ulazCanvas'))
};

/* Odzumiranje tokom gradnje (od prvog kadra "Iskop" do kraja): 1.45× → 1×,
   centar se pomera sa temelja (dole) na celu zgradu */
Film.film.zoom = idx => {
  const seg = Film.film.seg, start = seg.find(s => /Iskop/.test(s.faza))?.od ?? 0, end = Film.film.N - 1;
  const t = Math.max(0, Math.min(1, (idx - start) / Math.max(1, end - start)));
  const e = 1 - Math.pow(1 - t, 2);
  // kreće krupno na temeljima (dole), pa se kamera penje i udaljava dok ne uhvati vrh zgrade
  // na kraju (fit → 1) kadar je identičan slici gotove zgrade u sledećoj sceni: ceo kadar, vrh odmah ispod menija
  return { k: 1.18 - .18 * e, cx: .5, cy: .66 - .38 * e, fit: Math.max(0, (e - .75) / .25) };
};

/* HUD za film */
Film.film.ready.then(() => { document.getElementById('faze').innerHTML = Film.film.seg.map(s => `<li>${s.faza}</li>`).join(''); });
Film.film.onDraw = o => {
  const idx = Math.round(o.p * (o.N - 1));
  const si = Math.max(0, o.seg.findIndex(s => idx >= s.od && idx <= s.do));
  const f = document.getElementById('faza');
  if (o.seg[si] && f.textContent !== o.seg[si].faza) f.textContent = o.seg[si].faza;
  document.querySelectorAll('#faze li').forEach((li, i) => { li.classList.toggle('on', i === si); li.classList.toggle('done', i < si); });
  document.getElementById('bar').style.width = (o.p * 100).toFixed(1) + '%';
  document.getElementById('hint').textContent = o.p > .99 ? 'Skrolujte dalje za izbor stana ↓' : o.p < .01 ? 'Skrolujte ↓' : 'Skrol gore vraća unazad ↑';
};

/* Stan: ako nema klipa, prelaz između dve slike */
Film.stan.onDraw = o => {
  document.getElementById('stanBar').style.width = (o.p * 100).toFixed(1) + '%';
  document.getElementById('stanFaza').textContent = o.p < .5 ? 'Osnova stana u 3D' : 'Dnevna soba';
  const nemaKlipa = !o.N;
  document.getElementById('stanA').style.opacity = nemaKlipa ? String(1 - Math.min(1, Math.max(0, (o.p - .3) / .4))) : 0;
  document.getElementById('stanB').style.opacity = nemaKlipa ? String(Math.min(1, Math.max(0, (o.p - .3) / .4))) : 0;
  if (nemaKlipa) document.getElementById('stanB').style.transform = `scale(${1.08 - o.p * .08})`;
};

function uFilm() { scena('film', 'Srbija → Zlatibor'); Film.film.velicina(); Film.film.p = Film.film.target = 0; Film.film.crtaj(); }
function uZgradu() { scena('zgrada', 'Zlatibor → MASSIV'); }
function uStan() { Film.stan.ucitaj(); scena('stan', 'MASSIV → Stan'); Film.stan.velicina(); Film.stan.p = Film.stan.target = 0; Film.stan.crtaj(); }

/* ---------- 3. Gotova zgrada: dimenzije na fasadi + ulaz ----------
   Koordinate su u pikselima rendera 05 (1740×980). Mere su PRIBLIŽNE, procenjene iz vizualizacije
   (fasada ~34 m ≈ 850 px → ~0,04 m po pikselu). Zameniti tačnim merama iz projekta. */
const MPX = .04;
const m = v => (Math.round(v * 10) / 10).toFixed(1).replace('.', ',');
const SPRATOVI = [[60, 150], [150, 237], [237, 326], [326, 416], [416, 506], [506, 597], [597, 692]];   // od 7. do 1. sprata
const ELEMENTI = [];
const dodaj = (tip, x0, y0, x1, y1, sprat, mere) => ELEMENTI.push({ tip, x0, y0, x1, y1, sprat, mere });
SPRATOVI.forEach(([y0, y1], i) => {
  const sp = 7 - i, h = y1 - y0;
  // tamni delovi sa terasama: [x0, x1, pomeraj nadole (perspektiva desnog krila)]
  for (const [x0, x1, dy] of [[385, 476, 0], [683, 771, 0], [914, 996, 0], [1143, 1212, 20]]) {
    const w = (x1 - x0) * MPX;
    dodaj('Balkonska vrata', x0 + 6, y0 + dy + 10, x1 - 6, y0 + dy + h * .62, sp, `${m(w - .6)} × 2,3 m`);
    dodaj('Terasa', x0, y0 + dy + h * .62, x1, y1 + dy - 2, sp, `${m(w)} × 1,6 m · ${m(w * 1.6)} m²`);
  }
  // prozori: [x0, x1, pomeraj]
  for (const [x0, x1, dy] of [[497, 528, 0], [539, 571, 0], [606, 656, 0], [1003, 1041, 6], [1071, 1096, 20], [1101, 1125, 20]])
    dodaj('Prozor', x0, y0 + dy + 18, x1, y0 + dy + 18 + 50, sp, `${m((x1 - x0) * MPX)} × 1,5 m`);
  dodaj('Francuski prozor', 802, y0 + 14, 884, y1 - 22, sp, `${m(82 * MPX)} × 2,1 m`);
});
// prizemlje
dodaj('Glavni ulaz', 788, 698, 852, 780, 0, '2,4 × 2,6 m · kliknite za ulaz');
for (const [x0, y0, x1, y1] of [[682, 712, 746, 790], [917, 704, 976, 782], [1082, 700, 1136, 776], [598, 712, 646, 760]])
  dodaj('Izlog poslovnog prostora', x0, y0, x1, y1, 0, `${m((x1 - x0) * MPX)} × ${m((y1 - y0) * MPX)} m`);

const unitsG = document.getElementById('units');
unitsG.innerHTML = ELEMENTI.map((e, i) => `<rect class="el ${e.tip === 'Glavni ulaz' ? 'el-ulaz' : ''}" data-i="${i}" x="${e.x0}" y="${e.y0}" width="${e.x1 - e.x0}" height="${e.y1 - e.y0}" rx="2"/>`).join('')
  + `<g class="ulaz-pin" transform="translate(820 690)"><circle r="16"/><circle r="6"/><text y="-26" text-anchor="middle">UĐI</text></g>`;

const tip = document.createElement('div');
tip.className = 'tip'; tip.hidden = true; document.body.appendChild(tip);
unitsG.addEventListener('mousemove', ev => {
  const r = ev.target.closest('.el');
  unitsG.querySelectorAll('.el.on').forEach(x => x !== r && x.classList.remove('on'));
  if (!r) { tip.hidden = true; return; }
  r.classList.add('on');
  const e = ELEMENTI[r.dataset.i];
  tip.innerHTML = `<b>${e.tip}</b><span>${e.sprat ? e.sprat + '. sprat · ' : 'Prizemlje · '}${e.mere}</span>`;
  tip.style.left = ev.clientX + 'px'; tip.style.top = ev.clientY + 'px'; tip.hidden = false;
});
unitsG.addEventListener('mouseleave', () => { tip.hidden = true; unitsG.querySelectorAll('.el.on').forEach(x => x.classList.remove('on')); });
unitsG.addEventListener('click', ev => {
  const r = ev.target.closest('.el-ulaz, .ulaz-pin');
  if (r) { tip.hidden = true; uLift(); }
});

/* ---------- 4. Ulaz → lift ---------- */
const SPRAT_STANOVI = sp => ['A', 'B', 'C', 'D'].map(o => ({ id: `${sp}${o}`, status: 'slobodan' }));   // zameniti spiskom od klijenta
function uLift() {
  scena('ulaz', 'MASSIV → Ulaz');
  const ul = Film.ulaz;
  ul.ready.then(() => {
    if (!ul.N) return pokaziLift();
    ul.ucitaj(); ul.velicina(); ul.p = ul.target = 0; ul.crtaj();
    setTimeout(() => ul.idi(1), 200);                          // prolaz kroz vrata ide sam
    const cek = setInterval(() => { if (ul.p >= .999) { clearInterval(cek); pokaziLift(); } }, 100);
  });
}
function pokaziLift() {
  scena('lift', 'MASSIV → Lift');
  const pan = document.getElementById('liftDugmad');
  pan.innerHTML = [7, 6, 5, 4, 3, 2, 1].map(sp => `<button data-sprat="${sp}">${sp}</button>`).join('') + '<button data-sprat="0">P</button>';
  document.getElementById('liftStanovi').hidden = true;
  document.getElementById('liftDisplej').textContent = 'P';
}
document.getElementById('liftDugmad').addEventListener('click', ev => {
  const b = ev.target.closest('button'); if (!b) return;
  const sp = +b.dataset.sprat;
  document.querySelectorAll('#liftDugmad button').forEach(x => x.classList.toggle('on', x === b));
  // displej "vozi" do sprata
  const d = document.getElementById('liftDisplej'); let cur = d.textContent === 'P' ? 0 : +d.textContent;
  const korak = () => { if (cur === sp) return pokaziSprat(sp); cur += cur < sp ? 1 : -1; d.textContent = cur || 'P'; setTimeout(korak, 380); };
  korak();
});
function pokaziSprat(sp) {
  const box = document.getElementById('liftStanovi');
  if (sp === 0) { box.hidden = false; box.innerHTML = '<p class="mono">Prizemlje</p><h3>Recepcija i poslovni prostor</h3><p class="lead">Lobi bar, recepcija apart hotela i lokali.</p>'; return; }
  box.innerHTML = `<p class="mono">${sp}. sprat · izaberite stan</p><h3>Obilazak stanova</h3>` +
    SPRAT_STANOVI(sp).map(s => `<button class="stan-row" data-stan-id="${s.id}"><span>Stan ${s.id}</span><small><i class="dot dot-useljivo"></i>${s.status === 'slobodan' ? 'Slobodan' : s.status} · obilazak ↗</small></button>`).join('');
  box.hidden = false;
}
document.getElementById('liftStanovi').addEventListener('click', ev => {
  const b = ev.target.closest('[data-stan-id]'); if (!b) return;
  const vrata = document.getElementById('liftVrata');
  vrata.classList.add('open');                               // vrata lifta se otvaraju
  setTimeout(() => { vrata.classList.remove('open'); document.getElementById('stanNaziv').textContent = `Stan ${b.dataset.stanId}`; uStan(); }, 1100);
});
document.querySelector('[data-zgrada]').addEventListener('click', uZgradu);
document.querySelector('[data-lift]').addEventListener('click', pokaziLift);
document.querySelector('[data-home]').addEventListener('click', e => {
  e.preventDefault(); stage.classList.remove('zooming'); svg?.setAttribute('viewBox', '0 0 1600 2108'); scena('srbija', 'Srbija');
});

/* ---------- Skrol (točkić, dodir, tastatura) ---------- */
let lock = 0;
function pomeri(d) {
  const s = stage.dataset.scene, now = performance.now();
  if (s === 'film') {
    const f = Film.film;
    if (f.target >= 1 && d > 0) { if (now - lock > 700) { lock = now; uZgradu(); } return; }
    if (f.target <= 0 && d < 0) return;
    f.idi(f.target + d * (Film.film.N ? 120 / Film.film.N : 1));
  } else if (s === 'zgrada') {
    if (now - lock < 700) return; lock = now;
    if (d < 0) { scena('film', 'Srbija → Zlatibor'); Film.film.crtaj(); }   // nadole nema dalje: u zgradu se ulazi klikom na vrata
  } else if (s === 'stan') {
    const st = Film.stan;
    if (st.target <= 0 && d < 0) { if (now - lock > 700) { lock = now; pokaziLift(); } return; }
    st.idi(st.target + d * .9);
  }
}
addEventListener('wheel', e => {
  if (stage.dataset.scene === 'srbija') return;
  e.preventDefault();
  pomeri(Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 120) / 1600);
}, { passive: false });
let ty = null;
addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
addEventListener('touchmove', e => { if (ty == null) return; const dy = ty - e.touches[0].clientY; ty = e.touches[0].clientY; if (Math.abs(dy) > 1) pomeri(dy / 1200); }, { passive: true });
addEventListener('keydown', e => {
  if (['ArrowDown', 'PageDown', ' '].includes(e.key)) pomeri(.04);
  if (['ArrowUp', 'PageUp'].includes(e.key)) pomeri(-.04);
});
