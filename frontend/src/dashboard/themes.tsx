import { createTheme } from "@mui/material/styles";
import type {} from "@mui/lab/themeAugmentation";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    controlTitle: React.CSSProperties;
    inlineCode: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    controlTitle?: React.CSSProperties;
    inlineCode?: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    controlTitle: true;
    inlineCode: true;
  }
}

const electrotempoTheme = createTheme({
  palette: {
    primary: {
      main: "#05C2CC",
    },
    secondary: {
      main: "#FDBE02",
    },
    info: {
      main: "#05C2CC",
    },
  },
  typography: {
    fontFamily: ["Poppins", "Roboto", "sans-serif"].join(","),
    h1: {
      fontSize: "2rem",
      fontWeight: "500",
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: "500",
    },
    h3: {
      fontSize: "1.2rem",
      fontWeight: "500",
    },
    h4: {
      fontSize: "1.1rem",
    },
    controlTitle: {
      fontSize: "1.5rem",
      fontFamily: "Poppins",
      fontWeight: "500",
    },
    inlineCode: {
      fontFamily: "monospace",
      backgroundColor: "#eee",
      padding: "0.2em",
      marginLeft: "0.2em",
      marginRight: "0.2em",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          // required because it is black text otherwise
          color: "white",
        },
      },
    },
    MuiTabPanel: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#EEE",
        },
      },
    },
  },
});

export default electrotempoTheme;
