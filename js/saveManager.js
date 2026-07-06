const SAVE_KEY = "gozo-roppu-quest-save-v1";

export const createNewSave = (playerName = "みならい") => ({
  version: 1,
  playerName,
  job: "見習い治療士",
  weapon: "木製の鍼",
  armor: "養生の羽織",
  special: "問診",
  finisher: "証を見抜く",
  level: 1,
  exp: 0,
  unlockedRegions: ["heart"],
  clearedRegions: [],
  explored: { heart: [], liver: [] },
  seenStageIntro: [],
  codexUnlocked: ["heart", "pericardium"],
  skills: [],
  items: { "薬草": 3, "鍼": 5, "もぐさ": 3, "養生の書": 1 },
  quizStats: {},
  soundOn: true,
  updatedAt: Date.now(),
});

export const SaveManager = {
  exists() {
    return Boolean(localStorage.getItem(SAVE_KEY));
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const saved = JSON.parse(raw);
      return {
        ...createNewSave(saved.playerName),
        ...saved,
        explored: { heart: [], liver: [], ...(saved.explored || {}) },
        quizStats: saved.quizStats || {},
      };
    } catch {
      return null;
    }
  },

  save(data) {
    data.updatedAt = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  },

  remove() {
    localStorage.removeItem(SAVE_KEY);
  },
};
