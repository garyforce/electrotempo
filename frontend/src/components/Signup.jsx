import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Typography,
  Box,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  OutlinedInput,
  Divider,
  FormHelperText,
  Select,
  MenuItem,
  Skeleton,
  AlertTitle,
} from "@mui/material";

import { LoadingButton } from "@mui/lab";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import auth0 from "auth0-js";

import ElectroTempoLogo from "images/electrotempo-logo-color-stacked.svg";
import SecoLogo from "images/seco-logo.png";
import TtiLogo from "images/tti-logo.jpg";

export default function Signup(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [errorLoadingLocations, setErrorLoadingLocations] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(undefined);

  useEffect(() => {
    const loadLocations = async () => {
      setLoadingLocations(true);
      try {
        const locationResponse = await fetch(
          `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/locations?evInsitesEnabled=true`
        );
        if (locationResponse.ok) {
          const locationsData = await locationResponse.json();
          const evInsitesLocations = locationsData.filter(
            (locations) => locations.ev_insites_enabled
          );
          if (evInsitesLocations.length === 0) {
            // 0 locations is a data error.
            setErrorLoadingLocations(true);
          }
          setLocations(evInsitesLocations);
        } else {
          setErrorLoadingLocations(true);
        }
      } catch (err) {
        console.error(err.stack);
        setErrorLoadingLocations(true);
      }
      setLoadingLocations(false);
    };
    loadLocations();

    // disable warnings on next line because we intentionally only want this called once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowVerifyPassword = () => {
    setShowVerifyPassword(!showVerifyPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSignupButtonClick = async () => {
    setError(false);
    setLoading(true);
    const response = await fetch(
      `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/seco-users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          location: selectedLocation.name,
        }),
      }
    );
    const data = await response.json();
    if (response.ok) {
      let webAuth = new auth0.WebAuth({
        domain: process.env.REACT_APP_AUTH0_DOMAIN,
        clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
        responseType: "token",
        redirectUri: process.env.REACT_APP_HOME_URL,
      });
      webAuth.login({
        realm:
          process.env.REACT_APP_AUTH0_REALM ||
          "Username-Password-Authentication",
        email: email,
        password: password,
      });
    } else {
      setErrorMessage(data.message);
      setError(true);
      setLoading(false);
    }
  };

  const passwordsMatch = password === verifyPassword;
  const passwordsMatchHelperText = passwordsMatch
    ? ""
    : "Passwords do not match.";

  const valid =
    email.length > 0 &&
    password.length > 0 &&
    passwordsMatch &&
    selectedLocation !== undefined;

  return (
    <Box
      sx={{
        display: "grid",
        placeItems: "center",
        backgroundColor: "black",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <Box
        sx={{
          width: "400px",
          backgroundColor: "white",
          borderRadius: "5px",
          padding: "1em",
          margin: "3em",
          boxSizing: "border-box",
        }}
      >
        <Stack spacing={2} alignItems={"center"}>
          <Box
            component="img"
            src={SecoLogo}
            sx={{
              maxHeight: "120px",
              objectFit: "contain",
            }}
          />
          <Stack
            direction="row"
            justifyContent={"space-around"}
            alignItems={"center"}
            sx={{
              width: "100%",
            }}
          >
            <Box
              component="img"
              src={TtiLogo}
              sx={{
                maxHeight: "80px",
                objectFit: "contain",
              }}
            />
            <Box
              component="img"
              src={ElectroTempoLogo}
              sx={{
                maxHeight: "80px",
                objectFit: "contain",
              }}
            />
          </Stack>
          <Divider width={"80%"} />
          <Typography textAlign={"center"}>
            Sign up to view the SECO Electric Fleet Site Evaluation Dashboard
          </Typography>
          <Link to={"/"}>
            <Typography>Already have an account?</Typography>
          </Link>
          {errorLoadingLocations ? (
            <Alert severity="error">
              <AlertTitle>Signups Unavailable</AlertTitle>New signups are
              currently unavailable. Please try again later.
            </Alert>
          ) : (
            <Stack spacing={2} sx={{ width: "100%" }}>
              {loadingLocations ? (
                <>
                  <Skeleton variant="rounded" height={56} />
                  <Skeleton variant="rounded" height={56} />
                  <Skeleton variant="rounded" height={56} />
                  <Skeleton variant="rounded" height={56} />
                </>
              ) : (
                <>
                  <FormControl>
                    <InputLabel id="location-select-label">Location</InputLabel>
                    <Select
                      labelId="location-select-label"
                      id="location-select"
                      value={selectedLocation}
                      label="Location"
                      onChange={handleLocationChange}
                    >
                      {locations.map((location) => {
                        return (
                          <MenuItem key={location.name} value={location}>
                            {location.name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Email address"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  <FormControl variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-password">
                      Password
                    </InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="Password"
                    />
                  </FormControl>
                  <FormControl variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-password">
                      Verify Password
                    </InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-password"
                      type={showVerifyPassword ? "text" : "password"}
                      value={verifyPassword}
                      onChange={(event) =>
                        setVerifyPassword(event.target.value)
                      }
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowVerifyPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showVerifyPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="Verify Password"
                      error={!passwordsMatch}
                    />
                    <FormHelperText error>
                      {passwordsMatchHelperText}
                    </FormHelperText>
                  </FormControl>
                </>
              )}
              {error && <Alert severity="error">{errorMessage}</Alert>}
              <LoadingButton
                variant="contained"
                onClick={handleSignupButtonClick}
                disabled={!valid}
                loading={loading}
              >
                Sign up
              </LoadingButton>
            </Stack>
          )}
          <Stack spacing={2}>
            <Typography variant={"subtitle2"}>
              Need help? Contact{" "}
              <a href="mailto:helpdesk@electrotempo.com">
                helpdesk@electrotempo.com
              </a>
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
