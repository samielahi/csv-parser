import type { ParsedRow } from "./types";

export const csvParser = (() => {
  function* rawParse(rawString: string): Generator<ParsedRow, void, undefined> {
    let currentRow: string[] = [];
    let currentColumn = 0;
    let insideQuotedField = false;

    for (let cursor = 0; cursor < rawString.length; cursor++) {
      const currentCharacter = rawString[cursor];
      const nextCharacter = rawString[cursor + 1];
      currentRow[currentColumn] = currentRow[currentColumn] || "";

      if (currentCharacter === '"' && nextCharacter === '"' && insideQuotedField) {
        currentRow[currentColumn] += currentCharacter;
        continue;
      } else if (currentCharacter === '"') {
        insideQuotedField = !insideQuotedField;
      } else if (currentCharacter === "," && !insideQuotedField) {
        currentColumn++;
      } else if (
        currentCharacter == "\r" &&
        nextCharacter == "\n" &&
        !insideQuotedField
      ) {
        yield currentRow;
        currentColumn = 0;
        currentRow = [];
        continue;
      } else if (
        (currentCharacter == "\n" || currentCharacter == "\r") &&
        !insideQuotedField
      ) {
        yield currentRow;
        currentColumn = 0;
        currentRow = [];
      } else {
        currentRow[currentColumn] += currentCharacter;
      }
    }

    currentRow.length && (yield currentRow);
  }

  return { rawParse };
})();
