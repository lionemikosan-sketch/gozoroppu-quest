export const INITIAL_ITEMS = {
  "薬草": 3,
  "鍼": 5,
  "もぐさ": 3,
  "養生の書": 1,
};

export const ELEMENTS = {
  fire: { name: "火", color: "#e75b4e", skill: "神明の光" },
  wood: { name: "木", color: "#4f9b55", skill: "疏泄の風" },
  earth: { name: "土", color: "#d7ae43", skill: "運化の恵み" },
  metal: { name: "金", color: "#d8d7cf", skill: "粛降の息吹" },
  water: { name: "水", color: "#345c94", skill: "腎精の泉" },
};

export const REGIONS = [
  { id: "heart", name: "心の城", icon: "♥", element: "fire", x: 49, y: 27, implemented: true },
  { id: "liver", name: "肝の森", icon: "♧", element: "wood", x: 78, y: 41, implemented: true },
  { id: "spleen", name: "脾の大地", icon: "●", element: "earth", x: 24, y: 48 },
  { id: "lung", name: "肺の雲海", icon: "☁", element: "metal", x: 20, y: 23 },
  { id: "kidney", name: "腎の泉郷", icon: "≈", element: "water", x: 20, y: 67 },
  { id: "gallbladder", name: "胆の渓谷", icon: "◆", element: "wood", x: 72, y: 55 },
  { id: "stomach", name: "胃の洞窟", icon: "◒", element: "earth", x: 27, y: 58 },
  { id: "small-intestine", name: "小腸の運河", icon: "≋", element: "fire", x: 54, y: 54 },
  { id: "large-intestine", name: "大腸の遺跡", icon: "▣", element: "metal", x: 77, y: 66 },
  { id: "bladder", name: "膀胱の貯水湖", icon: "◉", element: "water", x: 48, y: 72 },
  { id: "sanjiao", name: "三焦の塔", icon: "♜", element: "fire", x: 80, y: 17 },
];

export const STAGES = {
  heart: {
    id: "heart",
    title: "第1章　心の城と消えた鼓動",
    subtitle: "感情を失った城下町",
    character: "心の君",
    characterClass: "heart",
    boss: "神明かくし",
    color: "#e75b4e",
    intro: [
      ["シンポー", "{心の城}から笑い声が消えちゃった！"],
      ["心の君", "国を守るには、私が働き続けねば。"],
      ["シンポー", "一人で全部は、さすがに無茶だよ！"],
    ],
    points: [
      {
        id: "lord",
        icon: "♥",
        label: "心の君",
        type: "talk",
        pages: [
          ["心の君", "胸の灯が弱い。民の顔も暗いのだ。"],
          ["シンポー", "{心}は{血脈}を動かす君主なんだ。"],
          ["シンポー", "そして心は{神}を蔵す。心や意識のこと！"],
        ],
        reward: "役割の記憶「血脈」",
      },
      {
        id: "bell",
        icon: "♬",
        label: "鼓動の鐘",
        type: "observe",
        pages: [
          ["主人公", "鐘の音が弱く、道の灯も消えている。"],
          ["シンポー", "血が巡ると、全身に力が届くんだよ。"],
        ],
        reward: "鼓動のかけら",
      },
      {
        id: "citizen",
        icon: "☺",
        label: "無表情な民",
        type: "talk",
        pages: [
          ["城の民", "うれしいのに、笑い方が分からない。"],
          ["シンポー", "{喜}は心と深い関係があるんだ。"],
          ["シンポー", "心は{舌}にも開竅するよ！"],
        ],
        reward: "役割の記憶「神」",
      },
      {
        id: "rest",
        icon: "☕",
        label: "休息の間",
        type: "item",
        pages: [
          ["主人公", "皆でお茶を囲める部屋がある。"],
          ["心の君", "任せ、休むことも国を守る力か…。"],
          ["シンポー", "{心と小腸}は表裏の仲間だよ！"],
        ],
        reward: "養生茶",
      },
    ],
    bossIntro: [
      ["神明かくし", "心など、ひとりで燃え尽きればよい！"],
      ["心の君", "いや、仲間と共に国の鼓動を取り戻す！"],
    ],
    clearDialogue: [
      ["心の君", "血も心も、仲間と巡ってこそ輝く。"],
      ["シンポー", "{火の記憶}、神明の光を取り戻した！"],
      ["シンポー", "次は風が荒れる{肝の森}へ行こう！"],
    ],
    quizTags: ["heart"],
    unlocks: "liver",
  },
  liver: {
    id: "liver",
    title: "第2章　肝の森と怒れる風",
    subtitle: "ねじれた道と気滞のツタ",
    character: "肝の武将",
    characterClass: "liver",
    boss: "気滞のツタ",
    color: "#4f9b55",
    intro: [
      ["肝の武将", "道よ、命令どおり真っすぐになれ！"],
      ["シンポー", "力ずくで押すほど、流れが詰まってる！"],
      ["主人公", "森を巡り、気の道を調べよう。"],
    ],
    points: [
      {
        id: "general",
        icon: "♞",
        label: "肝の武将",
        type: "talk",
        pages: [
          ["肝の武将", "計画どおり進まぬ。腹が立つ！"],
          ["シンポー", "{怒}は肝と関係する感情だよ。"],
          ["シンポー", "流れを整える{疏泄}を思い出して！"],
        ],
        reward: "役割の記憶「疏泄」",
      },
      {
        id: "vine",
        icon: "⌁",
        label: "ねじれたツタ",
        type: "observe",
        pages: [
          ["主人公", "ツタの流れが途中で固まっている。"],
          ["シンポー", "{疏泄}は気をスムーズに流す仕事！"],
        ],
        reward: "風の道しるべ",
      },
      {
        id: "archer",
        icon: "⌖",
        label: "目をこする兵",
        type: "talk",
        pages: [
          ["森の兵", "目が疲れて、筋もつりやすいんだ。"],
          ["シンポー", "{肝}は{目}や{筋}と関係が深いよ。"],
        ],
        reward: "役割の記憶「目と筋」",
      },
      {
        id: "storehouse",
        icon: "▥",
        label: "血の倉",
        type: "item",
        pages: [
          ["主人公", "必要な時に血を送り出す倉のようだ。"],
          ["シンポー", "肝は{血を蔵す}。これを蔵血というよ。"],
          ["肝の武将", "{胆}の決断も借りねばならぬな。"],
        ],
        reward: "役割の記憶「蔵血」",
      },
    ],
    bossIntro: [
      ["気滞のツタ", "オコレ、イソゲ、全部セキ止メロ！"],
      ["肝の武将", "流れは命令でなく、調和で整える！"],
    ],
    clearDialogue: [
      ["肝の武将", "気が巡れば、進む道も見えてくる。"],
      ["シンポー", "{木の記憶}、疏泄の風を取り戻した！"],
      ["主人公", "五臓と六腑のつながりを探す旅は続く。"],
    ],
    quizTags: ["liver"],
    unlocks: "spleen",
  },
};

export const CODEX = [
  {
    id: "heart", name: "心", title: "情熱の君主", characterClass: "heart", element: "火",
    functions: ["血脈を主る", "神を蔵す"], season: "夏", emotion: "喜", opening: "舌",
    pair: "小腸", mnemonic: "心は血を巡らせ、心の灯を守る王様",
  },
  {
    id: "liver", name: "肝", title: "流れを整える武将", characterClass: "liver", element: "木",
    functions: ["疏泄を主る", "血を蔵す", "筋と関係"], season: "春", emotion: "怒", opening: "目",
    pair: "胆", mnemonic: "肝は気の交通整理と血の倉番",
  },
  {
    id: "spleen", name: "脾", title: "働き者の農場主", characterClass: "spleen", element: "土",
    functions: ["運化を主る", "統血する"], season: "長夏", emotion: "思", opening: "口",
    pair: "胃", mnemonic: "脾は栄養を届ける配達員",
  },
  {
    id: "lung", name: "肺", title: "雲海の司令官", characterClass: "lung", element: "金",
    functions: ["気と呼吸を主る", "宣発と粛降", "通調水道"], season: "秋", emotion: "悲・憂", opening: "鼻",
    pair: "大腸", mnemonic: "肺は気と水を上下へ動かす司令官",
  },
  {
    id: "kidney", name: "腎", title: "泉を守る長老", characterClass: "kidney", element: "水",
    functions: ["精を蔵す", "水を主る", "納気を主る"], season: "冬", emotion: "恐", opening: "耳",
    pair: "膀胱", mnemonic: "腎は成長を支える命の泉",
  },
  {
    id: "gallbladder", name: "胆", title: "決断の騎士", element: "木",
    functions: ["胆汁を貯蔵・排泄", "決断と関係"], pair: "肝", mnemonic: "胆は決めて進む騎士",
  },
  {
    id: "stomach", name: "胃", title: "洞窟の料理人", element: "土",
    functions: ["食べ物を受納", "腐熟する", "胃気は下降"], pair: "脾", mnemonic: "胃は受け入れ煮込む大鍋",
  },
  {
    id: "small-intestine", name: "小腸", title: "運河の仕分け職人", element: "火",
    functions: ["受盛と化物", "清濁を泌別"], pair: "心", mnemonic: "小腸は清と濁の仕分け係",
  },
  {
    id: "large-intestine", name: "大腸", title: "遺跡の清掃員", element: "金",
    functions: ["糟粕を伝導", "排便と関係"], pair: "肺", mnemonic: "大腸は不要物を送り出す清掃員",
  },
  {
    id: "bladder", name: "膀胱", title: "貯水湖の番人", element: "水",
    functions: ["尿を貯蔵", "尿を排泄", "腎の気化と関係"], pair: "腎", mnemonic: "膀胱は腎と働く貯水番",
  },
  {
    id: "sanjiao", name: "三焦", title: "全身を結ぶ塔守", element: "—",
    functions: ["上焦・中焦・下焦を管理", "気と水液の機能的な通路", "全身の気化と関係"],
    pair: "心包", mnemonic: "三焦は全身をつなぐ水路と気の道",
  },
  {
    id: "pericardium", name: "心包", title: "心を守る精霊", element: "火",
    functions: ["心を外邪から守る"], pair: "三焦", mnemonic: "心包は心の護衛役",
  },
];

export const CATEGORY_NAMES = {
  organ: "五臓の働き",
  fu: "六腑の働き",
  pair: "表裏関係",
  element: "五行",
  emotion: "感情",
  season: "季節",
  opening: "開竅",
  case: "症例問題",
};
