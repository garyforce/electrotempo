import FileSaver from "file-saver";
import { enclose } from "./string";

/**
 * Creates and downloads a CSV file from a list of objects.
 * @param data a list of objects of the same type.
 * @param filename the name of the file to save.
 */
export function downloadCsv(data: any[], filename: string) {
  const keys = Object.keys(data[0]);
  let csvData = "";
  keys.forEach((key) => (csvData += `${key},`));
  csvData += "\n";
  data.forEach((datum) => {
    keys.forEach((key) => {
      let value = String(datum[key]);
      if (value.includes(",")) {
        value = enclose(value, '"');
      }
      csvData += `${value},`;
    });
    csvData += "\n";
  });
  const blob = new Blob([csvData], { type: "application/csv;charset=utf-8;" });
  FileSaver.saveAs(blob, filename);
}

export function objectToCsv(data: any): string {
  const keys = Object.keys(data);
  let csvData = "";
  keys.forEach((key) => (csvData += `${key},`));
  csvData += "\n";
  keys.forEach((key) => {
    let value = data[key];
    if (typeof value === "string" && value.includes(",")) {
      value = enclose(value, '"');
    }
    csvData += `${value},`;
  });
  return csvData;
}

export function arrayToCsv(data: any[]): string {
  const keys = Object.keys(data[0]);
  let csvData = "";
  keys.forEach((key) => (csvData += `${key},`));
  csvData += "\n";
  data.forEach((datum) => {
    keys.forEach((key) => {
      let value = String(datum[key]);
      if (value.includes(",")) {
        value = enclose(value, '"');
      }
      csvData += `${value},`;
    });
    csvData += "\n";
  });
  return csvData;
}

export function downloadFile(data: string, filename: string) {
  let formattedData = data;
  // TODO: This line replaces numeric values in the string with formatted ones, causing column shifting in the CSV.
  // formattedData = data.replace(
  //   /(\b\d+(\.\d+)?\b)(?=(,| ,|\n| \n))/g,
  //   (match) => {
  //     if (match.length > 3) {
  //       return `"${Number(match).toLocaleString()}"`;
  //     }
  //     return match;
  //   }
  // );
  formattedData = formattedData.replace(/\$2,02(\d{1})/g, "202$1");
  formattedData = formattedData.replace(/\"\$\d\"(?=,| ,| \n|\n)/g, (match) =>
    match.replace("$", "")
  );
  const blob = new Blob([formattedData], {
    type: "application/csv;charset=utf-8;",
  });
  FileSaver.saveAs(blob, filename);
}
/**
 * Converts the given string to one that is safe to use as a filename.
 * `%` will be replaced with `pct`, and
 * all othre characters except `.` and `-` will be replaced with `_`.
 * @param text the text to convert to a file name
 * @returns the original string in all lowercase with every character that isn't
 * alphanumeric, a hyphen, or an underscore, replaced with an underscore.
 */
export function createSafeFilename(text: string) {
  text = text.replace(/%/g, "pct");
  return text.replace(/[^a-z0-9_\-.]/gi, "_");
}
