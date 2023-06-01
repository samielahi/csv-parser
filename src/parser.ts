import { createFrequencyMap, toObject } from "./utils";
import { Result } from "true-myth";
import type { CSVParsingError, ParsedRow, ParserOptions, Row } from "./types";

export const csvParser = (() => {
  const isClosingQuotedValue = (
    currentCharacter: string,
    nextCharacter: string,
    insideQuotedField: boolean
  ) => currentCharacter === '"' && nextCharacter === '"' && insideQuotedField;

  const isQuote = (currentCharacter: string) => currentCharacter === '"';

  const isSeparatorComma = (
    currentCharacter: string,
    insideQuotedField: boolean
  ) => currentCharacter === "," && !insideQuotedField;

  const isWindowsNewline = (
    currentCharacter: string,
    nextCharacter: string,
    insideQuotedField: boolean
  ) => currentCharacter == "\r" && nextCharacter == "\n" && !insideQuotedField;

  const isUnixNewLine = (
    currentCharacter: string,
    insideQuotedField: boolean
  ) =>
    (currentCharacter == "\n" || currentCharacter == "\r") &&
    !insideQuotedField;

  function rawParse(rawString: string): ParsedRow[] {
    const parsedRows: ParsedRow[] = [];
    let currentRow: ParsedRow = [];
    let currentColumn = 0;
    let insideQuotedField = false;

    for (let cursor = 0; cursor < rawString.length; cursor++) {
      const currentCharacter = rawString[cursor];
      const nextCharacter = rawString[cursor + 1];
      currentRow[currentColumn] = currentRow[currentColumn] || "";

      if (
        isClosingQuotedValue(currentCharacter, nextCharacter, insideQuotedField)
      ) {
        currentRow[currentColumn] += currentCharacter;
        continue;
      } else if (isQuote(currentCharacter)) {
        insideQuotedField = !insideQuotedField;
      } else if (isSeparatorComma(currentCharacter, insideQuotedField)) {
        currentColumn++;
      } else if (
        isWindowsNewline(currentCharacter, nextCharacter, insideQuotedField)
      ) {
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

  function* rawParseGenerator(
    rawString: string
  ): Generator<ParsedRow, void, undefined> {
    let currentRow: ParsedRow = [];
    let currentColumn = 0;
    let insideQuotedField = false;

    for (let cursor = 0; cursor < rawString.length; cursor++) {
      const currentCharacter = rawString[cursor];
      const nextCharacter = rawString[cursor + 1];
      currentRow[currentColumn] = currentRow[currentColumn] || "";

      if (
        isClosingQuotedValue(currentCharacter, nextCharacter, insideQuotedField)
      ) {
        currentRow[currentColumn] += currentCharacter;
        continue;
      } else if (isQuote(currentCharacter)) {
        insideQuotedField = !insideQuotedField;
      } else if (isSeparatorComma(currentCharacter, insideQuotedField)) {
        currentColumn++;
      } else if (
        isWindowsNewline(currentCharacter, nextCharacter, insideQuotedField)
      ) {
        yield currentRow;
        currentColumn = 0;
        currentRow = [];
        continue;
      } else if (isUnixNewLine(currentCharacter, insideQuotedField)) {
        yield currentRow;
        currentColumn = 0;
        currentRow = [];
      } else {
        currentRow[currentColumn] += currentCharacter;
      }
    }

    currentRow.length && (yield currentRow);
  }

  function validateColumns(
    columns: ParsedRow,
    requiredColumns: string[]
  ): Result<string[], CSVParsingError> {
    const cleanedColumns = columns.map((value) => value.trim().toLowerCase());
    const columnFrequencyMap = createFrequencyMap<string>(cleanedColumns);

    for (const column of requiredColumns) {
      const count = columnFrequencyMap.get(column);
      // If the count doesn't exist then report that the column is missing
      if (!count) {
        return Result.err({
          code: "missing_required_col",
          message: `File missing required column: '${column}', try again.`,
        });
      }

      // If the column exists (because it has a count), but it's > 1 then report it as a duplicate
      if (count > 1) {
        return Result.err({
          code: "duplicate_column",
          message: `Duplicate '${column}' column found, please provide a csv with only one of each required column.`,
        });
      }
    }

    return Result.ok(cleanedColumns);
  }

  function validatedParse(
    csv: string,
    options: ParserOptions
  ): Result<Row<Record<string, string>>[], CSVParsingError> {
    const rawParsedCSV = rawParseGenerator(csv);
    const { columnSchema } = options;
    const requiredColumns = Object.keys(columnSchema.shape);

    // First yield from rawParsedCSV Generator should be row of column headers
    const columns = validateColumns(
      rawParsedCSV.next().value as ParsedRow,
      requiredColumns || []
    );

    // If any issues with columns then return errors
    if (columns.isErr) {
      return Result.err(columns.error);
    }

    const validatedRows: Row<Record<string, string>>[] = [];
    const validatedColumns = columns.value;

    for (const parsedRow of rawParsedCSV) {
      const row = toObject(parsedRow, validatedColumns);
      const validatedRow = columnSchema.safeParse(row);

      if (validatedRow.success) {
        validatedRows.push(validatedRow.data);
      } else {
        validatedRows.push(Object.assign(row, { errors: validatedRow.error }));
      }
    }

    return Result.ok(validatedRows);
  }

  function parse(
    csv: string,
    options?: ParserOptions
  ): Result<ParsedRow[] | Row<Record<string, string>>[], CSVParsingError> {
    // For undefined or null input, report no_input error
    if (!csv) {
      return Result.err({
        code: "no_input",
        message: "Upload a csv to get started",
      });
    }

    // If the string is empty, report empty_csv error
    if (csv.length === 0) {
      return Result.err({
        code: "empty_csv",
        message: "Provided .csv file was empty, try again.",
      });
    }

    if (options) {
      return validatedParse(csv, options);
    }

    return Result.ok(rawParse(csv));
  }

  return { parse };
})();
