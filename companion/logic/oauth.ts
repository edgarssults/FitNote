import { settingsStorage } from "settings";
import { logError } from "./errors";

const scope = 'openid profile User.Read Notes.Read Notes.Read.All offline_access';
let previousCode: string = "EMPTY";

/**
 * Gets the OAuth token from settings.
 */
export function getOAuthToken(): string | null {
  let oauth = getOAuthData();
  return oauth.access_token;
}

/**
 * Sets the token expiry time in settings.
 */
export function setExpiry(): void {
  let oauth = getOAuthData();
  let lifeSeconds = oauth.expires_in;

  // Calculate expiry time (milliseconds since January 1, 1970 00:00:00 UTC)
  let expiryDate = Date.now() + (lifeSeconds * 1000);

  settingsStorage.setItem('oauthExpires', expiryDate.toString());
}

/**
 * Gets the initial MS Graph API access token.
 */
export function getAccessToken(): Promise<void> {
  let oauth = getOAuthResponseData();
  settingsStorage.removeItem('oauth-response');

  const options = {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
      body: `client_id=98d88e94-97a8-42dc-a692-cdcb8f79a9f3
      &scope=${encodeURI(scope)}
      &redirect_uri=${encodeURI('https://app-settings.fitbitdevelopercontent.com/simple-redirect.html')}
      &grant_type=authorization_code
      &state=${oauth.state}
      &code=${oauth.code}`
  };

  return fetch('https://login.microsoftonline.com/consumers/oauth2/v2.0/token', options)
    .then(response => response.json())
    .then(response => {
      if (response.error) {
        throw new Error(response.error.message);
      }

      // Have to keep code in a local variable in case of settings reset
      previousCode = oauth.code;
      settingsStorage.setItem('oauth', JSON.stringify(response));
    })
}

/**
 * Refreshes the MS Graph API access token.
 */
export function refreshAccessToken(): Promise<void> {
  let oauth = getOAuthData();

  const options = {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
      body: `client_id=98d88e94-97a8-42dc-a692-cdcb8f79a9f3
      &scope=${encodeURI(scope)}
      &refresh_token=${oauth.refresh_token}
      &redirect_uri=${encodeURI('https://app-settings.fitbitdevelopercontent.com/simple-redirect.html')}
      &grant_type=refresh_token`
  };

  return fetch('https://login.microsoftonline.com/consumers/oauth2/v2.0/token', options)
    .then(response => response.json())
    .then(response => {
      if (response.error) {
        throw new Error(response.error.message);
      }

      settingsStorage.setItem('oauth', JSON.stringify(response));
    })
}

/**
 * Checks whether the accesss code is valid and resolves if it is, otherwise rejects.
 */
export function checkAccessCode(): Promise<void> {
  console.log('Checking access code...');

  let responseSetting = settingsStorage.getItem('oauth-response');
  if (!responseSetting) {
    console.log('Resolving access code because no response setting');
    return Promise.resolve();
  }

  let responseJson = JSON.parse(responseSetting);
  if (previousCode == responseJson.code) {
    console.log(`Rejecting access code because ${previousCode} and ${responseJson.code} match`);

    // We have already retrieved a token for this code
    // If we retrieve it again it will be expired
    // This looks like an SDK bug with clearing settings and the oauth button
    return Promise.reject();
  }

  console.log('Resolving access code because it needs to be retrieved');
  return Promise.resolve();
}

/**
 * Determines whether the access token is valid.
 */
export function isAccessTokenValid(): boolean {
  let expirySetting = settingsStorage.getItem('oauthExpires');
  if (!expirySetting) {
    console.log('Access token is not valid because no expiry setting found.');
    return false;
  }

  let expiry = parseInt(expirySetting);
  if (expiry <= Date.now()) {
    console.log('Access token is not valid because it has expired.');
    return false;
  }

  console.log('Access token is valid.');
  return true;
}

/**
 * Gets the OAuth token data from settings.
 */
function getOAuthData(): any {
  let oauthSetting = settingsStorage.getItem('oauth');
  if (!oauthSetting) {
    logError('Could not find oauth setting!');
    return null;
  }

  let oauth = JSON.parse(oauthSetting);
  return oauth;
}

/**
 * Gets the OAuth button response data from settings.
 */
function getOAuthResponseData(): any {
  let oauthSetting = settingsStorage.getItem('oauth-response');
  if (!oauthSetting) {
    logError('Could not find oauth-response setting!');
    return null;
  }

  let oauth = JSON.parse(oauthSetting);
  return oauth;
}
