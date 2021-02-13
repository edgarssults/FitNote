import { peerSocket } from "messaging";
import { settingsStorage } from "settings";
import { me } from "companion";
import { getProfile } from "./logic/profile";
import { getNotes, syncSelectedNote, syncQueuedNote } from "./logic/notes";
import { setExpiry, getAccessToken, refreshAccessToken, checkAccessCode, isAccessTokenValid } from "./logic/oauth";

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
    settingsStorage.setItem('oauth-loading', 'true');
    refreshAccessToken()
      .then(setExpiry)
      .then(() => settingsStorage.removeItem('oauth-loading'))
      .then(getNotes);
  }
}

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
    if (!isAccessTokenValid()) {
      settingsStorage.setItem('oauth-loading', 'true');
      refreshAccessToken()
        .then(setExpiry)
        .then(() => settingsStorage.removeItem('oauth-loading'))
        .then(getNotes)
        .then(syncSelectedNote);
    } else {
      syncSelectedNote();
    }
    return;
  }

  // User has reset setting and note should be reset too
  if (evt.key === 'clearSyncedNote' && evt.newValue) {
    settingsStorage.removeItem('clearSyncedNote');

    // Send the gathered content to the watch
    if (peerSocket.readyState === peerSocket.OPEN) {
      peerSocket.send('clearSyncedNote');
      console.log('Clear command sent to app');
    } else if (peerSocket.readyState === peerSocket.CLOSED) {
      settingsStorage.setItem('queuedNote', 'clearSyncedNote');
      console.log('Clear command queued for sending to app');
    }
  }

  // User has requested an access token
  // This is our custom handling
  if (evt.key === 'oauth-response' && evt.newValue) {
    settingsStorage.setItem('oauth-loading', 'true');
    checkAccessCode()
      .then(() => {
        console.log('Getting access token...');
        getAccessToken()
          .then(setExpiry)
          .then(getProfile)
          .then(() => settingsStorage.removeItem('oauth-loading'))
          .then(getNotes);
      })
      .catch(() => {
        console.log('Not getting access token');
        settingsStorage.removeItem('oauth-loading')
      });
    return;
  }

  // User has requested a new access token
  if (evt.key === 'refreshAccessToken' && evt.newValue) {
    settingsStorage.setItem('oauth-loading', 'true');
    refreshAccessToken()
      .then(setExpiry)
      .then(() => settingsStorage.removeItem('oauth-loading'))
      .then(getNotes);
    return;
  }
};

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
