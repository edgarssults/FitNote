import { settingsStorage } from "settings";
import { getGraphJson } from "./graph";
import { getOAuthToken } from "./oauth";

/**
 * Gets profile from the MS Graph API.
 */
export function getProfile() {
  let token = getOAuthToken();
  if (!token) {
    console.error('getProfile: Could not get OAuth token!');
    return;
  }

  console.log('Getting profile data...');
  getGraphJson('https://graph.microsoft.com/v1.0/me', token)
    .then(response => setProfile(response))
    .catch(error => console.error(error.message));
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
