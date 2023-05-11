import type { ZodError, ZodSchema } from "zod";

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

export type Column = string;

export type Row<T> = T & {
  errors?: ZodError;
};

export type ParserOptions = {
  requiredColumns?: Column[] | null;
  columnSchema: ZodSchema;
  validate?: boolean;
};
