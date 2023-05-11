import { csvParser } from "../src/parser";
import { describe, expect, it } from "vitest";
import z from "zod";

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
    const output = csvParser.parse(test).unwrapOr([]);
    expect(output).toStrictEqual(expected);
  });

  it("Basic validated parse on well formed input", () => {
    const expected = [
      { title: "Pulp Fiction", director: "Quentin Tarantino", year: 1994 },
      { title: "Up", director: "Pete Docter", year: 2009 },
    ];

    const schema = z.object({
      title: z.string(),
      director: z.string(),
      year: z.coerce.number().min(1875).max(2023),
    });

    const output = csvParser
      .parse(test, {
        requiredColumns: ["title", "director", "year"],
        columnSchema: schema,
      })
      .unwrapOr([]);
    expect(output).toStrictEqual(expected);
  });
});
