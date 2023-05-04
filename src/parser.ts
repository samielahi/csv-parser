import type { ParsedRow } from "./types";

export const csvParser = (() => {
  const isClosingQuotedValue = (
    currentCharacter: string,
    nextCharacter: string,
    insideQuotedField: boolean
  ) => currentCharacter === '"' && nextCharacter === '"' && insideQuotedField;

  const isQuote = (currentCharacter: string) => currentCharacter === '"';

  const isSeparatorComma = (currentCharacter: string, insideQuotedField: boolean) =>
    currentCharacter === "," && !insideQuotedField;

  const isWindowsNewline = (
    currentCharacter: string,
    nextCharacter: string,
    insideQuotedField: boolean
  ) => currentCharacter == "\r" && nextCharacter == "\n" && !insideQuotedField;

  const isUnixNewLine = (currentCharacter: string, insideQuotedField: boolean) =>
    (currentCharacter == "\n" || currentCharacter == "\r") && !insideQuotedField;

  function rawParse(rawString: string): ParsedRow[] {
    const parsedRows: ParsedRow[] = [];
    let currentRow: string[] = [];
    let currentColumn = 0;
    let insideQuotedField = false;

    for (let cursor = 0; cursor < rawString.length; cursor++) {
      const currentCharacter = rawString[cursor];
      const nextCharacter = rawString[cursor + 1];
      currentRow[currentColumn] = currentRow[currentColumn] || "";

      if (isClosingQuotedValue(currentCharacter, nextCharacter, insideQuotedField)) {
        currentRow[currentColumn] += currentCharacter;
        continue;
      } else if (isQuote(currentCharacter)) {
        insideQuotedField = !insideQuotedField;
      } else if (isSeparatorComma(currentCharacter, insideQuotedField)) {
        currentColumn++;
      } else if (isWindowsNewline(currentCharacter, nextCharacter, insideQuotedField)) {
        parsedRows.push(currentRow);
        currentColumn = 0;
        currentRow = [];
        continue;
      } else if (isUnixNewLine(currentCharacter, insideQuotedField)) {
        parsedRows.push(currentRow);
        currentColumn = 0;
        currentRow = [];
      } else {
        currentRow[currentColumn] += currentCharacter;
      }
    }

    return parsedRows;
  }

  return { rawParse };
})();
