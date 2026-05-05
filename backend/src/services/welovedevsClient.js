const DEFAULT_API_URL = 'https://epi-api.welovedevs.com';

// Call the WeLoveDevs API and return the raw JSON response.
// The API key must stay in the .env file, never in the code.
async function fetchWeLoveDevsJobs({ page = 0, q = '', size = 20 } = {}) {
  // Read the key from environment variables.
  const apiKey = process.env.WELOVEDEVS_API_KEY;

  // Without the key, the external API will refuse the request.
  if (!apiKey) {
    const error = new Error('WELOVEDEVS_API_KEY is missing.');
    error.statusCode = 500;
    throw error;
  }

  // Use the default API URL, unless another URL is defined in .env.
  const baseUrl = process.env.WELOVEDEVS_API_URL || DEFAULT_API_URL;

  // Build the final URL: https://epi-api.welovedevs.com/v1
  const url = new URL('/v1', baseUrl);

  // WeLoveDevs accepts page, size and q as query parameters.
  url.searchParams.set('page', Number(page) >= 0 ? String(Number(page)) : '0');

  // We keep size between 1 and 100 because the API documentation says max is 100.
  url.searchParams.set('size', Math.min(Math.max(Number(size) || 20, 1), 100).toString());

  // q is optional. It is used to search offers by keyword.
  if (q) {
    url.searchParams.set('q', q);
  }

  // X-API-Key is required by WeLoveDevs.
  const response = await fetch(url, {
    headers: {
      'Accept':    'application/json',
      'X-API-Key': apiKey,
    },
  });

  // We convert external API errors to errors our backend can handle.
  if (!response.ok) {
    const error = new Error(`WeLoveDevs API returned ${response.status}.`);

    // 429 means rate limit. Other API errors are treated as bad gateway.
    error.statusCode = response.status === 429 ? 429 : 502;
    throw error;
  }

  // Return the JSON exactly as WeLoveDevs sends it.
  return response.json();
}

module.exports = { fetchWeLoveDevsJobs };
