
const $ = (sel)=>document.querySelector(sel);
const topicsWrap = document.getElementById('topics');
const themesWrap = document.getElementById('themes');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const refreshBtn = document.getElementById('refreshBtn');
const selectAllBtn = document.getElementById('selectAll');
const clearAllBtn = document.getElementById('clearAll');


const DEFAULT_SELECTIONS = new Set(QUOTE_TOPICS);

const DEFAULT_BG = 'calm-1';


const BACKGROUNDS = [
  { key:'calm-1', label:'Misty Forest', file:'backgrounds/calm-1.jpg' },
  { key:'calm-2', label:'Ocean Dawn', file:'backgrounds/calm-2.jpg' },
  { key:'calm-3', label:'Soft Clouds', file:'backgrounds/calm-3.jpg' },
  { key:'calm-4', label:'Mountain Haze', file:'backgrounds/calm-4.jpg' },
  { key:'calm-5', label:'Warm Bokeh', file:'backgrounds/calm-5.jpg' },
  { key:'calm-6', label:'Desert Dusk', file:'backgrounds/calm-6.jpg' },
  { key:'calm-7', label:'Calm Lake', file:'backgrounds/calm-7.jpg' },
  { key:'calm-8', label:'Snowfall', file:'backgrounds/calm-8.jpg' },
  { key:'calm-9', label:'Lavender Field', file:'backgrounds/calm-9.jpg' },
  { key:'calm-10', label:'Aurora', file:'backgrounds/calm-10.jpg' },
];

// ---------- storage helpers ----------
async function getSelections(){
  return new Promise(resolve => {
    if(!chrome?.storage?.sync){
      const local = JSON.parse(localStorage.getItem('quoteSelections')||'[]');
      return resolve(new Set(local.length? local : Array.from(DEFAULT_SELECTIONS)));
    }
    chrome.storage.sync.get(['quoteSelections'], (res)=>{
      const arr = res.quoteSelections || Array.from(DEFAULT_SELECTIONS);
      resolve(new Set(arr));
    });
  });
}
async function saveSelections(set){
  const arr = Array.from(set);
  if(!chrome?.storage?.sync){
    localStorage.setItem('quoteSelections', JSON.stringify(arr));
    return;
  }
  chrome.storage.sync.set({ quoteSelections: arr });
}
async function getBgTheme(){
  return new Promise(resolve => {
    if(!chrome?.storage?.sync){
      const v = localStorage.getItem('bgTheme') || DEFAULT_BG;
      return resolve(v);
    }
    chrome.storage.sync.get(['bgTheme'], (res)=>{
      resolve(res.bgTheme || DEFAULT_BG);
    });
  });
}
async function saveBgTheme(key){
  if(!chrome?.storage?.sync){
    localStorage.setItem('bgTheme', key);
    return;
  }
  chrome.storage.sync.set({ bgTheme: key });
}

// ---------- quotes loading & logic ----------
function normalizeTopic(t){ return t.trim(); }
function normalizeQuote(text){
  return text.replace(/[\s\u201c\u201d\u2018\u2019"'.,;:!?()\-]/g,'').toLowerCase();
}

async function loadAllQuotes(){
  const seen = new Set();
  const all = [];
  for(const topic of QUOTE_TOPICS){
    const url = TOPIC_FILES[topic];
    try{
      const resp = await fetch(url);
      if(!resp.ok) throw new Error('fetch failed');
      const arr = await resp.json(); // [{ text, author }]
      for(const q of arr){
        if(!q?.text || !q?.author) continue;
        if(EXCLUDE_AUTHORS.has(q.author)) continue; // skip politicians
        const norm = normalizeQuote(q.text);
        if(seen.has(norm)) continue; // enforce no overlap across topics
        seen.add(norm);
        all.push({ text: q.text, author: q.author, topics:[topic] });
      }
    }catch(e){
      console.warn('Missing/invalid quote file for', topic, url);
    }
  }
  if(all.length === 0 && Array.isArray(FALLBACK_QUOTES)) return FALLBACK_QUOTES;
  return all;
}

function pickRandom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function filterQuotes(selected, allQuotes){
  const sel = new Set(Array.from(selected).map(normalizeTopic));
  const list = allQuotes.filter(q => q.topics && q.topics.some(t => sel.has(t)));
  return list.length ? list : allQuotes;
}

function renderTopics(selected){
  topicsWrap.innerHTML = '';
  QUOTE_TOPICS.forEach(topic => {
    const btn = document.createElement('button');
    btn.className = 'topic'+(selected.has(topic)?' active':'');
    btn.setAttribute('type','button');
    btn.setAttribute('aria-pressed', selected.has(topic)?'true':'false');
    btn.innerHTML = `<input type="checkbox" ${selected.has(topic)?'checked':''} aria-label="${topic}"> ${topic}`;
    btn.addEventListener('click', async ()=>{
      if(selected.has(topic)) selected.delete(topic); else selected.add(topic);
      await saveSelections(selected);
      renderTopics(selected);
      showRandomQuote(selected);
    });
    topicsWrap.appendChild(btn);
  });
}

function displayQuote(q){
  if(!q){ quoteText.textContent = 'No quotes available yet.'; quoteAuthor.textContent = ''; return; }
  quoteText.textContent = `“${q.text}”`;
  quoteAuthor.textContent = `— ${q.author}`;
}

let ALL_QUOTES = [];
function showRandomQuote(selected){
  const pool = filterQuotes(selected, ALL_QUOTES);
  displayQuote(pool.length ? pickRandom(pool) : null);
}

function applyBackground(key){
  const item = BACKGROUNDS.find(b=>b.key===key) || BACKGROUNDS[0];
  if(item){ document.body.style.backgroundImage = `url('${item.file}')`; }
}
function preloadBackgrounds(){ BACKGROUNDS.forEach(b=>{ const img = new Image(); img.src = b.file; }); }

function renderThemes(activeKey){
  themesWrap.innerHTML = '';
  BACKGROUNDS.forEach(bg=>{
    const el = document.createElement('button');
    el.className = 'theme'+(bg.key===activeKey?' active':'');
    el.setAttribute('type','button');
    el.setAttribute('role','option');
    el.innerHTML = `<img src="${bg.file}" alt="${bg.label}"><span class="label">${bg.label}</span>`;
    el.addEventListener('click', async ()=>{
      await saveBgTheme(bg.key);
      applyBackground(bg.key);
      renderThemes(bg.key);
    });
    themesWrap.appendChild(el);
  });
}

(async function init(){
  const selected = await getSelections();
  const themeKey = await getBgTheme();
  preloadBackgrounds();
  renderTopics(selected);
  renderThemes(themeKey);
  applyBackground(themeKey);

  ALL_QUOTES = await loadAllQuotes();
  showRandomQuote(selected);

  refreshBtn.addEventListener('click', ()=> showRandomQuote(selected));
  selectAllBtn.addEventListener('click', async ()=>{
    QUOTE_TOPICS.forEach(t=>selected.add(t));
    await saveSelections(selected);
    renderTopics(selected);
    showRandomQuote(selected);
  });
  clearAllBtn.addEventListener('click', async ()=>{
    selected.clear();
    await saveSelections(selected);
    renderTopics(selected);
    showRandomQuote(selected);
  });
})();
