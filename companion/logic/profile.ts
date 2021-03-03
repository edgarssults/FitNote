import { settingsStorage } from "settings";
import { getGraphJson } from "./graph";
import { getOAuthToken } from "./oauth";
import { logError } from "./errors";

/**
 * Gets profile from the MS Graph API.
 */
export function getProfile() {
  let token = getOAuthToken();
  if (!token) {
    logError('Could not get OAuth token to get profile data!');
    return;
  }

  console.log('Getting profile data...');
  getGraphJson('https://graph.microsoft.com/v1.0/me', token)
    .then(response => setProfile(response))
    .catch(error => logError('Error while getting profile data: ' + JSON.stringify(error)));
}

/**
 * Sets retrieved profile data in settings.
 * @param profileData Profile.
 */
function setProfile(profileData: any) {
  settingsStorage.setItem('displayName', profileData.displayName ? profileData.displayName : '..');
  settingsStorage.setItem('userPrincipalName', profileData.userPrincipalName ? profileData.userPrincipalName : '..');
  console.log('Got profile data');
}
