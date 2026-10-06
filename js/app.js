const NK = 'vjes_notices', RK = 'vjes_results', PK = 'vjes_principal';
const CATEGORIES = ['Exam', 'Holiday', 'Event', 'General'];
const $ = id => document.getElementById(id);
const get = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const put = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const today = () => new Date().toISOString().slice(0, 10);

function loadNotices() {
  let n = get(NK, null);
  if (!n) {
    n = [{ id: 1, title: 'Welcome to our new website', category: 'General',
      message: 'Notices and exam results of Viddhya Jyoti English School will be published here.',
      date: today(), author: 'Principal', status: 'published' }];
    put(NK, n);
  }
  return n;
}
const saveNotices = n => put(NK, n);
const loadResults = () => get(RK, []);
const saveResults = r => put(RK, r);

function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

async function hash(t) {
  const s = 'vjes:' + t;
  if (window.crypto && crypto.subtle) {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  let h = 5381;
  for (const c of s) h = (h * 33) ^ c.charCodeAt(0);
  return 'x' + (h >>> 0).toString(16);
}

function topbar(active) {
  const links = [['index.html', 'Home'], ['notices.html', 'Notices'], ['results.html', 'Results'], ['admin.html', 'Principal']];
  $('top').innerHTML = `<div class="in bar"><a class="brand" href="index.html"><img src="images/logo.jpeg" alt="School logo"><span>Viddhya Jyoti English School</span></a><nav>` +
    links.map(([h, t]) => `<a href="${h}"${h === active ? ' class="on"' : ''}>${t}</a>`).join('') + `</nav></div>`;
}
function footer() {
  $('foot').innerHTML = '<div class="in">Viddhya Jyoti English School · Madi-1, Baruwa, Chitwan, Nepal · Estd. 2052</div>';
}
function noteHTML(n, extra = '') {
  return `<article class="note ${n.category}"><h3>${esc(n.title)}</h3>
    <div class="meta">${esc(n.category)} · ${esc(n.date)} · ${esc(n.author)} ${extra}</div>
    <p>${esc(n.message)}</p><div class="row" data-id="${n.id}"></div></article>`;
}
function fillCategories(sel, all) {
  sel.innerHTML = (all ? '<option value="">All categories</option>' : '') + CATEGORIES.map(c => `<option>${c}</option>`).join('');
}
function grade(p) { return p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'B+' : p >= 60 ? 'B' : p >= 50 ? 'C' : p >= 40 ? 'D' : 'Fail'; }

function resultHTML(r) {
  let tot = 0, full = 0, pass = true;
  const rows = r.subjects.map(s => {
    tot += s.m; full += s.f;
    const ok = s.m >= s.f * 0.4;
    if (!ok) pass = false;
    return `<tr><td>${esc(s.n)}</td><td>${s.f}</td><td>${s.m}</td><td class="${ok ? 'ok' : 'bad'}">${ok ? 'Pass' : 'Fail'}</td></tr>`;
  }).join('');
  const p = full ? tot / full * 100 : 0;
  return `<section class="card result">
    <h3>${esc(r.name)}</h3>
    <div class="meta">${esc(r.exam)} · Class ${esc(r.cls)} · Roll no. ${esc(r.roll)}</div>
    <div class="wide"><table><tr><th>Subject</th><th>Full marks</th><th>Marks</th><th>Status</th></tr>${rows}</table></div>
    <p class="sum"><b>Total:</b> ${tot}/${full} · <b>Percentage:</b> ${p.toFixed(1)}% · <b>Grade:</b> ${grade(p)} ·
    <b class="${pass ? 'ok' : 'bad'}">${pass ? 'PASSED' : 'FAILED'}</b></p></section>`;
}
