async function getData(endpoint, options, url, headers = {}, type) {
  const searchParams = new URLSearchParams(options);
  try {
    const response = await fetch(endpoint + searchParams, { headers, type });
    if (!response.ok) {
      throw new Error(response.status, url);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
}

export default getData;
