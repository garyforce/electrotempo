export const loadBlockGroups = async (
  trafficModelId,
  apiToken,
  location = ""
) => {
  const response = await fetch(
    `${process.env.REACT_APP_API_HOST}:${
      process.env.REACT_APP_API_PORT
    }/block-groups?${new URLSearchParams({
      trafficModelId,
      location,
    })}`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );
  if (response.ok) {
    const blockGroupFeatureGroup = await response.json();
    return blockGroupFeatureGroup;
  } else {
    return Promise.reject(new Error(response));
  }
};
