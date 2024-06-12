export const convertToTimeString = (num: number): string => {
  // Determine the hour
  const hour = num % 12 === 0 ? 12 : num % 12;

  // Determine the period (am or pm)
  const period = num < 12 ? "am" : "pm";

  // Return the formatted time string
  return `${hour}${period}`;
};
