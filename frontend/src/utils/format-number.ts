// Function to format numbers with commas in US format and remove decimals for larger numbers
export function formatNumber(number: number | null): string {
  if (number === undefined || number === null) {
    return ""; // Handle undefined or null values gracefully
  }

  const formattedNumber = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: number >= 1000 ? 0 : 2, // Remove decimals for larger numbers
  }).format(number);

  return formattedNumber;
}
