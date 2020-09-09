import { settingsStorage } from "settings";

/**
 * Gets the OAuth data from settings.
 */
function GetOAuthData(): any {
  let oauthSetting = settingsStorage.getItem('oauth');
  if (!oauthSetting) {
    console.error('Could not find oauth setting!');
    return null;
  }

  let oauth = JSON.parse(oauthSetting);
  return oauth;
}

/**
 * Gets the OAuth token from settings.
 */
export function getOAuthToken(): string | null {
  let oauth = GetOAuthData();
  return oauth.access_token;
}

/**
 * Sets the token expiry time in settings.
 */
export function setExpiry(): void {
  let oauth = GetOAuthData();
  let lifeSeconds = oauth.expires_in;

  // Calculate expiry time (milliseconds since January 1, 1970 00:00:00 UTC)
  let expiryDate = Date.now() + (lifeSeconds * 1000);

  settingsStorage.setItem('oauthExpires', expiryDate.toString());
}

/**
 * Refreshes the MS Graph API access token.
 */
export function refreshAccessToken(): Promise<void> {
  settingsStorage.removeItem('refreshAccessToken');

  let oauth = GetOAuthData();

  const headers = new Headers({
    'Content-Type': 'application/x-www-form-urlencoded'
  });
  const options = {
      method: 'POST',
      headers: headers,
      body: `client_id=98d88e94-97a8-42dc-a692-cdcb8f79a9f3
      &scope=${encodeURI(oauth.scope)}%20offline_access
      &refresh_token=${oauth.refresh_token}
      &redirect_uri=${encodeURI('https://app-settings.fitbitdevelopercontent.com/simple-redirect.html')}
      &grant_type=refresh_token`
  };

  return fetch('https://login.microsoftonline.com/consumers/oauth2/v2.0/token', options)
    .then(response => response.json())
    .then(response => {
      settingsStorage.setItem('oauth', JSON.stringify(response));
      setExpiry();
    })
    .catch(error => console.error(error.message));
}
