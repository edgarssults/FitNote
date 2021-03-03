/**
 * Gets JSON from an MS Graph API endpoint.
 * @param endpoint API endpoint.
 * @param token API token.
 * @param callback Callback function.
 */
export function getGraphJson(endpoint: string, token: string): Promise<any> {
  const headers = new Headers({
    "Authorization": `Bearer ${token}`
  });

  const options = {
      method: "GET",
      headers: headers
  };
  
  return fetch(endpoint, options).then(response => response.json())
}

/**
 * Gets text from an MS Graph API endpoint.
 * @param endpoint API endpoint.
 * @param token API token.
 * @param callback Callback function.
 */
export function getGraphText(endpoint: string, token: string): Promise<any> {
  const headers = new Headers({
    'Authorization': `Bearer ${token}`
  });

  const options = {
      method: 'GET',
      headers: headers
  };
  
  return fetch(endpoint, options).then(response => response.text())
}
