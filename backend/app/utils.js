/**
 * Returns the database charging strategy ID given a charging strategy. Strategy
 * names are not 1:1 with database, but rather represent the front-end string.
 * @param {string} chargingStrategy the name of the charging strategy. Not case
 * sensitive.
 * @returns {number} the ID of the charging strategy
 */
exports.getChargingStrategyIdFromName = (chargingStrategy) => {
  switch (chargingStrategy.toUpperCase()) {
    case "PUBLIC":
      return 1;
    case "HOME":
      return 2;
    case "OFFICE":
      return 3;
    default:
      return -1;
  }
};

exports.arrayToSqlList = (array) => {
  let sqlList = "(";
  array.forEach((item) => (sqlList += item + ","));
  if (array.length > 0) {
    sqlList = sqlList.substring(0, sqlList.length - 1); // cut off last comma
  }
  sqlList += ")";
  return sqlList;
};

/**
 * Converts a string to camelCase.
 * @param {string} str the input string to camelize
 * @returns the camelCase version of the string
 */
exports.camelize = (str) => {
  return str.replace(/^([A-Z])|[\s-_](\w)/g, function (match, p1, p2, offset) {
    if (p2) return p2.toUpperCase();
    return p1.toLowerCase();
  });
};

/**
 * Returns a boolean if the provided strings are case-insensitively equal.
 * @param {string} a the first string to compare
 * @param {string} b the second string to compare
 * @returns true if the two strings are case-insensitively equal, based on
 * accent sensitivity
 */
exports.caseInsensitiveEquals = (a, b) => {
  return typeof a === "string" && typeof b === "string"
    ? a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0
    : a === b;
};

/**
 * Flattens a multiline template literal into a single string, removing duplicated spaces due to indentation.
 *
 * @param {string} templateString - The multiline template literal to flatten.
 * @returns {string} The flattened single string.
 */
exports.flattenTemplateString = (templateString) => {
  return templateString.replace(/\s+/g, " ").trim();
};
