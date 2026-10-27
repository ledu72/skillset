/* Podaci po projektu: film gradnje, fasada sa merama, spratovi u liftu, stanovi i obilazak.
   Koordinate fasade su u pikselima završnog rendera (w × h). Mere su PRIBLIŽNE (procena iz vizualizacije). */

const m2f = v => v.toFixed(2).replace('.', ',');
const mf = v => (Math.round(v * 10) / 10).toFixed(1).replace('.', ',');

/* ---------- MASSIV ressidence, Zlatibor ---------- */
function fasadaZlatibor() {
  const MPX = .04, el = [];
  const dodaj = (tip, x0, y0, x1, y1, sprat, mere) => el.push({ tip, x0, y0, x1, y1, sprat, mere });
  const SPRATOVI = [[60, 150], [150, 237], [237, 326], [326, 416], [416, 506], [506, 597], [597, 692]];   // od 7. do 1. sprata
  SPRATOVI.forEach(([y0, y1], i) => {
    const sp = (7 - i) + '. sprat', h = y1 - y0;
    // tamni delovi sa terasama: [x0, x1, pomeraj nadole (perspektiva desnog krila)]
    for (const [x0, x1, dy] of [[385, 476, 0], [683, 771, 0], [914, 996, 0], [1143, 1212, 20]]) {
      const w = (x1 - x0) * MPX;
      dodaj('Balkonska vrata', x0 + 6, y0 + dy + 10, x1 - 6, y0 + dy + h * .62, sp, `${mf(w - .6)} × 2,3 m`);
      dodaj('Terasa', x0, y0 + dy + h * .62, x1, y1 + dy - 2, sp, `${mf(w)} × 1,6 m · ${mf(w * 1.6)} m²`);
    }
    for (const [x0, x1, dy] of [[497, 528, 0], [539, 571, 0], [606, 656, 0], [1003, 1041, 6], [1071, 1096, 20], [1101, 1125, 20]])
      dodaj('Prozor', x0, y0 + dy + 18, x1, y0 + dy + 18 + 50, sp, `${mf((x1 - x0) * MPX)} × 1,5 m`);
    dodaj('Francuski prozor', 802, y0 + 14, 884, y1 - 22, sp, `${mf(82 * MPX)} × 2,1 m`);
  });
  dodaj('Glavni ulaz', 788, 698, 852, 780, 'Prizemlje', '2,4 × 2,6 m · kliknite za ulaz');
  for (const [x0, y0, x1, y1] of [[682, 712, 746, 790], [917, 704, 976, 782], [1082, 700, 1136, 776], [598, 712, 646, 760]])
    dodaj('Izlog poslovnog prostora', x0, y0, x1, y1, 'Prizemlje', `${mf((x1 - x0) * MPX)} × ${mf((y1 - y0) * MPX)} m`);
  return el;
}

/* ---------- Leštane Residence ---------- */
// 8 tipova stanova sa prodajnih kartica (isti raspored na 1. i 2. spratu)
const L_TIPOVI = [
  { br: '01', tip: 'Četvorosoban', m2: 85.61, k: 11 },
  { br: '02', tip: 'Trosoban', m2: 63.43, k: 12 },
  { br: '03', tip: 'Trosoban', m2: 70.02, k: 14 },
  { br: '04', tip: 'Dvosoban', m2: 48.94, k: 16 },
  { br: '05', tip: 'Dvosoban', m2: 44.56, k: 15 },
  { br: '06', tip: 'Dvosoban', m2: 53.78, k: 17 },
  { br: '07', tip: 'Trosoban', m2: 69.93, k: 13 },
  { br: '08', tip: 'Trosoban', m2: 72.46, k: 10 }
];
function fasadaLestane() {
  const MPX = .015, el = [];
  const r = (tip, x0, y0, x1, y1, sprat, mere) => el.push({ tip, x0, y0, x1, y1, sprat, mere: mere || `${mf((x1 - x0) * MPX)} × ${mf((y1 - y0) * MPX)} m` });
  // [sprat, balkonska vrata y, terasa y, francuski prozor y, bočni prozor y, srednji prozor y, desni prozor y, desna terasa y]
  for (const [sp, bv, te, fp, pb, ps, pd, td] of [
    ['Potkrovlje', [172, 240], [240, 292], [168, 305], [205, 308], [268, 338], [322, 385], [378, 412]],
    ['2. sprat', [368, 445], [445, 492], [362, 500], [395, 497], [385, 478], [430, 515], [535, 565]],
    ['1. sprat', [560, 650], [650, 692], [550, 695], [575, 667], [570, 662], [595, 675], [688, 718]]
  ]) {
    r('Balkonska vrata', 765, bv[0], 850, bv[1], sp, '1,3 × 2,2 m');
    r('Terasa', 735, te[0], 900, te[1], sp, '2,5 × 1,5 m · 3,8 m²');
    r('Francuski prozor', 955, fp[0], 1048, fp[1], sp, '1,4 × 2,1 m');
    r('Prozor', 676, pb[0], 704, pb[1], sp, '0,6 × 1,5 m');
    r('Prozor', 1112, ps[0], 1203, ps[1], sp, '1,4 × 1,4 m');
    r('Prozor', 1428, pd[0], 1500, pd[1], sp, '1,2 × 1,4 m');
    r('Terasa', 1690, td[0], 1760, td[1], sp, '1,8 × 1,2 m · 2,2 m²');
  }
  r('Glavni ulaz', 985, 795, 1210, 1000, 'Prizemlje', '3,4 × 3,0 m · kliknite za ulaz');
  r('Izlog lokala', 795, 790, 900, 1000, 'Prizemlje · lokal 562 m²', '1,6 × 3,1 m');
  r('Izlog lokala', 1410, 798, 1478, 930, 'Prizemlje · lokal 562 m²', '1,0 × 2,0 m');
  r('Ulaz u garažu', 1510, 850, 1612, 940, 'Prizemlje', '2,5 × 2,2 m');
  return el;
}

/* ---------- Višnjica Residence (IDR Višnjička – Ramadanska) ---------- */
function fasadaVisnjica() {
  const el = [];
  const r = (tip, x0, y0, x1, y1, sprat, mere) => el.push({ tip, x0, y0, x1, y1, sprat, mere });
  r('Staklena stena', 690, 240, 800, 350, 'Nivo 3 · povučeni sprat', '3,0 × 2,6 m');
  r('Terasa sa žardinjerom', 590, 280, 690, 345, 'Nivo 3 · povučeni sprat', 'do 24,65 m² (stan 16)');
  r('Staklena stena', 395, 345, 555, 440, 'Nivo 3 · povučeni sprat', '4,6 × 2,6 m');
  r('Balkonska vrata', 605, 450, 710, 552, 'Nivo 2', '2,8 × 2,4 m');
  r('Staklena stena', 380, 505, 545, 595, 'Nivo 2', '4,2 × 2,4 m');
  r('Prozor', 810, 400, 860, 545, 'Nivo 2', '1,0 × 2,4 m');
  r('Staklena stena', 345, 640, 460, 745, 'Nivo 1', '3,2 × 2,6 m');
  r('Staklena stena', 540, 615, 690, 745, 'Nivo 1', '4,0 × 2,6 m');
  r('Staklena stena', 690, 605, 800, 745, 'Nivo 1', '3,0 × 2,6 m');
  for (const [x0, y0, x1, y1, sp] of [[1072, 228, 1092, 372, 'Nivo 3'], [1112, 252, 1132, 372, 'Nivo 3'], [1072, 415, 1092, 532, 'Nivo 2'], [1112, 435, 1132, 545, 'Nivo 2']])
    r('Prozor (bočna fasada)', x0, y0, x1, y1, sp, '0,5 × 2,0 m');
  r('Glavni ulaz', 535, 765, 625, 822, 'Prizemlje', 'kliknite za ulaz');
  return el;
}
const V_STANOVI = {
  1: [[1, 'Dvosoban', 49.80], [2, 'Dvosoban', 58.46], [3, 'Dvosoban', 54.92], [4, 'Dvosoban', 63.32], [5, 'Dvosoban', 48.46], [6, 'Trosoban', 70.46], [7, 'Trosoban', 74.68]],
  3: [[15, 'Dvosoban', 44.58], [16, 'Dvosoban', 64.42, 'terasa 24,65 m²'], [17, 'Jednosoban', 37.15], [18, 'Dvosoban', 53.34], [19, 'Dvosoban', 44.26], [20, 'Trosoban', 57.84], [21, 'Trosoban', 69.14]]
};
const V_TURA = {
  Jednosoban: [['3d', 'Stan u 3D'], ['dnevna', 'Dnevni boravak'], ['kuhinja', 'Kuhinja'], ['kupatilo', 'Kupatilo']],
  Dvosoban: [['3d', 'Stan u 3D'], ['dnevna', 'Dnevni boravak'], ['spavaca', 'Spavaća soba'], ['kupatilo', 'Kupatilo']],
  Trosoban: [['3d', 'Stan u 3D'], ['dnevna', 'Dnevni boravak'], ['kuhinja', 'Kuhinja'], ['spavaca', 'Spavaća soba'], ['kupatilo', 'Kupatilo']]
};


/* ---------- Nove zgrade (WhatsApp 24.10.): jednostavan lift, obilazak iz fotografija ---------- */
const R = (tip, x0, y0, x1, y1, sprat, mere) => ({ tip, x0, y0, x1, y1, sprat, mere });
const jedanStan = (dir, naziv, opis, slike) => ({ stanovi: [{ id: '1', naziv, opis, slike: slike.map(([f, n]) => ['p/' + dir + '/stan/' + f + '.jpg', n]) }] });
const turaSlike = s => ({ slike: s.slike, info: s.opis });
// galerija zgrade (fotografije i renderi) kao "stan" u liftu
const galerija = (dir, naslov, opis, imena) => ({ naslov, stanovi: [{ id: 'gal', naziv: 'Galerija zgrade', opis, slike: imena.map((n, i) => ['p/' + dir + '/gal/g' + (i + 1) + '.jpg', n]) }] });

const PROJEKTI = {
  zlatibor: {
    posle: [['p/zlatibor/gal/g2.jpg','Fasada u zelenilu'],['p/zlatibor/gal/g4.jpg','Ugao sa ulazom'],['p/zlatibor/gal/g5.jpg','Ulaz sa logom MASSIV'],['p/zlatibor/gal/g6.jpg','Bočna strana i parking'],['za-ai/05-kraj-gotova-zgrada.jpg','MASSIV ressidence']],   // slike posle gradnje, pre fasade
    naziv: 'MASSIV ressidence', mesto: 'Zlatibor', adresa: 'Zlatibor, Bele vode',
    film: 'film/film', ulaz: 'film/ulaz', uvod: 'p/zlatibor/uvod/uglovi.mp4',   // zgrada iz svih uglova pre gradnje
    kraj: 'za-ai/05-kraj-gotova-zgrada.jpg', w: 1740, h: 980, mobX: 45.4,
    fasada: fasadaZlatibor, pin: [820, 690],
    dugmad: [['7', 7], ['6', 6], ['5', 5], ['4', 4], ['3', 3], ['2', 2], ['1', 1], ['P', 0]],
    sprat: sp => sp === 0
      ? galerija('zlatibor', 'Prizemlje · recepcija i lokali', '7 prikaza zgrade', ['Fasada spreda', 'Fasada u zelenilu', 'Pogled na ulaz', 'Ugao sa ulazom', 'Ulaz MASSIV', 'Bočna strana i parking', 'Lokacija Zova'])
      // tipovi apartmana (raspored tipova po spratu: čeka podatke od investitora)
      : { naslov: `${sp}. sprat · tipovi apartmana`, stanovi: [
          { id: `${sp}-studio`, naziv: 'Studio', opis: 'Studio apartman · ilustracija', slike: [['p/zlatibor/stan/tip-studio-3d.jpg', 'Studio u 3D · ilustracija'], ['p/zlatibor/stan/tip-studio-soba.jpg', 'Studio · enterijer']] },
          { id: `${sp}-jedan`, naziv: 'Jednosoban · stan 3', opis: 'Jednosoban · 37,99 m² sa terasom', slike: [['p/zlatibor/stan/osnova-stan-3.jpg', 'Osnova stana 3 · 37,99 m²'], ['p/zlatibor/stan/02_apartment_3d.jpg', 'Stan u 3D'], ['p/zlatibor/stan/03_apartment_living.jpg', 'Dnevna soba']] },
          { id: `${sp}-tro`, naziv: 'Trosoban', opis: 'Trosoban apartman · ilustracija', slike: [['p/zlatibor/stan/tip-trosoban-3d.jpg', 'Trosoban u 3D · ilustracija'], ['p/zlatibor/stan/tip-trosoban-dnevna.jpg', 'Trosoban · dnevna soba']] }
        ] },
    tura: s => s.slike ? turaSlike(s) : ({ klip: 'film/stan', slike: [['za-ai/02_apartment_3d.png', 'Osnova stana u 3D'], ['za-ai/03_apartment_living.png', 'Dnevna soba']] })
  },
  lestane: {
    posle: [['p/lestane/gal/g1.jpg','Pogled sa ulice'],['p/lestane/gal/g2.jpg','Ulaz i parking'],['p/lestane/gal/g3.jpg','Bočna fasada'],['p/lestane/gal/g4.jpg','Zgrada u naselju'],['p/lestane/kraj.jpg','Leštane Residence']],   // slike posle gradnje, pre fasade
    naziv: 'Leštane Residence', mesto: 'Leštane', adresa: 'Leštane, Grocka · Beograd',
    film: 'p/lestane/film/film',
    kraj: 'p/lestane/kraj.jpg', w: 1920, h: 1080, mobX: 57,
    fasada: fasadaLestane, pin: [1097, 772],
    dugmad: [['PK', 3], ['2', 2], ['1', 1], ['P', 0], ['-1', -1]],
    sprat: sp => sp === 0 ? galerija('lestane', 'Prizemlje · lokal 562 m²', '7 prikaza zgrade', ['Pogled sa ulice', 'Ulaz i parking', 'Bočna fasada', 'Zgrada u naselju', 'Leštane Residence', 'Stanovi 44–86 m²', 'Lokal 562 m²'])
      : sp === -1 ? { info: ['Podrum', 'Garaža i ostave', 'Parking mesta i ostave za stanare.'] }
      : sp === 3 ? { info: ['Potkrovlje', 'Raspored uskoro', 'Stanovi u potkrovlju biće objavljeni uskoro. Pozovite za informacije.'] }
      : { naslov: `${sp}. sprat · izaberite stan`, stanovi: L_TIPOVI.map(t => ({ id: `${sp}.${t.br}`, naziv: `Stan ${t.br}`, opis: `${t.tip} · ${m2f(t.m2)} m²`, t })) },
    tura: s => s.slike ? turaSlike(s) : ({ slike: [[`p/lestane/stan/karta-${s.t.k}.jpg`, 'Osnova stana'], [`p/lestane/stan/3d-${s.t.k}.jpg`, 'Stan u 3D'], [`p/lestane/stan/dnevna-${s.t.k}.jpg`, 'Dnevni boravak']], info: `${s.t.tip} · ${m2f(s.t.m2)} m² neto` })
  },
  visnjica: {
    posle: [['p/visnjica/gal/g1.jpg','Pogled iz ulice'],['p/visnjica/gal/g2.jpg','Ugao zgrade'],['p/visnjica/gal/g3.jpg','Fasada sa terasama'],['p/visnjica/kraj.jpg','Višnjica Residence']],   // slike posle gradnje, pre fasade
    naziv: 'Višnjica Residence', mesto: 'Višnjica', adresa: 'Ramadanska ulica, Višnjica · Palilula',
    film: 'p/visnjica/film/film',
    kraj: 'p/visnjica/kraj.jpg', w: 1760, h: 983, mobX: 39,
    fasada: fasadaVisnjica, pin: [580, 755],
    dugmad: [['3', 3], ['2', 2], ['1', 1], ['P', 0], ['-1', -1], ['-2', -2]],
    sprat: sp => sp === 0 ? galerija('visnjica', 'Ulaz · galerija', '4 prikaza zgrade', ['Pogled iz ulice', 'Ugao zgrade', 'Fasada sa terasama', 'Lokacija u Višnjici']) : sp === -1 ? { info: ['Nivo -1 · suteren', 'Zajednički prostor 416,55 m²', 'Prostor za stanare zgrade.'] }
      : sp === -2 ? { info: ['Nivo -2 · podrum', 'Garaža i bazen', 'Oko 15 parking mesta sa auto-liftom, ostave i bazen.'] }
      : sp === 2 ? { info: ['Nivo 2', 'Stanovi 8–14', 'Raspored nivoa 2 biće objavljen uskoro.'] }
      : { naslov: `Nivo ${sp}${sp === 3 ? ' · povučeni sprat' : ''} · izaberite stan`, stanovi: V_STANOVI[sp].map(([n, tip, m2, x]) => ({ id: String(n), naziv: `Stan ${n}`, opis: `${tip} · ${m2f(m2)} m²${x ? ' · ' + x : ''}`, tip, m2 })) },
    tura: s => s.slike ? turaSlike(s) : ({ slike: V_TURA[s.tip].map(([f, n]) => f === '3d' ? [`p/visnjica/stan/3d-${s.id}.jpg`, 'Stan u 3D · ilustracija'] : [`p/visnjica/stan/${f}.jpg`, n]), info: `${s.tip} · ${m2f(s.m2)} m² neto` })
  },
  kopaonik: {
    posle: [['p/kopaonik/gal/g1.jpg','Pogled sa puta'],['p/kopaonik/gal/g2.jpg','Zgrada u šumi'],['p/kopaonik/gal/g4.jpg','Fasada sa terasama'],['p/kopaonik/gal/g5.jpg','Bočni pogled'],['p/kopaonik/kraj.jpg','MASSIV Kopaonik']],   // slike posle gradnje, pre fasade
    naziv: 'MASSIV Kopaonik', mesto: 'Kopaonik', adresa: 'Kopaonik · apart hotel 4*, vikend naselje',
    film: 'p/kopaonik/film/film', kraj: 'p/kopaonik/kraj.jpg', w: 1600, h: 900, mobX: 52,
    fasada: () => [
      R('Krovni prozor sa terasom', 820, 220, 920, 320, 'Potkrovlje', '2,0 × 1,8 m · procena'), R('Krovni prozor sa terasom', 970, 270, 1070, 370, 'Potkrovlje', '2,0 × 1,8 m · procena'),
      R('Krovni prozor sa terasom', 830, 360, 940, 450, '3. sprat', '2,2 × 1,8 m · procena'), R('Krovni prozor sa terasom', 980, 380, 1080, 470, '3. sprat', '2,2 × 1,8 m · procena'),
      R('Krovni prozor sa terasom', 840, 460, 950, 550, '2. sprat', '2,2 × 1,8 m · procena'), R('Krovni prozor sa terasom', 1000, 480, 1100, 560, '2. sprat', '2,2 × 1,8 m · procena'),
      R('Glavni ulaz', 1010, 630, 1080, 690, 'Prizemlje', 'kliknite za ulaz')],
    pin: [1045, 620], dugmad: [['4', 4], ['3', 3], ['2', 2], ['1', 1], ['P', 0]],
    sprat: sp => sp === 0 ? galerija('kopaonik', 'Prizemlje · recepcija', '7 prikaza iz prezentacije', ['Pogled sa puta', 'Zgrada u šumi', 'Apart hotel 4*', 'Fasada sa terasama', 'Bočni pogled', 'Kopaonik', 'Večernji pogled'])
      : { naslov: sp + '. sprat · apartmani', ...jedanStan('kopaonik', 'Apartmani na prodaju', 'Raspored iz prodajne prezentacije', [['s1', 'Apartman u 3D'], ['s2', 'Osnova apartmana'], ['s4', 'Garaža u 3D']]) },
    tura: turaSlike
  },
  park: {
    naziv: 'NT 035 Naučno-tehnološki park', mesto: 'Ćuprija', adresa: 'Jagodina – Ćuprija · NT 035',
    film: 'p/park/film/film', kraj: 'p/park/kraj.jpg', w: 1600, h: 900, mobX: 47,
    fasada: () => [
      R('Staklena fasada', 690, 280, 1070, 500, '1. sprat', 'zid-zavesa · procena'), R('Staklena fasada', 1220, 540, 1440, 720, '1. sprat', 'zid-zavesa · procena'),
      R('Kosi stub', 1090, 180, 1130, 840, 'Konstrukcija', 'čelični stub · procena'), R('Glavni ulaz', 680, 730, 820, 850, 'Prizemlje', 'kliknite za ulaz')],
    pin: [750, 720], dugmad: [['1', 1], ['P', 0]],
    sprat: sp => sp === 0 ? { info: ['Prizemlje', 'Ulaz i zajednički prostor', 'Prostor za firme, edukaciju i razvoj. Gradi Skillset.'] }
      : { info: ['1. sprat', 'Kancelarije i laboratorije', 'Raspored prostora biće objavljen uskoro.'] },
    tura: turaSlike
  },
  podujevska: {
    posle: [['p/podujevska/stan/e01.jpg','Podujevska 17 i 19'],['p/podujevska/stan/e02.jpg','Parking ispred zgrade'],['p/podujevska/stan/e03.jpg','Dvorište i parking'],['p/podujevska/stan/e04.jpg','Zgrada iz ulice'],['p/podujevska/kraj.jpg','Useljivo']],   // slike posle gradnje, pre fasade
    naziv: 'Podujevska 17 i 19', mesto: 'Beograd', adresa: 'Podujevska 17 i 19, Beograd · useljivo',
    film: 'p/podujevska/film/film', kraj: 'p/podujevska/kraj.jpg', w: 1600, h: 900, mobX: 40,
    fasada: () => [
      R('Garažna vrata', 296, 664, 556, 870, 'Prizemlje', '3,0 × 2,3 m · procena'), R('Glavni ulaz', 660, 590, 760, 810, 'Prizemlje', 'kliknite za ulaz'),
      R('Terasa', 616, 90, 696, 190, '4. sprat', '1,5 × 1,2 m · procena'), R('Terasa', 600, 260, 700, 360, '3. sprat', '1,5 × 1,2 m · procena'),
      R('Prozor', 730, 130, 776, 210, '4. sprat', '1,0 × 1,4 m · procena'), R('Prozor', 840, 190, 880, 270, '3. sprat', '1,0 × 1,4 m · procena')],
    pin: [710, 580], dugmad: [['5', 5], ['4', 4], ['3', 3], ['2', 2], ['1', 1], ['P', 0], ['-1', -1]],
    sprat: sp => sp === -1 ? { naslov: 'Podzemna garaža', ...jedanStan('podujevska', 'Obilazak garaže', '10 fotografija', [['g01', 'Investitor Skillset'], ['g02', 'Garaža'], ['g03', 'Garaža'], ['g04', 'Garaža'], ['g05', 'Garaža'], ['g06', 'Garaža'], ['g07', 'Garaža'], ['g08', 'Garaža'], ['g09', 'Garaža'], ['g10', 'Garaža']]) }
      : sp === 0 ? { naslov: 'Prizemlje · zgrada spolja', ...jedanStan('podujevska', 'Zgrada spolja', '14 fotografija', [['e01', 'Podujevska 17 i 19'], ['e02', 'Podujevska 17 i 19'], ['e03', 'Podujevska 17 i 19'], ['e04', 'Podujevska 17 i 19'], ['e05', 'Podujevska 17 i 19'], ['e06', 'Podujevska 17 i 19'], ['e07', 'Podujevska 17 i 19'], ['e08', 'Podujevska 17 i 19'], ['e09', 'Podujevska 17 i 19'], ['e10', 'Podujevska 17 i 19'], ['e11', 'Podujevska 17 i 19'], ['e12', 'Podujevska 17 i 19'], ['e13', 'Podujevska 17 i 19'], ['e14', 'Podujevska 17 i 19']]) }
      : { naslov: sp + '. sprat · useljivo', ...jedanStan('podujevska', 'Završen stan', '13 fotografija useljivog stana', [['s01', 'Dnevna soba'], ['s02', 'Dnevna soba'], ['s03', 'Kuhinja'], ['s04', 'Spavaća soba'], ['s05', 'Dnevna soba'], ['s06', 'Dnevna soba'], ['s07', 'Kuhinja'], ['s08', 'Spavaća soba'], ['s09', 'Dnevna soba'], ['s10', 'Dnevna soba'], ['s11', 'Kuhinja'], ['s12', 'Spavaća soba'], ['s13', 'Dnevna soba']]) },
    tura: turaSlike
  },
  /* Veselina Masleše 51, Voždovac (Lekino brdo): 1459,69 m², 10 stanova, 14 garaža, lokal. Mere su procena sa rendera. */
  vmaslese: {
    posle: [['p/vmaslese/gal/g1.jpg','Detalj fasade'],['p/vmaslese/gal/g2.jpg','Dvorište'],['p/vmaslese/gal/g3.jpg','Krovna terasa'],['p/vmaslese/kraj.jpg','Veselina Masleše 51']],   // slike posle gradnje, pre fasade
    naziv: 'Veselina Masleše 51', mesto: 'Beograd', adresa: 'Veselina Masleše 51, Lekino brdo · Voždovac · useljivo',
    film: 'p/vmaslese/film/film', kraj: 'p/vmaslese/kraj.jpg', w: 1600, h: 900, mobX: 45,
    fasada: () => [
      R('Krovna terasa sa pergolom', 580, 60, 1060, 200, 'Povučeni sprat', 'zelena krovna terasa'),
      R('Francuski balkon', 602, 265, 672, 365, '4. sprat', '1,4 × 2,2 m · procena'),
      R('Francuski balkon', 602, 382, 672, 482, '3. sprat', '1,4 × 2,2 m · procena'),
      R('Francuski balkon', 602, 500, 672, 600, '2. sprat', '1,4 × 2,2 m · procena'),
      R('Francuski balkon', 618, 620, 670, 710, '1. sprat', '1,2 × 2,2 m · procena'),
      R('Prozor', 713, 240, 765, 300, '4. sprat', '1,2 × 1,4 m · procena'),
      R('Prozor', 713, 362, 765, 422, '3. sprat', '1,2 × 1,4 m · procena'),
      R('Prozor', 713, 487, 765, 547, '2. sprat', '1,2 × 1,4 m · procena'),
      R('Prozor', 720, 612, 770, 667, '1. sprat', '1,2 × 1,4 m · procena'),
      R('Prozor', 550, 285, 588, 340, '4. sprat', '0,9 × 1,4 m · procena'),
      R('Prozor', 550, 400, 588, 453, '3. sprat', '0,9 × 1,4 m · procena'),
      R('Prozor', 550, 515, 588, 568, '2. sprat', '0,9 × 1,4 m · procena'),
      R('Prozor', 550, 628, 588, 678, '1. sprat', '0,9 × 1,4 m · procena'),
      R('Prozor', 818, 223, 862, 285, '4. sprat', '1,0 × 1,4 m · procena'),
      R('Prozor', 818, 350, 862, 410, '3. sprat', '1,0 × 1,4 m · procena'),
      R('Prozor', 818, 475, 862, 535, '2. sprat', '1,0 × 1,4 m · procena'),
      R('Prozor', 818, 603, 862, 660, '1. sprat', '1,0 × 1,4 m · procena'),
      R('Balkon', 923, 195, 1008, 308, '4. sprat', '1,8 × 1,0 m · procena'),
      R('Balkon', 923, 328, 1008, 440, '3. sprat', '1,8 × 1,0 m · procena'),
      R('Balkon', 923, 460, 1008, 572, '2. sprat', '1,8 × 1,0 m · procena'),
      R('Balkon', 933, 590, 1000, 697, '1. sprat', '1,6 × 1,0 m · procena'),
      R('Izlog lokala', 565, 738, 692, 840, 'Prizemlje', 'lokal prema ulici'),
      R('Ulaz u garažu', 900, 765, 1033, 860, 'Prizemlje', '14 garažnih mesta'),
      R('Glavni ulaz', 740, 715, 877, 855, 'Prizemlje', 'prolaz u dvorište · kliknite za ulaz')],
    pin: [808, 780], dugmad: [['PS', 5], ['4', 4], ['3', 3], ['2', 2], ['1', 1], ['P', 0], ['-1', -1]],
    sprat: sp => sp === -1 ? { info: ['Podzemna garaža', '14 garažnih mesta', 'Garaža za stanare sa ulazom iz ulice.'] }
      : sp === 0 ? galerija('vmaslese', 'Prizemlje · zgrada spolja', 'Fasada, dvorište i krovna terasa', ['Detalj fasade', 'Dvorište zgrade', 'Krovna terasa'])
      : { naslov: (sp === 5 ? 'Povučeni sprat' : sp + '. sprat') + ' · useljivo', stanovi: [{ id: 'enterijer', naziv: 'Završen stan', opis: '10 stanova · ukupno 1459,69 m²', slike: [['p/vmaslese/gal/g4.jpg', 'Kuhinja i trpezarija'], ['p/vmaslese/gal/g5.jpg', 'Spavaća soba'], ['p/vmaslese/gal/g6.jpg', 'Terasa'], ['p/vmaslese/gal/g7.jpg', 'Kupatilo']] }] },
    tura: turaSlike
  },
  francuska: {
    posle: [['p/francuska/stan/p01.jpg','Obnovljeni podovi i zidovi'],['p/francuska/stan/p02.jpg','Galerija sa ogradom'],['p/francuska/stan/p03.jpg','Svečana sala'],['p/francuska/stan/p04.jpg','Obnovljeni enterijer'],['p/francuska/kraj.jpg','Francuska 21']],   // slike posle gradnje, pre fasade
    naziv: 'Spomen dom Nikole Pašića', mesto: 'Beograd', adresa: 'Francuska 21, Beograd · rekonstrukcija 2017–2021',
    film: 'p/francuska/film/film', kraj: 'p/francuska/kraj.jpg', w: 1600, h: 900, mobX: 50,
    fasada: () => [
      R('Prozor sa lukom', 140, 320, 310, 650, 'Prizemlje', 'obnovljena stolarija · procena'), R('Prozor sa lukom', 540, 340, 690, 650, 'Prizemlje', 'obnovljena stolarija · procena'),
      R('Prozor sa balkonom', 210, 10, 350, 170, '1. sprat', 'kovani balkon · procena'), R('Prozor sa balkonom', 570, 20, 720, 200, '1. sprat', 'kovani balkon · procena'),
      R('Glavni ulaz', 890, 80, 1200, 630, 'Prizemlje', 'stakleni paviljon · kliknite za ulaz')],
    pin: [1045, 400], dugmad: [['1', 1], ['P', 0]],
    sprat: sp => ({ naslov: sp ? '1. sprat · galerija i sobe' : 'Prizemlje · sale i saloni', ...jedanStan('francuska', sp ? 'Obilazak sprata' : 'Obilazak prizemlja', 'Rekonstruisano 2017–2021 · 13 prostorija', sp ? [['s01','Galerija sa svetlarnikom'],['s02','Rezbarena galerija'],['s03','Hodnik'],['s04','Svetlarnik'],['s05','Stepenišni prostor'],['s06','Vrh stepeništa'],['s07','Hol na spratu'],['s08','Hodnik sa rasvetom'],['s09','Ograda galerije'],['s10','Prozori ka dvorištu'],['s11','Soba'],['s12','Soba sa gredama'],['s13','Spavaća soba']] : [['p01','Velika sala'],['p02','Sala za sastanke'],['p03','Trpezarija'],['p04','Salon sa lusterom'],['p05','Konferencijska sala'],['p06','Kamin sa ogledalom'],['p07','Mermerni kamin'],['p08','Detalj enterijera'],['p09','Ogledalo u zlatnom ramu'],['p10','Hrastovo stepenište'],['p11','Rezbarena ograda'],['p12','Stepenište ka spratu']]) }),
    tura: turaSlike
  }
};
if (typeof module !== 'undefined') module.exports = { PROJEKTI };
