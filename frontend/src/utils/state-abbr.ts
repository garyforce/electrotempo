export const getStateAbbrFromStateName = (stateName: string) => {
  switch (stateName) {
    case "New York":
      return "NY";
    case "Massachusetts":
      return "MA";
    case "TxPPC":
      return "TX";
    case "CPS":
      return "CPS";
    case "NBU":
      return "NBU";
    case "LCRA":
      return "LCRA";
    case "Austin Energy":
      return "AE";
    case "First Energy":
      return "FIRST_ENERGY";
    default:
      // NGRID only requires two states.
      // This will have the API request a non-existent state
      return "N/A";
  }
};
