/*
I want to be able to build a schema with zod and have the csv parser use it


*/

export type ParsedRow = string[];

// CSV Parsing Errors

type DuplicateRequiredColumn = {
  code: "duplicate_column";
  message: string;
};

type MissingRequiredColumn = {
  code: "missing_required_col";
  message: string;
};

type EmptyInput = {
  code: "empty_csv";
  message: string;
};

type NoInput = {
  code: "no_input";
  message: string;
};

export type CSVParsingError =
  | DuplicateRequiredColumn
  | MissingRequiredColumn
  | EmptyInput
  | NoInput;
