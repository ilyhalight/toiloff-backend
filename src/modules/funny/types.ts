export const Cuteness = {
  NotCute: 0,
  Cute: 1,
  VeryCute: 2,
  ExtremelyCute: 3,
} as const;
export type Cuteness = (typeof Cuteness)[keyof typeof Cuteness];

export type CuteScores = Record<Cuteness, number>;

export const CuteWords = {
  [Cuteness.NotCute]: ["meow", "miao", "mew", "mrr", "mow"],
  [Cuteness.Cute]: ["mrrp", "prrp", "purr", "meu"],
  [Cuteness.VeryCute]: ["nya"],
  [Cuteness.ExtremelyCute]: ["meowu"],
} as const;

// 33% | 25%
export type NyaChance = 3 | 4;
// 25% | 12%
export type RepeatChance = 4 | 8;
// 25% | 12% | 5%
export type ToneChance = 4 | 8 | 20;

export type CutebaseItem = {
  min: number;
  max: number;
  words: readonly string[];
  nya: NyaChance;
  repeatChance: RepeatChance;
  toneChance: ToneChance;
};

export const CuteBase: Record<Cuteness, CutebaseItem> = {
  [Cuteness.NotCute]: {
    min: 1,
    max: 3,
    words: CuteWords[Cuteness.NotCute],
    nya: 3,
    repeatChance: 8,
    toneChance: 20,
  },
  [Cuteness.Cute]: {
    min: 2,
    max: 5,
    words: [
      ...CuteWords[Cuteness.NotCute],
      ...CuteWords[Cuteness.Cute],
      ...CuteWords[Cuteness.VeryCute],
    ],
    nya: 3,
    repeatChance: 8,
    toneChance: 20,
  },
  [Cuteness.VeryCute]: {
    min: 3,
    max: 6,
    words: [
      ...CuteWords[Cuteness.NotCute],
      ...CuteWords[Cuteness.Cute],
      ...CuteWords[Cuteness.VeryCute],
      ...CuteWords[Cuteness.ExtremelyCute],
    ],
    nya: 4,
    repeatChance: 8,
    toneChance: 8,
  },
  [Cuteness.ExtremelyCute]: {
    min: 3,
    max: 7,
    words: [...CuteWords[Cuteness.NotCute], ...CuteWords[Cuteness.Cute]],
    nya: 3,
    repeatChance: 4,
    toneChance: 4,
  },
} as const;
