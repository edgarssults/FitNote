/**
 * Gets JSON from an MS Graph API endpoint.
 * @param endpoint API endpoint.
 * @param token API token.
 * @param callback Callback function.
 */
export function getGraphJson(endpoint: string, token: string, callback: (data: any, endpoint: string) => void): void {
  // TODO: No callback

  const headers = new Headers({
    "Authorization": `Bearer ${token}`
  });

  const options = {
      method: "GET",
      headers: headers
  };
  
  fetch(endpoint, options)
    .then(response => response.json())
    .then(response => callback(response, endpoint))
    .catch(error => console.error(error.message));
}

/**
 * Gets text from an MS Graph API endpoint.
 * @param endpoint API endpoint.
 * @param token API token.
 * @param callback Callback function.
 */
export function getGraphText(endpoint: string, token: string, callback: (data: string, endpoint: string) => void): void {
  // TODO: No callback

  const headers = new Headers({
    'Authorization': `Bearer ${token}`
  });

  const options = {
      method: 'GET',
      headers: headers
  };
  
  fetch(endpoint, options)
    .then(response => response.text())
    .then(response => callback(response, endpoint))
    .catch(error => console.error(error.message));
}
