import { settingsStorage } from "settings";

let previousCode: string = "EMPTY";

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
 * TODO
 */
function GetOAuthResponseData(): any {
  let oauthSetting = settingsStorage.getItem('oauth-response');
  if (!oauthSetting) {
    console.error('Could not find oauth-response setting!');
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
 * TODO
 */
export function getAccessToken(): Promise<void> {
  let oauth = GetOAuthResponseData();
  settingsStorage.removeItem('oauth-response');

  const options = {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
      body: `client_id=98d88e94-97a8-42dc-a692-cdcb8f79a9f3
      &scope=${encodeURI('openid profile User.Read Notes.Read')}
      &redirect_uri=${encodeURI('https://app-settings.fitbitdevelopercontent.com/simple-redirect.html')}
      &grant_type=authorization_code
      &state=${oauth.state}
      &code=${oauth.code}`
  };

  return fetch('https://login.microsoftonline.com/consumers/oauth2/v2.0/token', options)
    .then(response => response.json())
    .then(response => {
      // Have to keep code in a local variable in case of settings reset
      previousCode = oauth.code;
      settingsStorage.setItem('oauth', JSON.stringify(response));
    })
    .catch(error => console.error(error.message));
}

/**
 * Refreshes the MS Graph API access token.
 */
export function refreshAccessToken(): Promise<void> {
  settingsStorage.removeItem('refreshAccessToken');

  let oauth = GetOAuthData();

  const options = {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
      body: `client_id=98d88e94-97a8-42dc-a692-cdcb8f79a9f3
      &scope=${encodeURI(oauth.scope)}
      &refresh_token=${oauth.refresh_token}
      &redirect_uri=${encodeURI('https://app-settings.fitbitdevelopercontent.com/simple-redirect.html')}
      &grant_type=refresh_token`
  };

  return fetch('https://login.microsoftonline.com/consumers/oauth2/v2.0/token', options)
    .then(response => response.json())
    .then(response => {
      settingsStorage.setItem('oauth', JSON.stringify(response));
    })
    .catch(error => console.error(error.message));
}

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
