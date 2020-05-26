import { settingsStorage } from "settings";
import { getNotes } from "./notes";

/**
 * Gets the OAuth token from settings.
 */
export function getOAuthToken(): string | null {
  // Get the OAuth setting
  let oauthSetting = settingsStorage.getItem('oauth');
  if (!oauthSetting) {
    console.error('Could not find oauth setting!');
    return null;
  }

  // Parse setting to get the token
  let oauth = JSON.parse(oauthSetting);
  let token = oauth.access_token;

  return token;
}

/**
 * Sets the token expiry time in settings.
 */
export function setExpiry() {
  // Get the OAuth setting
  let oauthSetting = settingsStorage.getItem('oauth');
  if (!oauthSetting) {
    console.error('Could not find oauth setting!');
    return;
  }

  // Parse setting to get the expiry time (seconds)
  let oauth = JSON.parse(oauthSetting);
  let lifeSeconds = oauth.expires_in;

  // Calculate expiry time (milliseconds since January 1, 1970 00:00:00 UTC)
  let expiryDate = Date.now() + (lifeSeconds * 1000);

  settingsStorage.setItem('oauthExpires', expiryDate.toString());
}

/**
 * Refreshes the MS Graph API access token.
 */
export function refreshAccessToken() {
  settingsStorage.removeItem('refreshAccessToken');

  let oauthSetting = settingsStorage.getItem('oauth');
  if (!oauthSetting) {
    console.error('Could not find oauth setting!');
    return;
  }
  let oauth = JSON.parse(oauthSetting);

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

  fetch('https://login.microsoftonline.com/consumers/oauth2/v2.0/token', options)
    .then(response => response.json())
    .then(response => {
      settingsStorage.setItem('oauth', JSON.stringify(response));
      setExpiry();
      getNotes();
    })
    .catch(error => console.error(error.message));
}
