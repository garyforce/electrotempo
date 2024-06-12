export const loadFeederLineDemand = async (
  apiToken: string,
  feederLineId?: string,
  stateAbbr?: string,
  year?: number,
  hour?: number
) => {
  const urlParams = new URLSearchParams();

  if (stateAbbr !== undefined) {
    urlParams.append("state", stateAbbr);
  }

  if (feederLineId !== undefined) {
    urlParams.append("feederLineId", feederLineId);
  }

  if (year !== undefined) {
    urlParams.append("year", year.toString());
  }

  if (hour !== undefined) {
    urlParams.append("hour", hour.toString());
  }

  const response = await fetch(
    `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/feeder-line-demand?${urlParams}`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    return Promise.reject(new Error("Failed to fetch feeder line demand."));
  }
};
