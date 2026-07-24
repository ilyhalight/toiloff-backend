import { describe, expect, test } from "bun:test";
import { LexoRank } from "lexorank";

import { calcBeetweenLexo } from "@/shared/lexo";

const before = LexoRank.min().genNext();
const after = before.genNext();

describe("calcBeetweenLexo", () => {
  test("returns a rank between the boundaries when after > before", () => {
    const result = LexoRank.parse(calcBeetweenLexo(after.toString(), before.toString()));

    expect(result.compareTo(before)).toBeGreaterThan(0);
    expect(result.compareTo(after)).toBeLessThan(0);
  });

  test("returns a rank between the boundaries when before > after", () => {
    const result = LexoRank.parse(calcBeetweenLexo(before.toString(), after.toString()));

    expect(result.compareTo(before)).toBeGreaterThan(0);
    expect(result.compareTo(after)).toBeLessThan(0);
  });

  test("returns the next rank when after === before", () => {
    expect(calcBeetweenLexo(after.toString(), after.toString())).toBe(after.genNext().toString());
  });
});
