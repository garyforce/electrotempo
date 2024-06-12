/**
 * Returns the given string with the first character uppercased.
 * @param {string} word
 * @returns the given string with the first character uppercased.
 */
export function upperCaseFirstLetter(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Returns a string enclosed by another string
 * @param {string} str a string to enclose
 * @param {string} encloser the enclosing string
 * @returns the original string enclosed in the enclosing string
 */
export function enclose(str, encloser) {
  return `"${str}"`;
}
