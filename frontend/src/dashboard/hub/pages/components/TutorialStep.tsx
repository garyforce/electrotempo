import { Box, Button, Divider, Stack, Typography } from "@mui/material";

export const tourSteps = [
  {
    selector: "#map",
    content: (
      <Typography>
        The Hubs landing page shows a portfolio view of all sites being
        assessed.​
      </Typography>
    ),
  },
  {
    selector: ".coverage-legend",
    content: (
      <Typography>
        The sites are color-coded to visually identify the volume of traffic
        around a site.
      </Typography>
    ),
  },
  {
    selector: ".sites-table",
    content: (
      <Typography>
        The sites are listed here along with a drop-down list of EV adoption
        scenarios created for the site and actions for the scenarios, such as
        add, edit or delete.​
      </Typography>
    ),
  },
  {
    selector: ".actions",
    content: (
      <Typography>
        Actions: Create new EV adoption scenario, edit existing scenario, or
        delete existing scenario. Both create and edit options will take you
        into the site-level view.​
      </Typography>
    ),
  },
  {
    selector: ".download-data-button",
    content: (
      <Typography>
        The download button allows you to download portfolio and scenario level
        information.​
      </Typography>
    ),
  },
  {
    selector: ".leaflet-interactive",
    content: (
      <Typography>
        You can enter a site either through the create or edit buttons on the
        left-hand site, or by clicking on a site via the map view. ​
      </Typography>
    ),
  },
  {
    selector: ".hub-scenario-page",
    content: <Typography>This is the site level landing page.</Typography>,
  },
  {
    selector: ".senario-left-pane",
    content: (
      <Typography>
        The left pane has scenario and site level controls that can be directly
        input or changed by the user.​
      </Typography>
    ),
  },
  {
    selector: ".scenario-parameters-box",
    content: (
      <Typography>
        The scenario parameters show the site name and the EV adoption scenario.
        Other scenarios can be selected in the drop-down menu.​​
      </Typography>
    ),
  },
  {
    selector: ".site-parameters-box",
    content: (
      <Typography>
        The site parameters show the selected year for analysis, an option to
        split between trucks-tractor trailer traffic, an option to split between
        subscription and public access chargers.​​
      </Typography>
    ),
  },
  {
    selector: ".advanced-setting-link",
    content: (
      <Typography>
        Advanced settings here allow the user to change capture rates for public
        and subscription traffic and the utility supply for the year.​​
      </Typography>
    ),
  },
  {
    selector: ".utility-parameters-box",
    content: (
      <Typography>
        The site parameters also allow charger cost variation, installation cost
        override, and input for usable site area (if different from total site
        area). Utility information is shown below the controls.​​​
      </Typography>
    ),
  },
  {
    selector: ".update-button",
    content: (
      <Typography>
        ​The update button must be clicked for the changes to reflect in the
        charts and calculations.​​
      </Typography>
    ),
  },
  {
    selector: ".scenario-download-button",
    content: (
      <Typography>
        The download button downloads site-level information for the selected
        scenario. This includes arrival data, hourly energy consumption, and
        financial metrics.​​​
      </Typography>
    ),
  },
  {
    selector: ".arrivals-tab",
    content: (
      <Typography>
        The Arrivals tab shows the EV arrival patterns for Trucks and
        Tractor-trailers, broken down by the user-input public and subscription
        %.​​
      </Typography>
    ),
  },
  {
    selector: ".energy-tab",
    content: (
      <Typography>
        The Energy tab calculates the energy required by vehicles from the
        arrivals tab and calculates both energy and power demand curves. The
        utility constraint input under the Advanced Setting is also shown here
        to indicate where an upgrade by the utility may be required.​​​
      </Typography>
    ),
  },
  {
    selector: ".chargers-tab",
    content: (
      <Typography>
        The Chargers tab assigns chargers based on energy demand curves and the
        charger split from the left pane (truck/trailer and
        public/subscription). This is a visual representation of the subsequent
        utilization from those inputs and calculation.​
      </Typography>
    ),
  },
  {
    selector: ".charger-information",
    content: (
      <Typography>
        Summary information is provided in textual form below the charts.​​
      </Typography>
    ),
  },
  {
    selector: ".financial-tab",
    content: (
      <Typography>
        The Financial tab provides capital expenses (capex) and operational
        expenses (opex) for the charger installation recommended by the previous
        inputs.​​
      </Typography>
    ),
  },
];
