import { insertAt, randomInt } from "@/shared/utils";
import { CuteBase, Cuteness, CuteScores, NyaChance, RepeatChance, ToneChance } from "./types";

export abstract class FunnyService {
  static cuteRegexes = [/n(y+)(a+)/, /(~+(\s|$))/, /m(e+)(o+)?(w+)/, /m(r+)/];
  static cuteScores: CuteScores = {
    [Cuteness.NotCute]: 0,
    [Cuteness.Cute]: 2,
    [Cuteness.VeryCute]: 4,
    [Cuteness.ExtremelyCute]: 6,
  } as const;

  static isSoCute(cuteness: Cuteness) {
    return cuteness > Cuteness.Cute;
  }

  static checkChance(chance: number) {
    return randomInt(1, chance) === chance;
  }

  static canNya(cuteness: Cuteness, chance: NyaChance) {
    return this.isSoCute(cuteness) && this.checkChance(chance);
  }

  static canRepeat(cuteness: Cuteness, chance: RepeatChance) {
    return this.isSoCute(cuteness) && this.checkChance(chance);
  }

  static canTone(cuteness: Cuteness, chance: ToneChance) {
    return cuteness > Cuteness.NotCute && this.checkChance(chance);
  }

  static randomRepeat(word: string) {
    const letters = Array.from(word.matchAll(/r|w|a/g));
    if (!letters?.length) {
      return word;
    }

    const letterIdx = letters[randomInt(0, letters.length - 1)].index;
    const repeatedLetter = word[letterIdx].repeat(randomInt(2, 4));

    return insertAt(word, letterIdx, repeatedLetter);
  }

  static getCutenessByScore(score: number): Cuteness {
    const cuteData = Object.entries(this.cuteScores) as unknown as [Cuteness, number][];
    let lastMaxScore = 0;
    let result: Cuteness = Cuteness.NotCute;
    for (const [cuteness, cuteScore] of cuteData) {
      if (cuteScore > lastMaxScore && score >= cuteScore) {
        result = cuteness;
        lastMaxScore = cuteScore;
      }
    }

    return result;
  }

  static getCuteness(text?: string): Cuteness {
    if (!text) {
      return 0;
    }

    text = text.trim();
    if (text === "") {
      return 0;
    }

    let score = 0;
    const tokens = text.split(" ");
    for (const cuteRegex of this.cuteRegexes) {
      for (const token of tokens) {
        if (cuteRegex.exec(token)?.length) {
          score += 1;
        }
      }
    }

    if (text.endsWith(":3")) {
      score += 1;
    }

    return this.getCutenessByScore(score);
  }

  static async meow(sound?: string) {
    const cuteness = this.getCuteness(sound);
    const cutebase = CuteBase[cuteness];
    const meowLen = randomInt(cutebase.min, cutebase.max);
    const meowTokens = Array.from({ length: meowLen }).map((_) => {
      const rand = randomInt(0, cutebase.words.length - 1);
      let word = cutebase.words[rand];
      // try to add letter repeating in word for very and extremely cute meows
      if (this.canRepeat(cuteness, cutebase.repeatChance)) {
        word = this.randomRepeat(word);
      }

      // try to add ~ to end of word for all cute messages (except not cute)
      if (this.canTone(cuteness, cutebase.toneChance)) {
        word += "~";
      }

      return word;
    });

    // try to add :3 ending for very and extremely cute meows
    if (this.canNya(cuteness, cutebase.nya)) {
      meowTokens.push(":3");
    }

    return { sound: meowTokens.join(" ") };
  }
}
