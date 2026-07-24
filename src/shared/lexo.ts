import { LexoRank } from "lexorank";

export const calcBeetweenLexo = (after: string | null, before: string | null): string => {
  const afterLexo = LexoRank.parse(after || LexoRank.min().toString());
  const beforeLexo = LexoRank.parse(before || LexoRank.max().toString());
  if (afterLexo.equals(beforeLexo)) {
    return afterLexo.genNext().toString();
  }

  return afterLexo.between(beforeLexo).toString();
};
