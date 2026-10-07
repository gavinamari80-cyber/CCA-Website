// Switch navigation tabs
function switchTab(event, tabId) {
    document.querySelectorAll('video').forEach(v => v.pause()); // stop any ad video when changing tabs
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    const navBtns = document.querySelectorAll('.ufc-nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));

    if (tabId === 'upcoming' || tabId === 'past') {
        const eventsBtn = document.querySelector('.events-hover-btn');
        if (eventsBtn) eventsBtn.classList.add('active');
    } else if (event && event.target && event.target.classList.contains('ufc-nav-btn')) {
        event.target.classList.add('active');
    } else {
        // Triggered from a non-nav button (e.g. hero): highlight the matching nav item
        const match = [...navBtns].find(b => (b.getAttribute('onclick') || '').includes(`'${tabId}'`));
        if (match) match.classList.add('active');
    }

    const target = document.getElementById(tabId);
    if (target) target.classList.add('active');
    window.scrollTo({ top: 0 });
}

// Toggle dropdown fight card details
function toggleCardDetails(cardId, btnElement) {
    const card = document.getElementById(cardId);
    if (!card) return;
    card.classList.toggle('open');
    if (btnElement) btnElement.textContent = card.classList.contains('open') ? 'HIDE CARD' : (btnElement.dataset.label || 'FIGHT CARD');
}

// Matchup carousel arrows (add one entry per event)
const matchups = {
    'ama006': ['TBD VS TBD'],
    'ama007': ['TBD VS TBD']
};
const currentMatchupIndices = { 'ama006': 0, 'ama007': 0 };

function stepMatchup(eventId, dir) {
    const list = matchups[eventId];
    currentMatchupIndices[eventId] = (currentMatchupIndices[eventId] + dir + list.length) % list.length;
    const el = document.getElementById(`${eventId}-title`);
    el.textContent = list[currentMatchupIndices[eventId]];
    el.classList.toggle('long', el.textContent.length > 22);
    renderCarouselAvatars(eventId);
}
function nextMatchup(eventId) { stepMatchup(eventId, 1); }
function prevMatchup(eventId) { stepMatchup(eventId, -1); }

// Logo: if logo.png exists next to index.html, show it instead of the text logo
(function () {
    const img = document.getElementById('site-logo');
    const fallback = document.getElementById('logo-fallback');
    if (!img || !fallback) return;
    const test = new Image();
    test.onload = () => { img.hidden = false; fallback.style.display = 'none'; };
    test.src = img.getAttribute('src');
})();

// ===== Fighter photos =====
// Photos are found automatically from the fighter's name: lowercase it and turn spaces/symbols into hyphens.
//   Nick Diaz -> nick-diaz.png     El eagle -> el-eagle.png     3 Dot -> 3-dot.png
// Upload the cropped picture with that file name next to index.html and the fighter's photo
// shows up everywhere (event cards, Watch tab, roster, profile pop-up). No code change needed.
// Fighters without a photo keep the grey silhouette.
// Only if a name is awkward, set the file by hand here, e.g. 'Grayson \u201cThe Ragin Cajun\u201d': 'grayson.png'
const fighterPics = {
    'Grayson \u201cThe Ragin Cajun\u201d': 'grayson.png'
};

function photoFor(name) {
    const n = (name || '').trim();
    if (!n || /^tbd$/i.test(n)) return null;
    if (fighterPics[n]) return fighterPics[n];
    const slug = n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return slug ? slug + '.png' : null;
}

function setAvatar(el, name) {
    if (!el) return;
    if (el.dataset.fallback === undefined) el.dataset.fallback = el.innerHTML; // remember the silhouette
    const src = photoFor(name);
    if (src) {
        el.innerHTML = '';
        const img = document.createElement('img');
        img.className = 'fighter-photo';
        img.src = src;
        img.alt = name;
        img.onerror = () => { el.innerHTML = el.dataset.fallback; };
        el.appendChild(img);
    } else {
        el.innerHTML = el.dataset.fallback;
    }
}

function renderCarouselAvatars(eventId) {
    const names = matchups[eventId][currentMatchupIndices[eventId]].split(/\s+vs\.?\s+/i);
    document.querySelectorAll(`.fighter-avatar[data-event="${eventId}"]`).forEach(el => setAvatar(el, names[+el.dataset.slot]));
}

function renderWatchAvatars() {
    document.querySelectorAll('.watch-fighter-img[data-main-event]').forEach(el => {
        const names = matchups[el.dataset.mainEvent][0].split(/\s+vs\.?\s+/i);
        setAvatar(el, names[+el.dataset.slot]);
    });
}

Object.keys(matchups).forEach(renderCarouselAvatars);
renderWatchAvatars();


// ===== Roster =====
// Every fight, winner first. method: 'dec' (decision), 'ko', or 'draw' (then the order doesn't matter).
// To add a new result, add a line here and the roster updates by itself.
// skip: 'a' | 'b' | 'both' = leave that fighter's side out of their record (used where the Discord record doesn't count the fight).
// The fight still shows in their history, marked "not in record".
const fights = [
    // AMA 001
    { ev: 'AMA 001', a: 'Sephtis',    b: 'Siso',         m: 'ko'  },
    { ev: 'AMA 001', a: 'Jackmon_OP', b: 'KX7',          m: 'dec', skip: 'b' },
    { ev: 'AMA 001', a: 'mahrfp',     b: 'Slim',         m: 'ko'  },
    { ev: 'AMA 001', a: '3 Dot',      b: 'IPPO',         m: 'dec' },
    { ev: 'AMA 001', a: 'Yoshiki',    b: 'Killshot Kev', m: 'draw' },
    { ev: 'AMA 001', a: 'Cobra Boy',  b: 'Barty',        m: 'dec' },
    { ev: 'AMA 001', a: 'Bluray',     b: 'Dragon5000',   m: 'dec' },
    // AMA 002
    { ev: 'AMA 002', a: 'Nick Diaz',  b: 'Magma',        m: 'ko'  },
    { ev: 'AMA 002', a: 'vite',       b: 'Adel',         m: 'ko'  },
    { ev: 'AMA 002', a: 'El eagle',   b: 'WeStY',        m: 'dec' },
    { ev: 'AMA 002', a: 'Sephtis',    b: 'Tickle “TMT” Monster', m: 'ko' },
    { ev: 'AMA 002', a: 'Garcieh',    b: 'JP',           m: 'ko'  },
    { ev: 'AMA 002', a: 'Yoshiki',    b: '3 Dot',        m: 'ko', skip: 'both' },
    // AMA 003
    { ev: 'AMA 003', a: 'Swayz',      b: 'PLIXY',        m: 'dec' },
    { ev: 'AMA 003', a: 'The Surgeon', b: 'Wezayy',      m: 'ko'  },
    { ev: 'AMA 003', a: 'Sephtis',    b: 'Jeffbob',      m: 'ko'  },
    { ev: 'AMA 003', a: 'Ghost',      b: 'El eagle',     m: 'dec' },
    { ev: 'AMA 003', a: 'Ashton',     b: 'Garcieh',      m: 'dec' },
    { ev: 'AMA 003', a: 'Cobra Boy',  b: 'Bash',         m: 'ko'  },
    { ev: 'AMA 003', a: 'Bluray',     b: 'Taco',         m: 'ko'  },
    // AMA 004
    { ev: 'AMA 004', a: 'Ashton',      b: 'leo',             m: 'ko'  },
    { ev: 'AMA 004', a: 'Killshot Kev', b: '3 Dot',          m: 'ko', skip: 'b' },
    { ev: 'AMA 004', a: 'WeStY',       b: 'Swayz',           m: 'dec' },
    { ev: 'AMA 004', a: 'Sephtis',     b: 'ddbbd',           m: 'ko'  },
    { ev: 'AMA 004', a: 'El eagle',    b: 'ilia topuria',    m: 'dec' },
    { ev: 'AMA 004', a: 'Garcieh',     b: 'JP',              m: 'ko'  },
    { ev: 'AMA 004', a: 'The Surgeon', b: 'Ghost',           m: 'draw' },
    { ev: 'AMA 004', a: 'Orchard',     b: 'Nick Diaz',       m: 'dec' },
    { ev: 'AMA 004', a: 'Grayson \u201cThe Ragin Cajun\u201d', b: 'Youngslowwilson', m: 'ko' },
    { ev: 'AMA 004', a: 'Boiled Bubblegum', b: 'IPPO',       m: 'dec', skip: 'both' },
    // AMA 005
    { ev: 'AMA 005', a: 'Roatan',     b: 'Ashton',       m: 'dec' },
    { ev: 'AMA 005', a: 'Stevie',     b: 'Bluray',       m: 'dec' },
    { ev: 'AMA 005', a: 'Nick Diaz',  b: 'Zac',          m: 'ko'  },
    { ev: 'AMA 005', a: 'KX7',        b: 'Xirved',       m: 'dec' },
    { ev: 'AMA 005', a: 'Garcieh',    b: 'Ghost',        m: 'ko'  },
    { ev: 'AMA 005', a: 'Jaybocka',   b: 'Killshot Kev', m: 'dec' },
    { ev: 'AMA 005', a: 'Mystic',     b: 'Vinyl',        m: 'ko'  }
];
// On the roster but with no counted fights yet
const rosterExtras = ['Styxo', 'Eddeh', 'Volg'];
// Results from before AMA 001 / fights not on any card above. Counts only (dec, ko, draw, loss).
// Example: 'Name': { dec: 1, loss: 1 }  (empty for now - every record comes from the fights list above)
const earlierRecords = {};

function fighterStats(name) {
    const st = { dec: 0, ko: 0, draw: 0, loss: 0, history: [] };
    fights.forEach(f => {
        const isA = f.a === name, isB = f.b === name;
        if (!isA && !isB) return;
        const skipped = f.skip === 'both' || (isA && f.skip === 'a') || (isB && f.skip === 'b');
        const label = f.m === 'dec' ? 'Decision' : f.m === 'ko' ? 'KO' : 'Draw';
        const opp = isA ? f.b : f.a;
        let text;
        if (f.m === 'draw') { text = `Draw vs ${opp}`; if (!skipped) st.draw++; }
        else if (isA)       { text = `Win (${label}) vs ${opp}`;  if (!skipped) st[f.m]++; }
        else                { text = `Loss (${label}) vs ${opp}`; if (!skipped) st.loss++; }
        st.history.push({ ev: f.ev, text: text + (skipped ? ' (not in record)' : '') });
    });
    const extra = earlierRecords[name];
    if (extra) {
        ['dec', 'ko', 'draw', 'loss'].forEach(k => { st[k] += extra[k] || 0; });
        const wins = (extra.dec || 0) + (extra.ko || 0);
        const bits = [];
        if (wins) bits.push(wins + (wins === 1 ? ' win' : ' wins'));
        if (extra.draw) bits.push(extra.draw + (extra.draw === 1 ? ' draw' : ' draws'));
        if (extra.loss) bits.push(extra.loss + (extra.loss === 1 ? ' loss' : ' losses'));
        st.history.unshift({ ev: 'Earlier', text: bits.join(', ') + ' (details not recorded)' });
    }
    return st;
}

// Record in W-L-D format, same as the Discord posts
function recordText(st) { return `${st.dec + st.ko}-${st.loss}-${st.draw}`; }

function buildRoster() {
    const grid = document.getElementById('roster-grid');
    if (!grid) return;
    const names = new Set(rosterExtras);
    fights.forEach(f => { names.add(f.a); names.add(f.b); });
    [...names].sort((x, y) => x.toLowerCase().localeCompare(y.toLowerCase())).forEach(name => {
        const st = fighterStats(name);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'roster-card';
        const thumb = document.createElement('span'); thumb.className = 'rc-photo';
        thumb.textContent = name.replace(/[^A-Za-z0-9]/g, '').charAt(0).toUpperCase();
        const src = photoFor(name);
        if (src) {
            const img = new Image();
            img.alt = name;
            img.onload = () => { thumb.textContent = ''; thumb.appendChild(img); };
            img.src = src; // if the file doesn't exist, the letter stays
        }
        const info = document.createElement('span'); info.className = 'rc-info';
        const n = document.createElement('span'); n.className = 'rc-name'; n.textContent = name;
        const t = document.createElement('span'); t.className = 'rc-sub'; t.textContent = recordText(st);
        info.append(n, t);
        btn.append(thumb, info);
        btn.onclick = () => openFighter(name);
        grid.appendChild(btn);
    });
}

function openFighter(name) {
    const st = fighterStats(name);
    document.getElementById('fm-name').textContent = name;
    document.getElementById('fm-total').textContent = 'Record: ' + recordText(st);
    document.getElementById('fm-dec').textContent = st.dec;
    document.getElementById('fm-ko').textContent = st.ko;
    document.getElementById('fm-draw').textContent = st.draw;
    document.getElementById('fm-loss').textContent = st.loss;
    const photo = document.getElementById('fm-photo');
    photo.innerHTML = '';
    photo.hidden = true;
    const psrc = photoFor(name);
    if (psrc) {
        const img = new Image();
        img.alt = name;
        img.onload = () => { photo.appendChild(img); photo.hidden = false; };
        img.src = psrc;
    }
    const list = document.getElementById('fm-history');
    list.innerHTML = '';
    if (!st.history.length) {
        const li = document.createElement('li'); li.textContent = 'No fights yet'; list.appendChild(li);
    }
    st.history.forEach(h => {
        const li = document.createElement('li');
        const e = document.createElement('b'); e.textContent = h.ev;
        li.append(e, ' ' + h.text);
        list.appendChild(li);
    });
    document.getElementById('fighter-modal').hidden = false;
    document.body.style.overflow = 'hidden';
}

function closeFighter() {
    document.getElementById('fighter-modal').hidden = true;
    document.body.style.overflow = '';
}

document.getElementById('fighter-modal').addEventListener('click', e => { if (e.target.id === 'fighter-modal') closeFighter(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeFighter(); });
buildRoster();

// If an ad video can't load (file missing from the folder), say so instead of showing a dead player
document.querySelectorAll('.ad-item video').forEach(v => {
    const sources = v.querySelectorAll('source');
    const last = sources[sources.length - 1];
    if (last) last.addEventListener('error', () => {
        const msg = v.closest('.ad-item').querySelector('.ad-error');
        if (msg) msg.hidden = false;
    });
    // Only one ad plays at a time
    v.addEventListener('play', () => {
        document.querySelectorAll('.ad-item video').forEach(o => { if (o !== v) o.pause(); });
    });
});