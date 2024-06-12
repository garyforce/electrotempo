export function sortNumberArray(array) {
  return array.sort((a, b) => a - b);
}

/**
 *
 * @param {number} start An integer number specifying at which position to start. Default is 0.
 * @param {number} stop An integer number specifying at which position to stop (not included).
 * @returns a list of numbers, starting from 0 by default, increments by 1, and stops before a specified number.
 */
export function range(start = 0, stop, step = 1) {
  let array = [];
  for (let i = start; i < stop; i += step) {
    array.push(i);
  }
  return array;
}
