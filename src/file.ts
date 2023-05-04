import { Result } from "true-myth";

type FileReadError = {
  code: "unable_to_read_file";
  message: string;
};

function fileToString(file: File | Blob): Result<Promise<string>, FileReadError> {
  return Result.ok(
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () =>
        reject(
          Result.err({
            code: "file_read",
            message: `File was not found or was unreadable.`,
          })
        );
      reader.readAsText(file);
    })
  );
}

export { fileToString };
