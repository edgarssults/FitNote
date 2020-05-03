import { settingsStorage } from "settings";

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
 * 
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
