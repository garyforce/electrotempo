const uploadFileParts = async (
  completeUploadUrl,
  file,
  chunkSize,
  partUrls,
  filename,
  uploadId,
  apiToken
) => {
  const partPromises = [];

  for (let i = 0; i < partUrls.length; i++) {
    const start = i * chunkSize;
    const end = (i + 1) * chunkSize;
    const blob =
      i < partUrls.length ? file.slice(start, end) : file.slice(start);

    partPromises.push(
      fetch(partUrls[i], {
        method: "PUT",
        body: blob,
      })
    );
  }
  let resParts;
  try {
    resParts = await Promise.all(partPromises);
  } catch (error) {
    Promise.reject(error);
  }

  // construct the JSON object to send to completeUpload endpoint
  let parts = [];
  for (let i = 0; i < resParts.length; i++) {
    parts.push({
      ETag: JSON.parse(resParts[i].headers.get("ETag")),
      PartNumber: i + 1,
    });
  }
  let completeUploadResponse;
  try {
    completeUploadResponse = await fetch(completeUploadUrl, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        filename: filename,
        parts: parts,
        uploadId: uploadId,
      }),
    });
  } catch (error) {
    return Promise.reject(error);
  }
  if (completeUploadResponse.ok) {
    return Promise.resolve(completeUploadResponse);
  } else {
    return Promise.reject(completeUploadResponse);
  }
};

export const uploadFile = async (
  initializeUploadUrl,
  completeUploadUrl,
  file,
  apiToken
) => {
  /* Initialize upload with AWS */
  const FILE_CHUNK_SIZE = 1_000_000_000;
  const getNumParts = (file, chunkSize) =>
    Math.floor(file.size / chunkSize) + 1;
  let queryStringParams = new URLSearchParams({
    fileParts: getNumParts(file, FILE_CHUNK_SIZE),
  });
  const getUploadEndpointURL = `${initializeUploadUrl}?${queryStringParams}`;
  let initializeUploadResponse;
  try {
    initializeUploadResponse = await fetch(getUploadEndpointURL, {
      mode: "cors",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });
    if (!initializeUploadResponse.ok) {
      return;
    }
  } catch (error) {
    return;
  }
  let { urls, filename, uploadId } = await initializeUploadResponse.json();

  /* UPLOAD EACH PART */
  try {
    await uploadFileParts(
      completeUploadUrl,
      file,
      FILE_CHUNK_SIZE,
      urls,
      filename,
      uploadId,
      apiToken
    );
    return filename;
  } catch (error) {
    console.error(error);
    return;
  }
};
