import { csvParser } from "../src/parser";
import { describe, expect, it } from "vitest";

describe("csv parsing", () => {
  const test = `title,director,year
Pulp Fiction,Quentin Tarantino,1994
Up,Pete Docter,2009
`;

  it("Basic raw parsing on well formed input", () => {
    const expected = [
      ["title", "director", "year"],
      ["Pulp Fiction", "Quentin Tarantino", "1994"],
      ["Up", "Pete Docter", "2009"],
    ];
    const output = csvParser.rawParse(test);
    expect(output).toStrictEqual(expected);
  });
});
