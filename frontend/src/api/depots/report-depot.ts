export async function sendMissingDepotReport(token: string, info: any) {
  const url = `${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}/depots/report`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(info),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message);
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }
  return data;
}
