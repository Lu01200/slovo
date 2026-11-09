const WORDS = window.WORDS || [];
const TOTAL = WORDS.length;
const EXAMPLE_TOTAL = TOTAL * 3;

const LESSON_LABEL = {
  0: "补充",
  1: "Урок 1",
  2: "Урок 2",
  4: "Урок 4"
};

const GENDER = {
  m: { zh: "阳性", en: "masculine", className: "m" },
  f: { zh: "阴性", en: "feminine", className: "f" },
  n: { zh: "中性", en: "neuter", className: "n" }
};

const TYPE_INFO = {
  noun: { zh: "名词", en: "noun" },
  verb: { zh: "动词", en: "verb" },
  adj: { zh: "形容词", en: "adjective" },
  pron: { zh: "代词", en: "pronoun" },
  other: { zh: "其他", en: "other" }
};

const FILTER_TYPES = [
  { key: "all", label: "全部" },
  { key: "noun", label: "名词" },
  { key: "verb", label: "动词" },
  { key: "adj", label: "形容词" },
  { key: "other", label: "其他" }
];

const PRONOUN_KIND = {
  personal: "人称代词",
  possessive: "物主代词",
  "possessive-invariant": "不变物主代词",
  quantifier: "限定代词"
};

const CASES = [
  { key: "nom", short: "Им.", ru: "Именительный", zh: "主格", icon: "📌" },
  { key: "gen", short: "Род.", ru: "Родительный", zh: "属格", icon: "🔍" },
  { key: "dat", short: "Дат.", ru: "Дательный", zh: "与格", icon: "🎁" },
  { key: "acc", short: "Вин.", ru: "Винительный", zh: "宾格", icon: "👀" },
  { key: "ins", short: "Тв.", ru: "Творительный", zh: "工具格", icon: "🤝" },
  { key: "prep", short: "Пр.", ru: "Предложный", zh: "前置格", icon: "💬" }
];

const CASE_BY_KEY = Object.fromEntries(CASES.map((item) => [item.key, item]));
CASE_BY_KEY.use = { key: "use", short: "例", ru: "Пример", zh: "用法", icon: "✍️" };

const VERB_PERSONS = ["я", "ты", "он / она / оно", "мы", "вы", "они"];
const PAST_LABELS = ["阳性", "阴性", "中性", "复数"];

const ICONS = {
  arrow: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrowLeft: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 10H5M9 5l-5 5 5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  check: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4 10 4 4 8-8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  speaker: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 8v4h3l4 3V5L7 8H4Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M14 7.5a3.5 3.5 0 0 1 0 5M16 5.5a6 6 0 0 1 0 9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  spark: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5c.6 4.2 2.3 5.9 6.5 6.5-4.2.6-5.9 2.3-6.5 6.5-.6-4.2-2.3-5.9-6.5-6.5 4.2-.6 5.9-2.3 6.5-6.5Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  info: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M10 9v4M10 6.3v.4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  restart: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 10a6 6 0 1 1-1.8-4.3M16 4v5h-5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

const STORAGE_KEY = "slovo.known.v1";
const SRS_KEY = "slovo.srs.v2";
const STUDY_GROUP_SIZE = 20;
// Ebbinghaus review intervals: 5 min, 30 min, 12 h, 1 d, 2 d, 4 d, 7 d, 15 d, 30 d, 60 d.
const SRS_INTERVALS = [
  5 * 60 * 1000,
  30 * 60 * 1000,
  12 * 60 * 60 * 1000,
  24 * 60 * 60 * 1000,
  2 * 24 * 60 * 60 * 1000,
  4 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
  15 * 24 * 60 * 60 * 1000,
  30 * 24 * 60 * 60 * 1000,
  60 * 24 * 60 * 60 * 1000
];

const state = {
  lesson: "all",
  type: "all",
  query: "",
  filtered: [...WORDS],
  known: loadKnown(),
  detailIndex: -1
};

const study = {
  queue: [],
  index: 0,
  flipped: false,
  mode: "recognition",
  groupNumber: 0,
  spellingChecked: false,
  spellingCorrect: null
};

let srsProgress = loadSrs();

const elements = {
  grid: document.getElementById("wordGrid"),
  empty: document.getElementById("emptyState"),
  search: document.getElementById("searchInput"),
  searchClear: document.getElementById("searchClear"),
  lessonFilter: document.getElementById("lessonFilter"),
  typeFilter: document.getElementById("typeFilter"),
  resultCount: document.getElementById("resultCount"),
  filterHint: document.getElementById("filterHint"),
  resetFilters: document.getElementById("resetFilters"),
  randomWord: document.getElementById("randomWord"),
  wordDialog: document.getElementById("wordDialog"),
  detailContent: document.getElementById("detailContent"),
  dialogClose: document.getElementById("dialogClose"),
  studyDialog: document.getElementById("studyDialog"),
  studyContent: document.getElementById("studyContent"),
  toast: document.getElementById("toast")
};

let toastTimer = 0;
let speechVoiceCache = [];

/* ---------- Utilities ---------- */

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[character];
  });
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function stripStress(value) {
  return String(value).replace(/\u0301/g, "");
}

function normalizeText(value) {
  return stripStress(String(value))
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTarget(value) {
  const match = String(value).match(/\[\[(.+?)\]\]/);
  return match ? match[1] : "";
}

function cleanSpeech(value) {
  return stripStress(String(value).replace(/\[\[|\]\]/g, ""));
}

function renderSentence(value) {
  return escapeHtml(value).replace(/\[\[(.+?)\]\]/g, '<span class="target">$1</span>');
}

function padNumber(value) {
  return String(value).padStart(2, "0");
}

function initialOf(word) {
  return stripStress(word).charAt(0).toUpperCase();
}

const STRESS_MARK = "\u0301";
const VOWEL_SET = new Set([...'аеёиоуыэюяАЕЁИОУЫЭЮЯ']);

function stressHtml(value) {
  return String(value)
    .split(/(\s+)/)
    .map((token) => {
      if (!token || /^\s+$/.test(token)) return token;
      const chars = [...token];
      const parts = [];
      const vowelIndexes = [];
      let marked = false;

      for (let index = 0; index < chars.length; index += 1) {
        const char = chars[index];
        if (char === STRESS_MARK) continue;
        const isVowel = VOWEL_SET.has(char);
        const isStressed = chars[index + 1] === STRESS_MARK || char.toLowerCase() === "ё";
        if (isVowel) vowelIndexes.push(parts.length);
        if (isStressed) marked = true;
        parts.push({ char, isStressed });
      }

      // A word always gets exactly one visible stress position. Words of one
      // syllable are stressed on their only vowel; ё is inherently stressed.
      if (!marked && vowelIndexes.length > 0) {
        parts[vowelIndexes[0]].isStressed = true;
      }

      return parts
        .map((part) => part.isStressed
          ? `<span class="stress">${escapeHtml(part.char)}</span>`
          : escapeHtml(part.char))
        .join("");
    })
    .join("");
}

function typeOf(word) {
  return word.type || "noun";
}

function positionLabel(word) {
  return word.posLabel || (TYPE_INFO[typeOf(word)] || TYPE_INFO.other).zh;
}

function isNoun(word) {
  return typeOf(word) === "noun";
}

function isVerb(word) {
  return typeOf(word) === "verb";
}

function accentOf(word) {
  if (isNoun(word)) return GENDER[word.g] ? GENDER[word.g].className : "n";
  return typeOf(word);
}

function shortPosLabel(word) {
  return positionLabel(word).split("/")[0].trim();
}

function conjugationLabel(word) {
  if (!word.conj) return "";
  return word.conj.type === "I" ? "第一变位法" : "第二变位法";
}

function cardTypeChip(word) {
  if (isNoun(word)) return word.f && !word.f.s ? "复数" : (GENDER[word.g] ? GENDER[word.g].zh : "名词");
  if (isVerb(word)) return word.conj ? (word.conj.type === "I" ? "第一变位" : "第二变位") : "动词";
  if (typeOf(word) === "adj") return "形容词";
  if (typeOf(word) === "pron") return "代词";
  return shortPosLabel(word);
}

function typeTag(word) {
  if (isNoun(word)) return word.f && !word.f.s ? "复数" : (GENDER[word.g] ? GENDER[word.g].zh : "名词");
  if (isVerb(word)) return word.conj ? (word.conj.type === "I" ? "第一变位" : "第二变位") : "动词";
  if (typeOf(word) === "adj") return word.short ? "短尾" : "性数形式";
  if (typeOf(word) === "pron") return PRONOUN_KIND[word.kind] || "代词";
  return "不变词";
}

function declensionLabel(word) {
  if (!isNoun(word)) return "";
  if (word.decl) return word.decl;
  if (word.g === "f") {
    return /ь$/.test(stripStress(word.ru)) ? "第三变格法 · 阴性" : "第一变格法 · 阴性";
  }
  if (word.g === "m") {
    return /ь$/.test(stripStress(word.ru)) ? "第二变格法 · 阳性软音" : "第二变格法 · 阳性";
  }
  return "第二变格法 · 中性";
}

function collectForms(word) {
  const forms = [];
  if (word.f) {
    if (word.f.s) forms.push(...word.f.s);
    if (word.f.p) forms.push(...word.f.p);
  }
  if (word.conj) {
    forms.push(...word.conj.present, ...word.conj.past);
    if (word.conj.imperative) forms.push(...word.conj.imperative.filter(Boolean));
  }
  if (word.forms) forms.push(...Object.values(word.forms));
  if (word.cases) forms.push(...Object.values(word.cases));
  return forms;
}

function lessonName(lesson) {
  return LESSON_LABEL[lesson] ?? "补充";
}

function typeFilterLabel(key) {
  return (FILTER_TYPES.find((item) => item.key === key) || FILTER_TYPES[0]).label;
}

function loadKnown() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(stored)) return new Set();
    const valid = stored.filter((id) => WORDS.some((word) => word.id === id));
    return new Set(valid);
  } catch (error) {
    return new Set();
  }
}

function saveKnown() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.known]));
  } catch (error) {
    // Storage can be disabled in private browsing; the session still works.
  }
}

function loadSrs() {
  try {
    const stored = JSON.parse(localStorage.getItem(SRS_KEY) || "{}");
    return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
  } catch (error) {
    return {};
  }
}

function saveSrs() {
  try {
    localStorage.setItem(SRS_KEY, JSON.stringify(srsProgress));
  } catch (error) {
    // Progress still works for the current session if storage is unavailable.
  }
}

function getSrs(word) {
  return srsProgress[word.id] || { stage: 0, due: 0, right: 0, wrong: 0 };
}

function scheduleWord(word, correct) {
  const previous = getSrs(word);
  const now = Date.now();
  if (correct) {
    const intervalIndex = Math.min(previous.stage, SRS_INTERVALS.length - 1);
    const nextStage = Math.min(previous.stage + 1, SRS_INTERVALS.length);
    srsProgress[word.id] = {
      stage: nextStage,
      due: now + SRS_INTERVALS[intervalIndex],
      right: (previous.right || 0) + 1,
      wrong: previous.wrong || 0,
      last: now
    };
  } else {
    srsProgress[word.id] = {
      stage: 0,
      due: now + SRS_INTERVALS[0],
      right: previous.right || 0,
      wrong: (previous.wrong || 0) + 1,
      last: now
    };
  }
  saveSrs();
}

function setWordKnown(word, value) {
  if (value && !state.known.has(word.id)) {
    state.known.add(word.id);
    saveKnown();
    updateKnownUI();
  } else if (!value && state.known.has(word.id)) {
    state.known.delete(word.id);
    saveKnown();
    updateKnownUI();
  }
}

function normalizeAnswer(value) {
  return stripStress(String(value))
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^а-я]/g, "");
}

function formatDuration(milliseconds) {
  const minutes = Math.max(1, Math.round(milliseconds / 60000));
  if (minutes < 60) return `${minutes} 分钟后`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} 小时后`;
  const days = Math.round(hours / 24);
  return `${days} 天后`;
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2200);
}

function syncBodyLock() {
  document.body.classList.toggle(
    "is-locked",
    elements.wordDialog.open || elements.studyDialog.open
  );
}

/* ---------- Speech ---------- */

function refreshVoices() {
  if (!("speechSynthesis" in window)) return;
  speechVoiceCache = window.speechSynthesis.getVoices();
}

function findRussianVoice() {
  if (!speechVoiceCache.length) refreshVoices();
  const russianVoices = speechVoiceCache.filter((voice) => /^ru(-|_|$)/i.test(voice.lang));
  return (
    russianVoices.find((voice) => /milena|yuri|google|microsoft|anna|katya/i.test(voice.name)) ||
    russianVoices[0] ||
    null
  );
}

function speak(value) {
  if (!("speechSynthesis" in window)) {
    showToast("当前浏览器不支持语音朗读");
    return;
  }

  const text = cleanSpeech(value).trim();
  if (!text) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ru-RU";
  utterance.rate = 0.88;
  utterance.pitch = 1;
  const voice = findRussianVoice();
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}

if ("speechSynthesis" in window) {
  refreshVoices();
  window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
}

/* ---------- Filtering and cards ---------- */

function typeMatches(word, filter) {
  if (filter === "all") return true;
  const type = typeOf(word);
  if (filter === "other") return !["noun", "verb", "adj"].includes(type);
  return type === filter;
}

function getFilteredWords() {
  const query = normalizeText(state.query);
  return WORDS.filter((word) => {
    if (state.lesson !== "all" && word.l !== Number(state.lesson)) return false;
    if (!typeMatches(word, state.type)) return false;
    if (!query) return true;

    const haystack = [
      word.ru,
      word.zh,
      word.en,
      positionLabel(word),
      word.note || "",
      ...collectForms(word),
      ...word.ex.map((example) => example[0])
    ]
      .map(normalizeText)
      .join(" ");

    return haystack.includes(query);
  });
}

function cardTemplate(word, index) {
  const accent = accentOf(word);
  const known = state.known.has(word.id);
  return `
    <button
      type="button"
      class="word-card${known ? " is-known" : ""}"
      data-id="${escapeAttribute(word.id)}"
      style="--i:${index}"
      aria-label="${escapeAttribute(`${word.ru}，${word.zh}，${positionLabel(word)}，打开词条`)}"
    >
      <span class="card-art card-art--${accent}">
        <span class="card-initial" aria-hidden="true">${escapeHtml(initialOf(word.ru))}</span>
        <span class="card-lesson">${lessonName(word.l)}</span>
        <span class="card-gender card-gender--${accent}">${escapeHtml(cardTypeChip(word))}</span>
        <span class="card-emoji" aria-hidden="true">${word.icon}</span>
        <span class="card-known">${ICONS.check} 已掌握</span>
        <span class="card-index">${padNumber(index + 1)} / ${TOTAL}</span>
      </span>
      <span class="card-body">
        <span class="card-word" lang="ru">${stressHtml(word.ru)}</span>
        <span class="card-meaning">${escapeHtml(word.zh)}<em>${escapeHtml(word.en)}</em></span>
        <span class="card-footer">
          <span class="card-tags"><span>${escapeHtml(shortPosLabel(word))}</span><span>${escapeHtml(typeTag(word))}</span></span>
          <span class="card-arrow">${ICONS.arrow}</span>
        </span>
      </span>
    </button>
  `;
}

function renderGrid() {
  state.filtered = getFilteredWords();
  elements.grid.innerHTML = state.filtered.map(cardTemplate).join("");
  elements.empty.hidden = state.filtered.length > 0;
  elements.grid.hidden = state.filtered.length === 0;

  elements.resultCount.textContent = state.filtered.length;

  const hints = [];
  if (state.lesson !== "all") hints.push(lessonName(state.lesson));
  if (state.type !== "all") hints.push(typeFilterLabel(state.type));
  if (state.query.trim()) hints.push(`“${state.query.trim()}”`);
  elements.filterHint.textContent = hints.length ? hints.join(" · ") : "全部词条";

  const hasFilter =
    state.lesson !== "all" || state.type !== "all" || state.query.trim().length > 0;
  elements.resetFilters.hidden = !hasFilter;
  elements.searchClear.hidden = state.query.length === 0;

  updateKnownUI();
}

function updateSegments() {
  [[elements.lessonFilter, "lesson"], [elements.typeFilter, "type"]].forEach(
    ([container, key]) => {
      if (!container) return;
      container.querySelectorAll("button[data-value]").forEach((button) => {
        const active = button.dataset.value === state[key];
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    }
  );
}

function updateKnownUI() {
  const knownCount = state.known.size;
  const percentage = TOTAL ? (knownCount / TOTAL) * 100 : 0;

  document.querySelectorAll("[data-known-count]").forEach((node) => {
    node.textContent = knownCount;
  });

  document.querySelectorAll("[data-progress-fill]").forEach((node) => {
    node.style.width = `${percentage}%`;
  });

  document.querySelectorAll(".word-card").forEach((card) => {
    card.classList.toggle("is-known", state.known.has(card.dataset.id));
  });

  const detailButton = elements.detailContent.querySelector('[data-action="known"]');
  if (detailButton) {
    const detailWord = WORDS[state.detailIndex];
    const isKnown = detailWord ? state.known.has(detailWord.id) : false;
    detailButton.classList.toggle("is-known", isKnown);
    detailButton.setAttribute("aria-pressed", String(isKnown));
    const label = detailButton.querySelector("span");
    if (label) label.textContent = isKnown ? "已掌握" : "标记已掌握";
    detailButton.querySelector("svg").outerHTML = isKnown ? ICONS.check : ICONS.spark;
  }
}

function toggleKnown(wordId) {
  if (state.known.has(wordId)) {
    state.known.delete(wordId);
    showToast("已取消掌握标记");
  } else {
    state.known.add(wordId);
    showToast("已标记为掌握");
  }
  saveKnown();
  updateKnownUI();
}

function setQuery(value) {
  state.query = value;
  renderGrid();
}

function resetAllFilters() {
  state.lesson = "all";
  state.type = "all";
  state.query = "";
  elements.search.value = "";
  updateSegments();
  renderGrid();
}

/* ---------- Grammar blocks ---------- */

function nounGrammarHtml(word) {
  const singularForms = word.f ? word.f.s : null;
  const pluralForms = word.f ? word.f.p : null;

  const casesHtml = CASES.map((caseItem, caseIndex) => {
    const singular = singularForms ? singularForms[caseIndex] : null;
    const plural = pluralForms ? pluralForms[caseIndex] : null;
    return `
      <tr>
        <td>
          <span class="case-cell">
            <strong>${caseItem.short}</strong>
            <span>${caseItem.zh}</span>
          </span>
        </td>
        <td class="form-cell${singular ? "" : " is-empty"}" lang="ru">${singular ? escapeHtml(singular) : "—"}</td>
        <td class="form-cell${plural ? "" : " is-empty"}" lang="ru">${plural ? escapeHtml(plural) : "—"}</td>
      </tr>
    `;
  }).join("");

  return `
    <table class="declension-table">
      <thead>
        <tr><th>格</th><th>单数</th><th>复数</th></tr>
      </thead>
      <tbody>${casesHtml}</tbody>
    </table>
  `;
}

function verbGrammarHtml(word) {
  const conj = word.conj;
  if (!conj) return "";
  const forms = conj.present.map((form, index) => `
    <tr>
      <td><span class="person-cell">${escapeHtml(VERB_PERSONS[index])}</span></td>
      <td class="form-cell" lang="ru">${escapeHtml(form)}</td>
    </tr>
  `).join("");
  const past = conj.past.map((form, index) => `
    <div class="form-pill"><span>${PAST_LABELS[index]}</span><b lang="ru">${escapeHtml(form)}</b></div>
  `).join("");
  const imperative = (conj.imperative || []).filter(Boolean);
  const imperativeHtml = imperative.length
    ? `<div class="conj-line"><span>命令式</span><div class="form-pills">${imperative.map((form, index) => `<span class="form-pill form-pill--simple"><b lang="ru">${escapeHtml(form)}</b><small>${index === 0 ? "ты" : "вы"}</small></span>`).join("")}</div></div>`
    : "";

  return `
    <div class="conj-summary">
      <span class="chip chip--accent">${escapeHtml(conjugationLabel(word))}</span>
      <span class="chip">${escapeHtml(conj.aspect)}</span>
      <span class="chip">${escapeHtml(conj.tense)}</span>
    </div>
    <table class="conj-table">
      <thead><tr><th>人称</th><th>${escapeHtml(conj.tense)}</th></tr></thead>
      <tbody>${forms}</tbody>
    </table>
    <div class="conj-line"><span>过去时</span><div class="form-pills">${past}</div></div>
    ${imperativeHtml}
  `;
}

function genderFormsHtml(word) {
  if (!word.forms) return "";
  const labels = [["m", "阳性"], ["f", "阴性"], ["n", "中性"], ["pl", "复数"]];
  return `
    <div class="gender-forms">
      ${labels.map(([key, label]) => `
        <div class="gender-form">
          <span>${label}</span>
          <b lang="ru">${escapeHtml(word.forms[key] || "—")}</b>
        </div>
      `).join("")}
    </div>
  `;
}

function pronounGrammarHtml(word) {
  if (word.cases) {
    const rows = CASES.map((caseItem) => `
      <tr>
        <td><span class="case-cell"><strong>${caseItem.short}</strong><span>${caseItem.zh}</span></span></td>
        <td class="form-cell" lang="ru">${escapeHtml(word.cases[caseItem.key] || "—")}</td>
      </tr>
    `).join("");
    return `
      <table class="declension-table pronoun-table">
        <thead><tr><th>格</th><th>形式</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }
  if (word.forms) return genderFormsHtml(word);
  return "";
}

function grammarNoteHtml(word) {
  const extraNote =
    word.plNote && !(word.note || "").includes(word.plNote) ? ` ${word.plNote}。` : "";
  const text = `${word.note || ""}${extraNote}`.trim();
  if (!text) return "";
  return `
    <div class="grammar-note">
      ${ICONS.info}
      <p><strong>语法提示</strong> ${escapeHtml(text)}</p>
    </div>
  `;
}

function grammarPanel(word) {
  const type = typeOf(word);
  let title = "语法说明";
  let subtitle = "Грамматика";
  let content = "";

  if (isNoun(word)) {
    title = "六格变化";
    subtitle = "Склонение";
    content = nounGrammarHtml(word);
  } else if (isVerb(word)) {
    title = "动词变位";
    subtitle = "Спряжение";
    content = verbGrammarHtml(word);
  } else if (type === "adj") {
    title = "词形变化";
    subtitle = "Формы";
    content = genderFormsHtml(word);
  } else if (type === "pron") {
    title = "代词形式";
    subtitle = "Формы";
    content = pronounGrammarHtml(word);
  } else {
    content = `
      <div class="invariant-card">
        <span class="invariant-mark">—</span>
        <p>${escapeHtml(word.note || "这个词没有词形变化。")}</p>
      </div>
    `;
  }

  return `
    <section aria-labelledby="grammarHeading">
      <h3 class="panel-title" id="grammarHeading">${title} <span>${subtitle}</span></h3>
      ${content}
      ${type === "other" ? "" : grammarNoteHtml(word)}
    </section>
  `;
}

/* ---------- Word detail ---------- */

function detailTemplate(word) {
  const index = WORDS.indexOf(word);
  const type = typeOf(word);
  const accent = accentOf(word);
  const known = state.known.has(word.id);
  const animate = Boolean(word.animate);

  const examplesHtml = word.ex.map((example, exampleIndex) => {
    const caseKey = example[2] || "use";
    const caseMeta = CASE_BY_KEY[caseKey] || CASE_BY_KEY.use;
    const customLabel = example[3];
    const target = extractTarget(example[0]);
    const speechText = cleanSpeech(example[0]);
    const metaLabel = customLabel || `${caseMeta.short} · ${caseMeta.zh}`;

    return `
      <article class="example">
        <div class="example-art example-art--${caseKey}" aria-hidden="true">
          <span class="example-number">${padNumber(exampleIndex + 1)}</span>
          <span class="example-emoji">${word.icon}</span>
          <span class="example-case-icon">${caseMeta.icon}</span>
        </div>
        <div class="example-copy">
          <div class="example-meta">
            <span class="case-label">${escapeHtml(metaLabel)}</span>
            <span class="case-form" lang="ru">${escapeHtml(target)}</span>
          </div>
          <p class="example-ru" lang="ru">${renderSentence(example[0])}</p>
          <p class="example-zh">${escapeHtml(example[1])}</p>
          <button class="example-speak" type="button" data-speak="${escapeAttribute(speechText)}" aria-label="朗读例句">
            ${ICONS.speaker}
            朗读
          </button>
        </div>
      </article>
    `;
  }).join("");

  const chips = [`<span class="chip chip--accent">${escapeHtml(positionLabel(word))}</span>`];
  if (isNoun(word)) {
    chips.push(`<span class="chip">${word.f && !word.f.s ? "复数名词" : GENDER[word.g].zh + "名词"}</span>`);
    chips.push(`<span class="chip${animate ? " chip--animate" : ""}">${animate ? "动物名词" : "非动物名词"}</span>`);
    chips.push(`<span class="chip">${escapeHtml(declensionLabel(word))}</span>`);
    if (!word.f.p) chips.push('<span class="chip">常用单数</span>');
  } else if (isVerb(word)) {
    chips.push(`<span class="chip">${escapeHtml(conjugationLabel(word))}</span>`);
    chips.push(`<span class="chip">${escapeHtml(word.conj.aspect)}</span>`);
    chips.push(`<span class="chip">${word.conj.tense}</span>`);
  } else if (type === "adj") {
    chips.push(`<span class="chip">${word.short ? "短尾形式" : "长尾形式"}</span>`);
    chips.push("<span class=\"chip\">性 / 数形式</span>");
  } else if (type === "pron") {
    chips.push(`<span class="chip">${escapeHtml(PRONOUN_KIND[word.kind] || "代词")}</span>`);
    chips.push(`<span class="chip">${word.invariant ? "形式不变" : "有格 / 性数变化"}</span>`);
  } else {
    chips.push(`<span class="chip">不变词</span>`);
  }
  chips.push('<span class="chip">3 个例句</span>');

  const subline = [];
  if (isNoun(word)) {
    subline.push(word.f && !word.f.s ? "复数名词" : `${GENDER[word.g].zh}名词`);
    subline.push(animate ? "动物名词" : "非动物名词");
  } else if (isVerb(word)) {
    subline.push(conjugationLabel(word));
    subline.push(word.conj.aspect);
  } else if (type === "adj") {
    subline.push(word.short ? "短尾形式" : "长尾形式");
  } else if (type === "pron") {
    subline.push(PRONOUN_KIND[word.kind] || "代词");
  } else {
    subline.push("不变词");
  }

  return `
    <article class="detail">
      <div class="detail-hero">
        <div class="detail-art detail-art--${accent}" aria-hidden="true">
          <span class="detail-initial">${escapeHtml(initialOf(word.ru))}</span>
          <span class="detail-emoji">${word.icon}</span>
          <span class="detail-art-label">${lessonName(word.l)} · ${padNumber(index + 1)} / ${TOTAL}</span>
        </div>
        <div class="detail-copy">
          <div class="detail-eyebrow">
            <span>${lessonName(word.l)}</span>
            <span class="sep">·</span>
            <span>${escapeHtml(positionLabel(word))}</span>
            ${subline.map((item) => `<span class="sep">·</span><span>${escapeHtml(item)}</span>`).join("")}
          </div>
          <div class="detail-title-row">
            <h2 class="detail-title" id="detailTitle" lang="ru">${stressHtml(word.ru)}</h2>
            <button class="speak-button" type="button" data-speak="${escapeAttribute(word.ru)}" aria-label="朗读 ${escapeAttribute(word.ru)}">
              ${ICONS.speaker}
            </button>
          </div>
          <p class="detail-meaning">${escapeHtml(word.zh)}<em>${escapeHtml(word.en)}</em></p>
          <div class="detail-chips">${chips.join("")}</div>
          <div class="detail-actions">
            <button class="btn btn--outline${known ? " is-known" : ""}" type="button" data-action="known" aria-pressed="${known}">
              ${known ? ICONS.check : ICONS.spark}
              <span>${known ? "已掌握" : "标记已掌握"}</span>
            </button>
            <button class="btn btn--ghost" type="button" data-action="random">
              ${ICONS.spark}
              <span>换一个词</span>
            </button>
          </div>
        </div>
      </div>

      <div class="detail-body">
        ${grammarPanel(word)}

        <section aria-labelledby="examplesHeading">
          <h3 class="panel-title" id="examplesHeading">三个例句 <span>Примеры</span></h3>
          <div class="example-list">${examplesHtml}</div>
        </section>
      </div>

      <div class="detail-nav">
        <button type="button" data-action="previous" ${index === 0 ? "disabled" : ""}>
          ${ICONS.arrowLeft} 上一个
        </button>
        <span class="detail-nav-position">${padNumber(index + 1)} / ${TOTAL}</span>
        <button type="button" data-action="next" ${index === TOTAL - 1 ? "disabled" : ""}>
          下一个 ${ICONS.arrow}
        </button>
      </div>
    </article>
  `;
}

function openDetailByIndex(index) {
  if (index < 0 || index >= TOTAL) return;
  state.detailIndex = index;
  const word = WORDS[index];
  elements.detailContent.innerHTML = detailTemplate(word);
  elements.detailContent.scrollTop = 0;

  try {
    window.history.replaceState(null, "", `#word/${encodeURIComponent(word.id)}`);
  } catch (error) {
    // A file URL or a restricted context can reject history updates.
  }

  if (!elements.wordDialog.open) {
    elements.wordDialog.showModal();
    syncBodyLock();
  }

  window.requestAnimationFrame(() => {
    elements.dialogClose.focus({ preventScroll: true });
  });
}

function openDetailById(wordId) {
  const index = WORDS.findIndex((word) => word.id === wordId);
  if (index !== -1) openDetailByIndex(index);
}

function closeDetail() {
  if (elements.wordDialog.open) elements.wordDialog.close();
}

function clearDetailHash() {
  if (!window.location.hash.startsWith("#word/")) return;
  try {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  } catch (error) {
    // Ignore restricted history contexts.
  }
}

function openDetailFromHash() {
  const match = window.location.hash.match(/^#word\/(.+)$/);
  if (!match) return;
  window.setTimeout(() => {
    openDetailById(decodeURIComponent(match[1]));
  }, 80);
}

function openRandomWord() {
  const pool = state.filtered.length ? state.filtered : WORDS;
  const randomWord = pool[Math.floor(Math.random() * pool.length)];
  if (!randomWord) return;
  openDetailById(randomWord.id);
}

function openNextDetail(direction) {
  const nextIndex = state.detailIndex + direction;
  if (nextIndex >= 0 && nextIndex < TOTAL) openDetailByIndex(nextIndex);
}

/* ---------- Study mode: Ebbinghaus groups + spelling ---------- */

function getStudyGroup() {
  const base = state.filtered.length ? state.filtered : WORDS;
  const now = Date.now();
  const due = base.filter((word) => {
    const record = srsProgress[word.id];
    return record && record.due && record.due <= now;
  });
  const fresh = base.filter((word) => !srsProgress[word.id]);
  const rest = base.filter((word) => !due.includes(word) && !fresh.includes(word));
  const pool = [...shuffle(due), ...shuffle(fresh), ...shuffle(rest)];
  return pool.slice(0, STUDY_GROUP_SIZE);
}

function startStudy() {
  if (elements.wordDialog.open) closeDetail();

  study.queue = getStudyGroup();
  study.index = 0;
  study.flipped = false;
  study.spellingChecked = false;
  study.spellingCorrect = null;
  study.groupNumber += 1;

  if (!elements.studyDialog.open) {
    elements.studyDialog.showModal();
  }
  syncBodyLock();
  renderStudy();
  window.requestAnimationFrame(() => {
    elements.studyContent.focus({ preventScroll: true });
  });
}

function studyModeTemplate() {
  return `
    <div class="study-mode-row">
      <span class="study-group-label">艾宾浩斯 · ${study.queue.length} 词 / 组</span>
      <div class="study-mode-switch" role="group" aria-label="背诵方式">
        <button type="button" data-action="mode" data-mode="recognition" class="${study.mode === "recognition" ? "is-active" : ""}">看词记义</button>
        <button type="button" data-action="mode" data-mode="spelling" class="${study.mode === "spelling" ? "is-active" : ""}">看义拼词</button>
      </div>
    </div>
  `;
}

function studyControlsTemplate() {
  if (study.mode === "spelling") {
    if (study.spellingChecked) {
      return `
        <div class="study-controls">
          <button class="btn btn--dark" type="button" data-action="next-card">下一个 ${ICONS.arrow}</button>
        </div>
        <p class="study-hint"><kbd>Enter</kbd> 下一个 <span>·</span> <kbd>Esc</kbd> 退出</p>
      `;
    }
    return `
      <div class="study-controls">
        <button class="btn btn--dark" type="button" data-action="check-spelling">检查拼写</button>
        <button class="btn btn--ghost" type="button" data-action="skip">跳过</button>
      </div>
      <p class="study-hint">想不起来时，点右上角喇叭听发音 <span>·</span> <kbd>Enter</kbd> 检查</p>
    `;
  }

  if (!study.flipped) {
    return `
      <div class="study-controls">
        <button class="btn btn--dark" type="button" data-action="flip">
          显示答案 ${ICONS.arrow}
        </button>
        <button class="btn btn--ghost" type="button" data-action="skip">跳过</button>
      </div>
      <p class="study-hint"><kbd>Space</kbd> 翻面 <span>·</span> <kbd>Esc</kbd> 退出</p>
    `;
  }

  return `
    <div class="study-controls">
      <button class="btn btn--outline" type="button" data-action="again">还不熟</button>
      <button class="btn btn--dark" type="button" data-action="learned">记住了 ${ICONS.check}</button>
    </div>
    <p class="study-hint"><kbd>1</kbd> 还不熟 <span>·</span> <kbd>2</kbd> 记住了 <span>·</span> <kbd>Esc</kbd> 退出</p>
  `;
}

function studyChips(word) {
  const chips = [`<span class="chip">${escapeHtml(positionLabel(word))}</span>`];
  if (isNoun(word)) {
    chips.push(`<span class="chip">${word.f && !word.f.s ? "复数名词" : GENDER[word.g].zh + "名词"}</span>`);
    if (word.f.p) chips.push(`<span class="chip">复数有变化</span>`);
  } else if (isVerb(word)) {
    chips.push(`<span class="chip">${escapeHtml(conjugationLabel(word))}</span>`);
    chips.push(`<span class="chip">${escapeHtml(word.conj.aspect)}</span>`);
  } else if (typeOf(word) === "adj") {
    chips.push(`<span class="chip">${word.short ? "短尾" : "长尾"}</span>`);
  } else if (typeOf(word) === "pron") {
    chips.push(`<span class="chip">${escapeHtml(PRONOUN_KIND[word.kind] || "代词")}</span>`);
  } else {
    chips.push('<span class="chip">不变词</span>');
  }
  return chips.join("");
}

function fitStudyText() {
  window.requestAnimationFrame(() => {
    document.querySelectorAll(".flash-word").forEach((element) => {
      const face = element.closest(".flash-front");
      if (face) fitSingleWord(element, face.clientWidth - 44, 20);
    });
    document.querySelectorAll(".flash-back-word").forEach((element) => {
      const head = element.closest(".flash-back-head");
      if (head) fitSingleWord(element, head.clientWidth - 92, 20);
    });
    document.querySelectorAll(".spelling-answer").forEach((element) => {
      const card = element.closest(".spelling-card");
      if (card) fitSingleWord(element, card.clientWidth - 54, 18);
    });
  });
}

function fitSingleWord(element, availableWidth, minimumSize) {
  element.style.fontSize = "";
  element.style.display = "inline-block";
  element.style.whiteSpace = "nowrap";
  const maxWidth = Math.max(120, availableWidth);
  const baseSize = parseFloat(getComputedStyle(element).fontSize) || 52;
  let size = baseSize;
  element.style.fontSize = `${size}px`;
  while (element.scrollWidth > maxWidth && size > minimumSize) {
    size -= 2;
    element.style.fontSize = `${size}px`;
  }
}

function spellingCardTemplate(word) {
  const checked = study.spellingChecked;
  const correct = study.spellingCorrect;
  const feedback = checked
    ? `<div class="spelling-feedback ${correct ? "is-correct" : "is-wrong"}">
         <span class="spelling-feedback-icon">${correct ? "✓" : "!"}</span>
         <div>
           <strong>${correct ? "拼写正确" : "正确拼写"}</strong>
           <div class="spelling-answer" lang="ru">${stressHtml(word.ru)}</div>
           ${correct ? "" : '<small>已加入 5 分钟后的复习队列。</small>'}
         </div>
       </div>`
    : `<label class="spelling-label" for="spellInput">俄语拼写</label>
       <input class="spelling-input" id="spellInput" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="输入俄语单词…">`;

  return `
    <div class="spelling-card">
      <div class="spelling-head">
        <span class="spelling-kicker">看中文 · 拼俄语</span>
        <button class="flash-speak" type="button" data-speak="${escapeAttribute(word.ru)}" aria-label="朗读 ${escapeAttribute(word.ru)}">
          ${ICONS.speaker}
        </button>
      </div>
      <p class="spelling-meaning">${escapeHtml(word.zh)}</p>
      <p class="spelling-en">${escapeHtml(word.en)}</p>
      <div class="flash-chips">${studyChips(word)}</div>
      ${feedback}
    </div>
  `;
}

function renderStudy() {
  if (!study.queue.length) {
    renderStudyResult(0);
    return;
  }

  if (study.index >= study.queue.length) {
    renderStudyResult(study.queue.length);
    return;
  }

  const word = study.queue[study.index];
  const firstExample = word.ex[0];
  const caseMeta = CASE_BY_KEY[firstExample[2]] || CASE_BY_KEY.use;
  const exampleLabel = firstExample[3] || `${caseMeta.short} · ${caseMeta.zh}`;
  const progress = ((study.index + 1) / study.queue.length) * 100;
  const remaining = study.queue.length - study.index - 1;

  const card = study.mode === "spelling"
    ? spellingCardTemplate(word)
    : `<div class="flashcard${study.flipped ? " is-flipped" : ""}" data-action="flip-card" role="group" aria-label="单词抽认卡">
        <div class="flash-face flash-front">
          <span class="flash-gender">${escapeHtml(positionLabel(word))} · ${lessonName(word.l)}</span>
          <span class="flash-emoji" aria-hidden="true">${word.icon}</span>
          <h3 class="flash-word" lang="ru">${stressHtml(word.ru)}</h3>
          <span class="flash-lesson">${remaining ? `还剩 ${remaining} 张` : "最后一张"}</span>
        </div>
        <div class="flash-face flash-back">
          <div class="flash-back-head">
            <div class="flash-back-title">
              <h3 class="flash-back-word" lang="ru">${stressHtml(word.ru)}</h3>
              <button class="flash-speak flash-speak--inline" type="button" data-speak="${escapeAttribute(word.ru)}" aria-label="朗读 ${escapeAttribute(word.ru)}">
                ${ICONS.speaker}
              </button>
            </div>
            <span class="flash-badge" aria-hidden="true">${word.icon}</span>
          </div>
          <div class="flash-chips">${studyChips(word)}</div>
          <div class="flash-example">
            <p class="flash-example-label">${escapeHtml(exampleLabel)}</p>
            <p class="flash-example-ru" lang="ru">${renderSentence(firstExample[0])}</p>
            <p class="flash-example-zh">${escapeHtml(firstExample[1])}</p>
          </div>
        </div>
      </div>`;

  elements.studyContent.innerHTML = `
    <div class="study-top">
      <span class="study-kicker">Карточки · 第 ${study.groupNumber} 组</span>
      <span class="study-position">${study.index + 1} / ${study.queue.length}</span>
      <button class="study-close" type="button" data-action="close-study" aria-label="退出背诵模式">
        ${ICONS.close}
      </button>
    </div>
    <div class="study-progress" aria-hidden="true"><span style="width:${progress}%"></span></div>
    ${studyModeTemplate()}
    <div class="study-stage${study.flipped ? " is-flipped" : ""}">
      ${study.mode === "recognition" ? `<button class="flash-speak study-speaker-front" type="button" data-speak="${escapeAttribute(word.ru)}" aria-label="朗读 ${escapeAttribute(word.ru)}">
        ${ICONS.speaker}
      </button>` : ""}
      ${card}
    </div>
    <div id="studyControls">${studyControlsTemplate()}</div>
  `;
  fitStudyText();
}

function updateStudyControls() {
  const controls = elements.studyContent.querySelector("#studyControls");
  if (controls) controls.innerHTML = studyControlsTemplate();
  const card = elements.studyContent.querySelector(".flashcard");
  if (card) card.classList.toggle("is-flipped", study.flipped);
  const stage = elements.studyContent.querySelector(".study-stage");
  if (stage) stage.classList.toggle("is-flipped", study.flipped);
}

function toggleStudyFlip() {
  if (!elements.studyDialog.open || !study.queue.length || study.mode !== "recognition") return;
  if (study.index >= study.queue.length) return;
  study.flipped = !study.flipped;
  updateStudyControls();
}

function setStudyMode(mode) {
  if (mode === study.mode) return;
  study.mode = mode;
  study.flipped = false;
  study.spellingChecked = false;
  study.spellingCorrect = null;
  renderStudy();
}

function advanceStudy(direction = 1) {
  if (!elements.studyDialog.open) return;
  study.index = Math.max(0, Math.min(study.queue.length, study.index + direction));
  study.flipped = false;
  study.spellingChecked = false;
  study.spellingCorrect = null;
  renderStudy();
}

function checkSpelling() {
  const word = study.queue[study.index];
  if (!word || study.mode !== "spelling" || study.spellingChecked) return;
  const input = document.getElementById("spellInput");
  const value = input ? input.value.trim() : "";
  if (!value) {
    showToast("先输入俄语单词");
    if (input) input.focus();
    return;
  }

  const correct = normalizeAnswer(value) === normalizeAnswer(word.ru);
  study.spellingChecked = true;
  study.spellingCorrect = correct;
  scheduleWord(word, correct);
  setWordKnown(word, correct);
  renderStudy();
}

function skipStudy() {
  const word = study.queue[study.index];
  if (!word) return;
  scheduleWord(word, true);
  setWordKnown(word, true);
  showToast("已跳过，按已掌握记录");
  advanceStudy(1);
}

function markStudy(learned) {
  const word = study.queue[study.index];
  if (!word) return;
  scheduleWord(word, learned);
  setWordKnown(word, learned);
  advanceStudy(1);
}

function nextReviewLabel(words) {
  const now = Date.now();
  const dueTimes = words
    .map((word) => srsProgress[word.id] && srsProgress[word.id].due)
    .filter((due) => typeof due === "number" && due > 0)
    .sort((a, b) => a - b);
  if (!dueTimes.length) return "完成本组后即可继续";
  return formatDuration(Math.max(0, dueTimes[0] - now));
}

function renderStudyResult(studiedCount) {
  const next = nextReviewLabel(study.queue);
  elements.studyContent.innerHTML = `
    <div class="study-top">
      <span class="study-kicker">Карточки · 第 ${study.groupNumber} 组完成</span>
      <button class="study-close" type="button" data-action="close-study" aria-label="退出背诵模式">
        ${ICONS.close}
      </button>
    </div>
    <div class="study-result">
      <span class="result-mark">${ICONS.spark}</span>
      <h3 id="studyTitle">这一组，完成了。</h3>
      <p>本组 ${studiedCount} 个单词已按艾宾浩斯曲线安排复习。最早的一次复习在 <strong>${next}</strong>。下一组会重新打乱顺序，优先安排到期和未学过的词。</p>
      <div class="btn-row">
        <button class="btn btn--dark" type="button" data-action="next-group">
          继续下一组 ${ICONS.arrow}
        </button>
        <button class="btn btn--outline" type="button" data-action="close-study">返回词汇库</button>
      </div>
    </div>
  `;
}

function closeStudy() {
  if (elements.studyDialog.open) elements.studyDialog.close();
}

/* ---------- Events ---------- */

function bindEvents() {
  elements.grid.addEventListener("click", (event) => {
    const card = event.target.closest(".word-card");
    if (card) openDetailById(card.dataset.id);
  });

  elements.search.addEventListener("input", (event) => {
    setQuery(event.target.value);
  });

  elements.search.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.search.value) {
      event.preventDefault();
      elements.search.value = "";
      setQuery("");
      elements.search.blur();
    }
  });

  elements.searchClear.addEventListener("click", () => {
    elements.search.value = "";
    setQuery("");
    elements.search.focus();
  });

  elements.lessonFilter.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-value]");
    if (!button) return;
    state.lesson = button.dataset.value;
    updateSegments();
    renderGrid();
  });

  elements.typeFilter.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-value]");
    if (!button) return;
    state.type = button.dataset.value;
    updateSegments();
    renderGrid();
  });

  elements.resetFilters.addEventListener("click", resetAllFilters);
  document.getElementById("emptyReset").addEventListener("click", resetAllFilters);

  elements.randomWord.addEventListener("click", openRandomWord);

  document.querySelectorAll("#openStudy, #heroStudy").forEach((button) => {
    button.addEventListener("click", startStudy);
  });

  elements.dialogClose.addEventListener("click", closeDetail);

  elements.wordDialog.addEventListener("click", (event) => {
    if (event.target === elements.wordDialog) closeDetail();
  });

  elements.wordDialog.addEventListener("close", () => {
    clearDetailHash();
    syncBodyLock();
  });

  elements.detailContent.addEventListener("click", (event) => {
    const speakButton = event.target.closest("[data-speak]");
    if (speakButton) {
      event.preventDefault();
      speak(speakButton.dataset.speak);
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    const action = actionButton.dataset.action;
    if (action === "known") {
      const word = WORDS[state.detailIndex];
      if (word) toggleKnown(word.id);
    } else if (action === "previous") {
      openNextDetail(-1);
    } else if (action === "next") {
      openNextDetail(1);
    } else if (action === "random") {
      openRandomWord();
    }
  });

  elements.studyContent.addEventListener("click", (event) => {
    const speakButton = event.target.closest("[data-speak]");
    if (speakButton) {
      event.preventDefault();
      event.stopPropagation();
      speak(speakButton.dataset.speak);
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    const action = actionButton.dataset.action;
    if (action === "flip" || action === "flip-card") {
      if (action === "flip-card" && event.target.closest(".flash-speak")) return;
      toggleStudyFlip();
    } else if (action === "learned") {
      markStudy(true);
    } else if (action === "again") {
      markStudy(false);
    } else if (action === "skip") {
      skipStudy();
    } else if (action === "check-spelling") {
      checkSpelling();
    } else if (action === "next-card") {
      advanceStudy(1);
    } else if (action === "next-group" || action === "restart") {
      startStudy();
    } else if (action === "mode") {
      setStudyMode(actionButton.dataset.mode);
    } else if (action === "close-study") {
      closeStudy();
    }
  });

  elements.studyContent.addEventListener("keydown", (event) => {
    if (event.target && event.target.id === "spellInput" && event.key === "Enter") {
      event.preventDefault();
      checkSpelling();
    }
  });

  window.addEventListener("resize", () => {
    if (elements.studyDialog.open) fitStudyText();
  });

  elements.studyDialog.addEventListener("click", (event) => {
    if (event.target === elements.studyDialog) closeStudy();
  });

  elements.studyDialog.addEventListener("close", syncBodyLock);

  document.addEventListener("keydown", (event) => {
    const activeTag = document.activeElement ? document.activeElement.tagName : "";
    const typing = /INPUT|TEXTAREA|SELECT/.test(activeTag);

    if (!typing && event.key === "/" && !elements.wordDialog.open && !elements.studyDialog.open) {
      event.preventDefault();
      elements.search.focus();
      return;
    }

    if (!elements.studyDialog.open || typing) return;

    if (!study.queue.length || study.index >= study.queue.length) {
      if (event.key === "Escape") closeStudy();
      return;
    }

    if (study.mode === "spelling") {
      if (event.key === "Enter" && study.spellingChecked) {
        event.preventDefault();
        advanceStudy(1);
      } else if (event.key.toLowerCase() === "s" && !study.spellingChecked) {
        event.preventDefault();
        skipStudy();
      } else if (event.key === "Escape") {
        closeStudy();
      }
      return;
    }

    if (event.code === "Space") {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.closest && activeElement.closest("button")) return;
      event.preventDefault();
      toggleStudyFlip();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      advanceStudy(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      advanceStudy(-1);
    } else if (event.key === "s" && !study.flipped) {
      event.preventDefault();
      skipStudy();
    } else if (event.key === "1" && study.flipped) {
      event.preventDefault();
      markStudy(false);
    } else if (event.key === "2" && study.flipped) {
      event.preventDefault();
      markStudy(true);
    } else if (event.key === "Escape") {
      closeStudy();
    }
  });
}

function initialize() {
  if (!TOTAL) {
    elements.grid.innerHTML = "<p>词库加载失败，请刷新页面。</p>";
    return;
  }

  document.querySelectorAll("[data-total-count]").forEach((node) => {
    node.textContent = TOTAL;
  });
  document.querySelectorAll("[data-example-count]").forEach((node) => {
    node.textContent = EXAMPLE_TOTAL;
  });
  document.querySelectorAll("[data-verb-count]").forEach((node) => {
    node.textContent = WORDS.filter((word) => isVerb(word)).length;
  });
  document.querySelectorAll("[data-noun-count]").forEach((node) => {
    node.textContent = WORDS.filter((word) => isNoun(word)).length;
  });

  bindEvents();
  updateSegments();
  renderGrid();
  openDetailFromHash();
}

initialize();

if ("serviceWorker" in navigator && window.isSecureContext && location.protocol.startsWith("http")) {
  let refreshingForUpdate = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshingForUpdate) return;
    refreshingForUpdate = true;
    window.location.reload();
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").then((registration) => {
      registration.update().catch(() => {});
      return navigator.serviceWorker.ready;
    }).then(() => {
      const status = document.getElementById("offlineStatus");
      if (status) {
        status.textContent = "离线缓存已就绪 · 可添加到主屏幕";
        status.hidden = false;
      }
    }).catch(() => {
      // Offline installation is optional; the site still works online.
    });
  });
}
