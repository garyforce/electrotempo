import { Typography } from "@mui/material";

export const terminalTourSteps = [
  {
    selector: "#map",
    content: (
      <Typography>
        The Terminal landing page shows a portfolio view of all terminals being
        assessed.​
      </Typography>
    ),
  },
  {
    selector: ".sites-table",
    content: (
      <Typography>
        {`The sites are listed here along with a drop-down list of cost centers 
        and configurations created for the site\<>cost center combination. Clicking 
        on the "view configuration" button takes you to the configuration level view.`}
      </Typography>
    ),
  },
  {
    selector: ".download-data-button",
    content: (
      <Typography>
        Configuration data can be downloaded here based on the selected
        terminals, cost centers, and configurations.
      </Typography>
    ),
  },
  {
    selector: ".actions",
    content: (
      <Typography>
        There are three actions available: adding a new configuration, viewing
        an existing configuration, and deleting an existing configuration.
      </Typography>
    ),
  },
  {
    selector: ".add-new-configuration-dialog",
    content: (
      <Typography>
        When you add a new configuration, a popup appears that asks you to input
        shift and vehicle information to provide optimized recommendations for
        electrification.
      </Typography>
    ),
  },
  {
    selector: ".planning-horizon",
    content: (
      <Typography>
        The planning horizon allows us to consider vehicle replacement, battery
        replacement, and NPV for financials.
      </Typography>
    ),
  },
  {
    selector: ".shift-information",
    content: (
      <Typography>
        Shift information is used to understand work requirements and hours of
        day the vehicles are needed to ensure we account for energy
        optimization.
      </Typography>
    ),
  },
  {
    selector: ".vehicle-information",
    content: (
      <Typography>
        Vehicle information helps us recommend appropriate EV models and fleet
        size needed to meet work demand.
      </Typography>
    ),
  },
  {
    selector: ".submit-button",
    content: (
      <Typography>
        Once you have entered all the required inputs, click the "submit"
        button. That will tell the system to begin the optimization.
      </Typography>
    ),
  },
  {
    selector: ".terminal-list-table",
    content: (
      <Typography>
        Your optimization will take up to 15 minutes to run. During this time,
        your named configuration will be viewable (but not selectable) in the
        dropdown.
      </Typography>
    ),
  },
  {
    selector: ".view-action",
    content: (
      <Typography>
        Clicking the "view" button will take you to the configuration level
        view.
      </Typography>
    ),
  },
  {
    selector: ".terminal-page",
    content: (
      <Typography>
        This is the configuration level view. The Parameters tab will show you
        the inputs of the configuration as you were creating it. There are
        dropdowns in the left pane to switch between configurations and utility
        rates. The assupmtions we have made are also displayed on the bottom
        right.
      </Typography>
    ),
  },
  {
    selector: ".parameters-tab",
    content: (
      <Typography>
        The parameters tab helps you understand configuration inputs and model
        assumptions.
      </Typography>
    ),
  },
  {
    selector: ".download-button",
    content: (
      <Typography>
        The configuration download button allows you to download data for only
        this specific configuration.
      </Typography>
    ),
  },
  {
    selector: ".financial-tab",
    content: (
      <Typography>
        The financial tab displays the capital and operating expenses for the
        selected configuration. It also provides controls to adjust the
        financial model.
      </Typography>
    ),
  },
  {
    selector: ".cost-comparison-table",
    content: (
      <Typography>
        The data in the bar chart is also presented in a tabular format on this
        page.
      </Typography>
    ),
  },
  {
    selector: ".download-button",
    content: (
      <Typography>
        The financial data can be downloaded separately from the configuration
        data. The downloaded file contains the data depicted on the page, and
        more.
      </Typography>
    ),
  },
  {
    selector: ".equipment-tab",
    content: (
      <Typography>
        The equipment tab displays the specs and count of the recommended
        equipment for the selected configuration.
      </Typography>
    ),
  },
  {
    selector: ".energy-tab",
    content: (
      <Typography>
        The energy tab displays the energy demand and power demand curves. It
        also displays a vehicle usage chart, which reflects the optimized
        scheduling we recommend for the lowest TCO.
      </Typography>
    ),
  },
];
