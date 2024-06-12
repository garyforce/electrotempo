export async function getSalesData(apiToken: string, locationId: string) {
  const response = await fetch(
    `${process.env.REACT_APP_API_HOST}:${
      process.env.REACT_APP_API_PORT
    }/sales-data?${new URLSearchParams({
      locationId,
    })}`,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    return Promise.reject(new Error("Failed to fetch sales data."));
  }
}
