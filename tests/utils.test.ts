import { clearText } from "@/shared/utils";
import { describe, expect, test } from "bun:test";

describe("clearText", () => {
  test("should clear zalgo", () => {
    expect(clearText("h̵̢͖̝̜͔͎͍̻͔̤̻͓͒͒́̌̐̿͗̿́ͅã̸͙̹̏̓͌̔̆̃̇ẖ̸̢̫̘̹̱̣͓̜̝̮̲͕̩̈̑̽̃̄͗̃͘͜ā̴̝̹̗̙̤̌̒͑̀̂̈̾͆̕̕t̷̡̙̖͖̩̪̥͕̼̙̲̰͌̏͒̍́̀̿̇̆͂͗͘e̸̦͍̹͌́͗͌̿̿̈́̇̚̕͠s̴̡̡͈͖͇͎̖̦̞͍̹̤̘͆̊̿͗͌͝͠ͅţ̷̻͋̂͂́̓̀̑̍̀̚")).toBe("hahatest");
  });

  test("should save espanol and etc", () => {
    expect(clearText("мой ёж")).toBe("мой ёж");
    expect(clearText("español")).toBe("español");
    expect(clearText("العربية")).toBe("العربية");
    expect(clearText("日本語")).toBe("日本語");
  });

  test("should save symbols", () => {
    expect(clearText(":3c")).toBe(":3c");
    expect(clearText("(^_^)")).toBe("(^_^)");
  });

  test("fancy text", () => {
    // just removes double spaces
    expect(clearText("♞♥  şᵒ 𝕔ⓞ𝐎𝔩  👽💎")).toBe("♞♥ şᵒ 𝕔ⓞ𝐎𝔩 👽💎");
    // remove only zalgo
    expect(clearText("꯱ׁׅ֒ᨵׁׅ ᝯׁᨵׁׅᨵׁׅᥣׁׅ֪")).toBe("꯱ᨵׁׅ ᝯׁᨵׁׅᨵׁׅᥣ");
    expect(clearText("ᦓꪮ ᥴꪮꪮꪶ")).toBe("ᦓꪮ ᥴꪮꪮꪶ");
    expect(clearText("🆂🅾 🅲🅾🅾🅻")).toBe("🆂🅾 🅲🅾🅾🅻");
    expect(clearText("]|I{•------» 𝓈๏ Ｃｏᗝㄥ «------•}I|[")).toBe(
      "]|I{•------» 𝓈๏ Ｃｏᗝㄥ «------•}I|[",
    );
    expect(clearText("ₛₒ cₒₒˡ")).toBe("ₛₒ cₒₒˡ");
  });
});
