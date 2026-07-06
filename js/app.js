import { REGIONS, STAGES, CODEX, ELEMENTS, CATEGORY_NAMES } from "./gameData.js";
import { QUIZZES } from "./quizData.js";
import { SaveManager, createNewSave } from "./saveManager.js";

const screen = document.querySelector("#screen");
const bottomNav = document.querySelector("#bottom-nav");
const modalRoot = document.querySelector("#modal-root");
const toast = document.querySelector("#toast");
const fxLayer = document.querySelector("#fx-layer");

let saveData = SaveManager.load();
let currentScreen = "title";
let previousScreen = "title";
let currentStageId = null;
let dialogueState = null;
let battleState = null;
let audioContext = null;
let toastTimer = null;
let titleSoundOn = saveData?.soundOn ?? true;

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character]);

const formatTerms = (value = "") =>
  escapeHtml(value).replace(/\{([^}]+)\}/g, '<strong class="key-term">$1</strong>');

const shuffle = (items) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const next = Math.floor(Math.random() * (index + 1));
    [result[index], result[next]] = [result[next], result[index]];
  }
  return result;
};

const uniquePush = (array, value) => {
  if (!array.includes(value)) array.push(value);
};

function persist() {
  if (saveData) SaveManager.save(saveData);
}

function setNavigation(visible) {
  bottomNav.classList.toggle("is-hidden", !visible);
  screen.classList.toggle("has-nav", visible);
}

function mount(html, { nav = false } = {}) {
  dialogueState = null;
  closeModal();
  setNavigation(nav);
  screen.innerHTML = `<div class="screen-enter">${html}</div>`;
}

function notify(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 1900);
}

function sound(type = "tap") {
  const soundOn = saveData?.soundOn ?? titleSoundOn;
  if (!soundOn) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const sounds = {
      tap: [440, 0.045, "square"],
      correct: [880, 0.14, "triangle"],
      wrong: [140, 0.2, "sawtooth"],
      clear: [660, 0.35, "square"],
    };
    const [frequency, duration, wave] = sounds[type] || sounds.tap;
    oscillator.frequency.value = frequency;
    oscillator.type = wave;
    gain.gain.setValueAtTime(0.045, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch {
    // 音が使えない環境でもゲームは続行します。
  }
}

function renderTitle() {
  currentScreen = "title";
  const canContinue = SaveManager.exists();
  mount(`
    <section class="title-screen" aria-labelledby="game-title">
      <div class="title-crest">
        <h1 id="game-title" class="pixel-title">
          <span class="five">五臓六腑</span>クエスト
        </h1>
        <p class="title-sub">～からだの国と失われた調和～</p>
      </div>
      <p class="title-tagline">からだの中の大冒険！</p>
      <div class="title-actions">
        <button class="rpg-button" data-action="new-game">はじめから</button>
        <button class="rpg-button" data-action="continue" ${canContinue ? "" : "disabled"}>
          つづきから
        </button>
        <div class="small-row">
          <button class="rpg-button" data-action="open-codex-title">五臓六腑図鑑</button>
          <button class="rpg-button" data-action="sound-settings">音量設定</button>
        </div>
      </div>
    </section>
  `);
}

function renderNameEntry() {
  currentScreen = "name";
  mount(`
    <section class="name-screen">
      <form class="parchment-panel name-card" id="name-form">
        <div class="guide-sprite" aria-hidden="true">✦</div>
        <h2>シンポー</h2>
        <p>きみの名前を教えて！<br>からだの国へ出発しよう。</p>
        <label for="player-name">見習い治療士の名前</label>
        <input id="player-name" name="playerName" maxlength="8" value="みならい" autocomplete="nickname">
        <button class="rpg-button" type="submit">冒険をはじめる</button>
        <button class="rpg-button" type="button" data-action="back-title">もどる</button>
      </form>
    </section>
  `);
  window.setTimeout(() => document.querySelector("#player-name")?.focus(), 100);
}

function renderMap(showMist = false) {
  if (!saveData) {
    renderTitle();
    return;
  }
  currentScreen = "map";
  currentStageId = null;
  const currentRegion = REGIONS.find((region) =>
    saveData.unlockedRegions.includes(region.id) && !saveData.clearedRegions.includes(region.id)
  );
  const nodes = REGIONS.map((region) => {
    const unlocked = saveData.unlockedRegions.includes(region.id);
    const cleared = saveData.clearedRegions.includes(region.id);
    const classes = [
      "map-node",
      unlocked ? "is-unlocked" : "is-locked",
      cleared ? "is-cleared" : "",
      currentRegion?.id === region.id ? "is-current" : "",
    ].filter(Boolean).join(" ");
    const color = ELEMENTS[region.element]?.color || "#eee";
    return `
      <button class="${classes}" style="left:${region.x}%;top:${region.y}%;--node-color:${color}"
        data-action="select-region" data-region="${region.id}" aria-label="${escapeHtml(region.name)}${unlocked ? "" : " 未解放"}">
        <span class="node-icon" aria-hidden="true">${region.icon}</span>
        ${unlocked ? escapeHtml(region.name) : "？？？"}
      </button>
    `;
  }).join("");

  mount(`
    <section class="world-screen">
      <header class="map-header">
        <div>
          <div class="map-title">からだの国マップ</div>
          <div class="player-chip">光が戻った地域 ${saveData.clearedRegions.length}/11</div>
        </div>
        <div class="player-chip">
          <strong>${escapeHtml(saveData.playerName)}</strong>
          Lv.${saveData.level} ${escapeHtml(saveData.job)}
        </div>
      </header>
      <div class="map-nodes">${nodes}</div>
      <p class="map-tip">光る地域をタップして、役割の記憶を探そう</p>
      ${showMist ? '<div class="mist-clear"></div>' : ""}
    </section>
  `, { nav: true });
}

function renderStage(stageId, playIntro = false) {
  const stage = STAGES[stageId];
  if (!stage || !saveData) return;
  currentScreen = "stage";
  currentStageId = stageId;
  const explored = saveData.explored[stageId] || [];
  const allExplored = explored.length >= stage.points.length;
  const cleared = saveData.clearedRegions.includes(stageId);
  const points = stage.points.map((point) => `
    <button class="explore-point ${explored.includes(point.id) ? "is-done" : ""}"
      data-action="explore" data-point="${point.id}">
      <span class="point-icon" aria-hidden="true">${point.icon}</span>
      ${escapeHtml(point.label)}
    </button>
  `).join("");

  mount(`
    <section class="stage-screen ${stageId}-stage" style="--stage-tint:${stage.color}">
      <header class="stage-header">
        <h2>${escapeHtml(stage.title)}</h2>
        <p>${escapeHtml(stage.subtitle)}　記憶 ${explored.length}/${stage.points.length}</p>
      </header>
      <button class="map-back" data-action="back-map" aria-label="マップへ戻る">×</button>
      <div class="stage-character ${stage.characterClass}" role="img" aria-label="${escapeHtml(stage.character)}"></div>
      <div class="exploration-area">${points}</div>
      <div class="boss-gate">
        <button class="rpg-button ${allExplored && !cleared ? "ready" : ""}" data-action="${cleared ? "back-map" : "boss"}"
          ${allExplored || cleared ? "" : "disabled"}>
          ${cleared ? "地域に光が戻った！" : allExplored ? `問診バトル：${escapeHtml(stage.boss)}` : "探索して記憶を集めよう"}
        </button>
        <small>${cleared ? "マップへ戻る" : allExplored ? "症状と働きを見抜こう" : "探索ポイントをすべて調べると挑戦できます"}</small>
      </div>
    </section>
  `, { nav: true });

  const shouldPlayIntro = playIntro && !saveData.seenStageIntro.includes(stageId);
  if (shouldPlayIntro) {
    uniquePush(saveData.seenStageIntro, stageId);
    persist();
    window.setTimeout(() => openDialogue(stage.intro), 130);
  }
}

function openDialogue(pages, onComplete = null) {
  dialogueState = { pages, index: 0, onComplete };
  paintDialogue();
}

function paintDialogue() {
  document.querySelector(".dialogue-layer")?.remove();
  if (!dialogueState) return;
  const [rawSpeaker, text] = dialogueState.pages[dialogueState.index];
  const speaker = rawSpeaker === "主人公" ? saveData?.playerName || "主人公" : rawSpeaker;
  const isLast = dialogueState.index === dialogueState.pages.length - 1;
  screen.insertAdjacentHTML("beforeend", `
    <div class="dialogue-layer">
      <aside class="dialogue-box" data-speaker="${escapeHtml(rawSpeaker)}">
        <div class="speaker-portrait" aria-hidden="true"></div>
        <div class="speaker-name">${escapeHtml(speaker)}</div>
        <p class="dialogue-text">${formatTerms(text)}</p>
        <button class="dialogue-next" data-action="dialogue-next">${isLast ? "とじる" : "つぎへ ▾"}</button>
      </aside>
    </div>
  `);
}

function advanceDialogue() {
  if (!dialogueState) return;
  sound("tap");
  if (dialogueState.index < dialogueState.pages.length - 1) {
    dialogueState.index += 1;
    paintDialogue();
    return;
  }
  const onComplete = dialogueState.onComplete;
  dialogueState = null;
  document.querySelector(".dialogue-layer")?.remove();
  onComplete?.();
}

function explorePoint(pointId) {
  const stage = STAGES[currentStageId];
  const point = stage?.points.find((item) => item.id === pointId);
  if (!stage || !point || !saveData) return;
  const explored = saveData.explored[currentStageId] ||= [];
  const firstVisit = !explored.includes(pointId);
  if (firstVisit) {
    explored.push(pointId);
    if (point.reward === "養生茶") {
      saveData.items["養生茶"] = (saveData.items["養生茶"] || 0) + 1;
    }
    persist();
  }
  openDialogue(point.pages, () => {
    renderStage(currentStageId);
    if (firstVisit) notify(`入手：${point.reward}`);
  });
}

function startBattle(stageId) {
  const stage = STAGES[stageId];
  if (!stage) return;
  battleState = {
    stageId,
    enemyHp: 100,
    focus: 3,
    correctCount: 0,
    asked: [],
    current: null,
    selected: null,
    resolved: false,
    resultText: "",
  };
  currentScreen = "battle";
  sound("tap");
  renderBattleIntro(stage);
}

function renderBattleIntro(stage) {
  renderStage(stage.id);
  setNavigation(false);
  openDialogue(stage.bossIntro, () => {
    chooseNextQuestion();
    renderBattle();
  });
}

function chooseNextQuestion() {
  if (!battleState) return;
  const stage = STAGES[battleState.stageId];
  const pool = QUIZZES.filter((quiz) =>
    quiz.tags.some((tag) => stage.quizTags.includes(tag)) &&
    !battleState.asked.includes(quiz.id)
  );
  const fallback = QUIZZES.filter((quiz) => quiz.tags.some((tag) => stage.quizTags.includes(tag)));
  const question = shuffle(pool.length ? pool : fallback)[0];
  battleState.current = { ...question, shuffledChoices: shuffle(question.choices) };
  battleState.asked.push(question.id);
  battleState.selected = null;
  battleState.resolved = false;
  battleState.resultText = "";
}

function renderBattle() {
  if (!battleState || !saveData) return;
  currentScreen = "battle";
  const stage = STAGES[battleState.stageId];
  const quiz = battleState.current;
  const enemyColor = battleState.stageId === "heart" ? "#78448f" : "#527c3c";
  const choices = quiz.shuffledChoices.map((choice) => {
    let stateClass = "";
    if (battleState.resolved && choice === quiz.answer) stateClass = "correct";
    if (battleState.resolved && choice === battleState.selected && choice !== quiz.answer) stateClass = "wrong";
    return `
      <button class="choice-button ${stateClass}" data-action="answer" data-answer="${escapeHtml(choice)}"
        ${battleState.resolved ? "disabled" : ""}>${escapeHtml(choice)}</button>
    `;
  }).join("");

  mount(`
    <section class="battle-screen ${battleState.resolved ? (battleState.selected === quiz.answer ? "" : "shake") : ""}">
      <div class="battle-top">
        <div class="status-card">
          ${escapeHtml(saveData.playerName)}　集中力 ${battleState.focus}/3
          <div class="bar focus" style="--bar-value:${(battleState.focus / 3) * 100}%"><span></span></div>
        </div>
        <div class="status-card">
          ${escapeHtml(stage.boss)}　HP ${Math.max(0, battleState.enemyHp)}
          <div class="bar" style="--bar-value:${Math.max(0, battleState.enemyHp)}%"><span></span></div>
        </div>
      </div>
      <div class="enemy-stage">
        <div class="enemy ${battleState.resolved && battleState.selected === quiz.answer ? "hit" : ""}"
          style="--enemy-color:${enemyColor}" role="img" aria-label="${escapeHtml(stage.boss)}"></div>
      </div>
      <div class="quiz-panel parchment-panel">
        <p class="question-count">問診 ${battleState.correctCount + 1}/3　症状と働きを見抜こう</p>
        <h2 class="quiz-question">${escapeHtml(quiz.text)}</h2>
        <div class="choices">${choices}</div>
        ${battleState.resolved ? `
          <p class="answer-result" role="status">${battleState.resultText}</p>
          <button class="rpg-button answer-next" data-action="battle-next">
            ${battleState.enemyHp <= 0 ? "調和を取り戻す！" : battleState.focus <= 0 ? "立て直す" : "つぎの問診へ"}
          </button>
        ` : ""}
      </div>
    </section>
  `);
}

function answerQuestion(answer) {
  if (!battleState || battleState.resolved) return;
  const quiz = battleState.current;
  const correct = answer === quiz.answer;
  battleState.selected = answer;
  battleState.resolved = true;
  const stats = saveData.quizStats[quiz.id] ||= { attempts: 0, correct: 0 };
  stats.attempts += 1;

  if (correct) {
    stats.correct += 1;
    battleState.correctCount += 1;
    battleState.enemyHp -= 34;
    battleState.resultText = `<strong>正解！</strong> ${escapeHtml(quiz.hint)}`;
    sound("correct");
    fxLayer.classList.add("flash-correct");
    window.setTimeout(() => fxLayer.classList.remove("flash-correct"), 450);
  } else {
    battleState.focus -= 1;
    battleState.resultText = `<strong>不正解。</strong> 正解は「${escapeHtml(quiz.answer)}」。<br>シンポー：${escapeHtml(quiz.hint)}`;
    sound("wrong");
  }
  persist();
  renderBattle();
}

function nextBattleStep() {
  if (!battleState) return;
  if (battleState.enemyHp <= 0) {
    finishStage(battleState.stageId);
    return;
  }
  if (battleState.focus <= 0) {
    openModal(`
      <h2>集中力が切れた！</h2>
      <p>シンポー「大丈夫。ヒントを思い出して、もう一度問診しよう！」</p>
      <div class="modal-actions">
        <button class="rpg-button" data-modal-action="retry-battle">もう一度</button>
        <button class="rpg-button" data-modal-action="leave-battle">地域へ戻る</button>
      </div>
    `);
    return;
  }
  chooseNextQuestion();
  renderBattle();
}

function finishStage(stageId) {
  const stage = STAGES[stageId];
  uniquePush(saveData.clearedRegions, stageId);
  uniquePush(saveData.unlockedRegions, stage.unlocks);
  uniquePush(saveData.codexUnlocked, stageId);
  if (stageId === "heart") uniquePush(saveData.codexUnlocked, "small-intestine");
  if (stageId === "liver") uniquePush(saveData.codexUnlocked, "gallbladder");
  const element = stageId === "heart" ? ELEMENTS.fire : ELEMENTS.wood;
  uniquePush(saveData.skills, element.skill);
  saveData.exp += 100;
  if (saveData.exp >= 200 && saveData.level < 2) saveData.level = 2;
  persist();
  sound("clear");
  createStars();
  battleState = null;
  renderStage(stageId);
  setNavigation(false);
  openDialogue(stage.clearDialogue, () => {
    renderMap(true);
    notify(`${REGIONS.find((region) => region.id === stageId).name}に光が戻った！`);
  });
}

function createStars() {
  for (let index = 0; index < 14; index += 1) {
    const star = document.createElement("span");
    star.className = "star";
    star.textContent = "✦";
    star.style.setProperty("--x", `${8 + Math.random() * 84}%`);
    star.style.setProperty("--size", `${14 + Math.random() * 20}px`);
    star.style.setProperty("--drift", `${-55 + Math.random() * 110}px`);
    star.style.animationDelay = `${Math.random() * 250}ms`;
    fxLayer.append(star);
    window.setTimeout(() => star.remove(), 1500);
  }
}

function accuracyFor(entryId) {
  const related = QUIZZES.filter((quiz) => quiz.tags.includes(entryId));
  const totals = related.reduce((sum, quiz) => {
    const stat = saveData?.quizStats?.[quiz.id];
    if (!stat) return sum;
    sum.attempts += stat.attempts;
    sum.correct += stat.correct;
    return sum;
  }, { attempts: 0, correct: 0 });
  return totals.attempts ? Math.round((totals.correct / totals.attempts) * 100) : null;
}

function renderCodex(origin = currentScreen) {
  previousScreen = origin;
  currentScreen = "codex";
  const data = saveData || createNewSave("みならい");
  const cards = CODEX.map((entry) => {
    const unlocked = data.codexUnlocked.includes(entry.id);
    const accuracy = accuracyFor(entry.id);
    const icon = entry.id === "heart" ? "♥" : entry.id === "liver" ? "♞" : entry.name.slice(0, 1);
    return `
      <button class="codex-card ${unlocked ? "" : "locked"}" data-action="${unlocked ? "codex-detail" : "locked-codex"}"
        data-entry="${entry.id}">
        <span class="codex-avatar" aria-hidden="true">${unlocked ? icon : "?"}</span>
        <h3>${unlocked ? escapeHtml(entry.name) : "？？？"}</h3>
        <small>${unlocked ? escapeHtml(entry.title) : "冒険で出会うと登録"}</small>
        <p class="accuracy">クイズ正解率：${accuracy === null ? "—" : `${accuracy}%`}</p>
      </button>
    `;
  }).join("");

  mount(`
    <section class="codex-screen">
      <header class="book-header">
        <h2>五臓六腑図鑑</h2>
        <p>役割の記憶を集めるとページが開きます</p>
      </header>
      <button class="map-back close-book" data-action="close-codex" aria-label="図鑑を閉じる">×</button>
      <div class="codex-grid">${cards}</div>
    </section>
  `, { nav: Boolean(saveData) && origin !== "title" });
}

function showCodexDetail(entryId) {
  const entry = CODEX.find((item) => item.id === entryId);
  const data = saveData || createNewSave("みならい");
  if (!entry || !data.codexUnlocked.includes(entryId)) return;
  const accuracy = accuracyFor(entry.id);
  screen.insertAdjacentHTML("beforeend", `
    <article class="codex-detail parchment-panel">
      <h2>${escapeHtml(entry.name)} <small>— ${escapeHtml(entry.title)}</small></h2>
      <dl>
        <dt>主な働き</dt><dd>${entry.functions.map(escapeHtml).join("・")}</dd>
        <dt>五行</dt><dd>${escapeHtml(entry.element)}</dd>
        <dt>季節</dt><dd>${escapeHtml(entry.season || "—")}</dd>
        <dt>感情</dt><dd>${escapeHtml(entry.emotion || "—")}</dd>
        <dt>開竅</dt><dd>${escapeHtml(entry.opening || "—")}</dd>
        <dt>表裏</dt><dd>${escapeHtml(entry.pair)}</dd>
        <dt>覚え方</dt><dd>${escapeHtml(entry.mnemonic)}</dd>
        <dt>正解率</dt><dd>${accuracy === null ? "まだ挑戦していません" : `${accuracy}%`}</dd>
      </dl>
      <button class="rpg-button" data-action="close-detail">図鑑にもどる</button>
    </article>
  `);
}

function closeCodex() {
  if (previousScreen === "title" || !saveData) {
    renderTitle();
  } else if (previousScreen === "stage" && currentStageId) {
    renderStage(currentStageId);
  } else {
    renderMap();
  }
}

function openModal(contents) {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-modal-action="close-modal">
      <section class="modal parchment-panel" role="dialog" aria-modal="true">
        ${contents}
      </section>
    </div>
  `;
}

function closeModal() {
  modalRoot.innerHTML = "";
}

function showItems() {
  const items = Object.entries(saveData.items)
    .map(([name, count]) => `<li><span>${escapeHtml(name)}</span><strong>×${count}</strong></li>`).join("");
  openModal(`
    <h2>どうぐ袋</h2>
    <ul class="modal-list">${items}</ul>
    <div class="modal-actions"><button class="rpg-button" data-modal-action="close-modal">とじる</button></div>
  `);
}

function showSkills() {
  const skills = saveData.skills.length
    ? saveData.skills.map((skill) => `<li><span>✦ ${escapeHtml(skill)}</span><strong>習得</strong></li>`).join("")
    : "<li>まだ五行スキルを覚えていません</li>";
  openModal(`
    <h2>五行スキル</h2>
    <ul class="modal-list">${skills}</ul>
    <p>相生の順：<strong>木 → 火 → 土 → 金 → 水 → 木</strong></p>
    <p>五つをつなぐ連携技は本編拡張で解放されます。</p>
    <div class="modal-actions"><button class="rpg-button" data-modal-action="close-modal">とじる</button></div>
  `);
}

function showParty() {
  openModal(`
    <h2>仲間</h2>
    <p class="menu-profile">
      <strong>${escapeHtml(saveData.playerName)}</strong><br>
      ${escapeHtml(saveData.job)} Lv.${saveData.level}<br>
      武器：${escapeHtml(saveData.weapon)}<br>
      防具：${escapeHtml(saveData.armor)}<br>
      特技：${escapeHtml(saveData.special)}<br>
      必殺技：${escapeHtml(saveData.finisher)}
    </p>
    <p><strong>シンポー</strong><br>心の君を守る心包の精霊。難しい言葉を短く解説してくれる。</p>
    <div class="modal-actions"><button class="rpg-button" data-modal-action="close-modal">とじる</button></div>
  `);
}

function showMainMenu() {
  openModal(`
    <h2>メニュー</h2>
    <p class="menu-profile">冒険は自動で保存されています。<br>クイズ収録：${QUIZZES.length}問</p>
    <div class="modal-actions">
      <button class="rpg-button" data-modal-action="go-map">ワールドマップ</button>
      <button class="rpg-button" data-modal-action="review">復習モード</button>
      <button class="rpg-button" data-modal-action="toggle-sound">音：${saveData.soundOn ? "ON" : "OFF"}</button>
      <button class="rpg-button" data-modal-action="go-title">タイトルへ</button>
      <button class="rpg-button" data-modal-action="close-modal">とじる</button>
    </div>
  `);
}

function showReview() {
  const wrongQuestions = QUIZZES.filter((quiz) => {
    const stats = saveData.quizStats[quiz.id];
    return stats && stats.correct < stats.attempts;
  }).length;
  const categories = Object.values(CATEGORY_NAMES).map((name) => `<span>${name}</span>`).join("・");
  openModal(`
    <h2>復習モード</h2>
    <p>間違えた問題：<strong>${wrongQuestions}問</strong></p>
    <p>${categories}</p>
    <p>プロトタイプでは、心と肝の問診バトルを再挑戦すると正解率が更新されます。カテゴリー別の連続出題は次期実装です。</p>
    <div class="modal-actions"><button class="rpg-button" data-modal-action="close-modal">とじる</button></div>
  `);
}

function showSoundSettings() {
  const isOn = saveData?.soundOn ?? titleSoundOn;
  openModal(`
    <h2>音量設定</h2>
    <p>効果音：<strong>${isOn ? "ON" : "OFF"}</strong></p>
    <p>音声ファイルは使わず、対応端末で短い電子音を鳴らします。</p>
    <div class="modal-actions">
      <button class="rpg-button" data-modal-action="toggle-title-sound">${isOn ? "音をOFFにする" : "音をONにする"}</button>
      <button class="rpg-button" data-modal-action="close-modal">とじる</button>
    </div>
  `);
}

function handleRegion(regionId) {
  if (!saveData.unlockedRegions.includes(regionId)) {
    notify("未病の霧で道が閉ざされている");
    return;
  }
  const region = REGIONS.find((item) => item.id === regionId);
  if (!region?.implemented) {
    openModal(`
      <h2>${escapeHtml(region.name)}</h2>
      <p>道は見つかりましたが、この章はプロトタイプの続編で実装予定です。</p>
      <div class="modal-actions"><button class="rpg-button" data-modal-action="close-modal">マップにもどる</button></div>
    `);
    return;
  }
  renderStage(regionId, true);
}

screen.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button || button.disabled) return;
  const { action } = button.dataset;

  if (action !== "answer") sound("tap");

  switch (action) {
    case "new-game":
      renderNameEntry();
      break;
    case "continue":
      saveData = SaveManager.load();
      saveData ? renderMap() : renderNameEntry();
      break;
    case "back-title":
      renderTitle();
      break;
    case "open-codex-title":
      renderCodex("title");
      break;
    case "sound-settings":
      showSoundSettings();
      break;
    case "select-region":
      handleRegion(button.dataset.region);
      break;
    case "back-map":
      renderMap();
      break;
    case "explore":
      explorePoint(button.dataset.point);
      break;
    case "boss":
      startBattle(currentStageId);
      break;
    case "dialogue-next":
      advanceDialogue();
      break;
    case "answer":
      answerQuestion(button.dataset.answer);
      break;
    case "battle-next":
      nextBattleStep();
      break;
    case "codex-detail":
      showCodexDetail(button.dataset.entry);
      break;
    case "locked-codex":
      notify("物語で出会うとページが開きます");
      break;
    case "close-detail":
      document.querySelector(".codex-detail")?.remove();
      break;
    case "close-codex":
      closeCodex();
      break;
    default:
      break;
  }
});

screen.addEventListener("submit", (event) => {
  if (event.target.id !== "name-form") return;
  event.preventDefault();
  const formData = new FormData(event.target);
  const playerName = String(formData.get("playerName") || "").trim().slice(0, 8);
  if (!playerName) {
    notify("名前を入力してね");
    return;
  }
  saveData = createNewSave(playerName);
  saveData.soundOn = titleSoundOn;
  persist();
  renderMap();
  window.setTimeout(() => openDialogue([
    ["シンポー", `${playerName}、からだの国へようこそ！`],
    ["心の君", "未病の霧が、皆の役割を奪っている。"],
    ["心の君", "まずは心の城で、消えた鼓動を探してくれ。"],
  ]), 200);
});

bottomNav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-nav]");
  if (!button || !saveData) return;
  sound("tap");
  switch (button.dataset.nav) {
    case "items": showItems(); break;
    case "magic": notify("まほうは準備中です"); break;
    case "skills": showSkills(); break;
    case "party": showParty(); break;
    case "codex": renderCodex(currentScreen); break;
    case "menu": showMainMenu(); break;
    default: break;
  }
});

modalRoot.addEventListener("click", (event) => {
  const actionTarget = event.target.closest("[data-modal-action]");
  if (!actionTarget) return;
  if (actionTarget.classList.contains("modal-backdrop") && event.target !== actionTarget) return;
  const action = actionTarget.dataset.modalAction;
  sound("tap");

  switch (action) {
    case "close-modal":
      closeModal();
      break;
    case "go-map":
      renderMap();
      break;
    case "go-title":
      renderTitle();
      break;
    case "toggle-sound":
      saveData.soundOn = !saveData.soundOn;
      persist();
      showMainMenu();
      break;
    case "toggle-title-sound": {
      titleSoundOn = !(saveData?.soundOn ?? titleSoundOn);
      if (saveData) {
        saveData.soundOn = titleSoundOn;
        persist();
      }
      showSoundSettings();
      break;
    }
    case "review":
      showReview();
      break;
    case "retry-battle":
      closeModal();
      startBattle(battleState.stageId);
      break;
    case "leave-battle":
      closeModal();
      renderStage(battleState.stageId);
      battleState = null;
      break;
    default:
      break;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (modalRoot.innerHTML) closeModal();
    else if (dialogueState) advanceDialogue();
    else if (currentScreen !== "title") renderMap();
  }
  if ((event.key === "Enter" || event.key === " ") && dialogueState) {
    event.preventDefault();
    advanceDialogue();
  }
});

renderTitle();
