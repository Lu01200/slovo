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
  flipped: false
};

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
        <span class="card-word" lang="ru">${escapeHtml(word.ru)}</span>
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
            <h2 class="detail-title" id="detailTitle" lang="ru">${escapeHtml(word.ru)}</h2>
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

/* ---------- Study mode ---------- */

function startStudy() {
  if (elements.wordDialog.open) closeDetail();

  const base = state.filtered.length ? state.filtered : WORDS;
  const learning = base.filter((word) => !state.known.has(word.id));
  const mastered = base.filter((word) => state.known.has(word.id));

  study.queue = [...shuffle(learning), ...shuffle(mastered)];
  study.index = 0;
  study.flipped = false;

  if (!elements.studyDialog.open) {
    elements.studyDialog.showModal();
  }
  syncBodyLock();
  renderStudy();
  window.requestAnimationFrame(() => {
    elements.studyContent.focus({ preventScroll: true });
  });
}

function studyControlsTemplate() {
  if (!study.flipped) {
    return `
      <div class="study-controls">
        <button class="btn btn--dark" type="button" data-action="flip">
          显示答案 ${ICONS.arrow}
        </button>
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

  elements.studyContent.innerHTML = `
    <div class="study-top">
      <span class="study-kicker">Карточки · 背诵模式</span>
      <span class="study-position">${study.index + 1} / ${study.queue.length}</span>
      <button class="study-close" type="button" data-action="close-study" aria-label="退出背诵模式">
        ${ICONS.close}
      </button>
    </div>
    <div class="study-progress" aria-hidden="true"><span style="width:${progress}%"></span></div>

    <div class="study-stage">
      <div class="flashcard${study.flipped ? " is-flipped" : ""}" data-action="flip-card" role="group" aria-label="单词抽认卡">
        <div class="flash-face flash-front">
          <button class="flash-speak" type="button" data-speak="${escapeAttribute(word.ru)}" aria-label="朗读 ${escapeAttribute(word.ru)}">
            ${ICONS.speaker}
          </button>
          <span class="flash-gender">${escapeHtml(positionLabel(word))} · ${lessonName(word.l)}</span>
          <span class="flash-emoji" aria-hidden="true">${word.icon}</span>
          <h3 class="flash-word" lang="ru">${escapeHtml(word.ru)}</h3>
          <span class="flash-lesson">${remaining ? `还剩 ${remaining} 张` : "最后一张"}</span>
        </div>
        <div class="flash-face flash-back">
          <div class="flash-back-head">
            <div>
              <h3 class="flash-back-word" lang="ru">${escapeHtml(word.ru)}</h3>
              <p class="flash-back-meaning">${escapeHtml(word.zh)}<em>${escapeHtml(word.en)}</em></p>
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
      </div>
    </div>
    <div id="studyControls">${studyControlsTemplate()}</div>
  `;
}

function updateStudyControls() {
  const controls = elements.studyContent.querySelector("#studyControls");
  if (controls) controls.innerHTML = studyControlsTemplate();
  const card = elements.studyContent.querySelector(".flashcard");
  if (card) card.classList.toggle("is-flipped", study.flipped);
}

function toggleStudyFlip() {
  if (!elements.studyDialog.open || !study.queue.length) return;
  if (study.index >= study.queue.length) return;
  study.flipped = !study.flipped;
  updateStudyControls();
}

function advanceStudy(direction = 1) {
  if (!elements.studyDialog.open) return;
  study.index = Math.max(0, Math.min(study.queue.length, study.index + direction));
  study.flipped = false;
  renderStudy();
}

function markStudy(learned) {
  const word = study.queue[study.index];
  if (!word) return;

  if (learned) {
    if (!state.known.has(word.id)) {
      state.known.add(word.id);
      saveKnown();
      updateKnownUI();
    }
  } else if (state.known.has(word.id)) {
    state.known.delete(word.id);
    saveKnown();
    updateKnownUI();
  }

  advanceStudy(1);
}

function renderStudyResult(studiedCount) {
  elements.studyContent.innerHTML = `
    <div class="study-top">
      <span class="study-kicker">Карточки · 本轮完成</span>
      <button class="study-close" type="button" data-action="close-study" aria-label="退出背诵模式">
        ${ICONS.close}
      </button>
    </div>
    <div class="study-result">
      <span class="result-mark">${ICONS.spark}</span>
      <h3 id="studyTitle">这一轮，读完了。</h3>
      <p>刚刚复习了 ${studiedCount} 张卡片，词库中已掌握 <strong>${state.known.size}</strong> / ${TOTAL} 个词条。重复不是原地踏步，是让句子慢慢变熟。</p>
      <div class="btn-row">
        <button class="btn btn--dark" type="button" data-action="restart">
          ${ICONS.restart} 再来一轮
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
    } else if (action === "close-study") {
      closeStudy();
    } else if (action === "restart") {
      startStudy();
    }
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
