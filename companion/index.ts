import { peerSocket } from "messaging";
import { settingsStorage } from "settings";
import { me } from "companion";
import { getProfile } from "./logic/profile";
import { getNotes, syncSelectedNote, syncQueuedNote } from "./logic/notes";
import { setExpiry, getAccessToken, refreshAccessToken, checkAccessCode } from "./logic/oauth";

// Reset the settings used to communicate with the settings page
settingsStorage.removeItem('syncSelectedNote');
settingsStorage.removeItem('refreshAccessToken');

if (me.launchReasons.settingsChanged) {
  console.warn('Settings were changed while companion was not running...');

  // User has changed the selected note or wants to sync it again
  if (settingExists('syncSelectedNote') || settingExists('selectedNote')) {
    syncSelectedNote();
  }

  // User has requested a new access token
  if (settingExists('refreshAccessToken')) {
    refreshAccessToken()
      .then(setExpiry)
      .then(getNotes);
  }
}

/**
 * Message is received.
 */
peerSocket.onmessage = message => {
  console.log('Received message from app');
  if (message.data.type === 'QueuedMessageRequest') {
    console.log('Checking for queued notes...');
    syncQueuedNote();
  }
};

/**
 * Message socket opens.
 */
peerSocket.onopen = () => {
  console.log("Socket Open");
};

/**
 * Message socket closes.
 */
peerSocket.onclose = () => {
  console.log("Socket Closed");
};

/**
 * A user changes a setting.
 */
settingsStorage.onchange = evt => {
  if (evt.oldValue === evt.newValue) {
    console.warn(`Event fired for setting ${evt.key}, but it hasn't changed.`);
    return;
  }
  
  console.log(`Setting changed: ${evt.key}\n${evt.oldValue}\n>>>\n${evt.newValue}`);
  
  // User has logged in
  // This is the default handling
  if (evt.key === 'oauth' && evt.newValue) {
    setExpiry();
    getProfile();
    getNotes();
    return;
  }
  
  // User has changed the selected note or wants to sync it again
  if ((evt.key === 'selectedNote' || evt.key === 'syncSelectedNote') && evt.newValue) {
    syncSelectedNote();
    return;
  }

  // User has requested an access token
  // This is our custom handling
  if (evt.key === 'oauth-response' && evt.newValue) {
    checkAccessCode()
      .then(() => {
        console.log('Getting access token...');
        getAccessToken()
          .then(() => settingsStorage.setItem('oauth-loading', 'true'))
          .then(setExpiry)
          .then(getProfile)
          .then(getNotes)
          .then(() => settingsStorage.removeItem('oauth-loading'));
      })
      .then(() => settingsStorage.removeItem('oauth-loading'))
      .catch(() => console.log('Not getting access token'));
    return;
  }

  // User has requested a new access token
  if (evt.key === 'refreshAccessToken' && evt.newValue) {
    refreshAccessToken()
      .then(setExpiry)
      .then(getNotes);
    return;
  }
};

/**
 * Determines whether a settings exists in the settings storage.
 * @param settingName Setting name.
 */
function settingExists(settingName: string): boolean {
  let setting = settingsStorage.getItem(settingName);
  
  if (!setting) {
    return false;
  }
  
  return setting.length > 0;
}
