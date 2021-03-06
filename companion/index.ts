import { peerSocket } from "messaging";
import { settingsStorage } from "settings";
import { me } from "companion";
import { getProfile } from "./logic/profile";
import { getNotes, syncSelectedNote, syncQueuedNote, clearSyncedNote } from "./logic/notes";
import { setExpiry, getAccessToken, refreshAccessToken, checkAccessCode, isAccessTokenValid } from "./logic/oauth";
import { logError } from "./logic/errors";

// Reset the settings used to communicate with the settings page
settingsStorage.removeItem('syncSelectedNote');

if (me.launchReasons.settingsChanged) {
  console.warn('Settings were changed while companion was not running...');

  // User has changed the selected note or wants to sync it again
  if (settingExists('syncSelectedNote') || settingExists('selectedNote')) {
    syncNote();
  }

  // User has reset setting and note should be reset too
  if (settingExists('clearSyncedNote')) {
    clearSyncedNote();
  }

  // User wants to refresh the note list
  if (settingExists('refreshNotes')) {
    refreshNotes();
  }

  // User has requested an access token
  if (settingExists('oauth-response')) {
    getTokenAndApiData();
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
  
  // User has changed the selected note or wants to sync it again
  if ((evt.key === 'syncSelectedNote'|| evt.key === 'selectedNote') && evt.newValue) {
    syncNote();
    return;
  }

  // User has reset setting and note should be reset too
  if (evt.key === 'clearSyncedNote' && evt.newValue) {
    clearSyncedNote();
  }

  // User wants to refresh the note list
  if (evt.key === 'refreshNotes' && evt.newValue) {
    refreshNotes();
  }

  // User has requested an access token
  if (evt.key === 'oauth-response' && evt.newValue) {
    getTokenAndApiData();
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

/**
 * Gets the access token and gets data that is available from the Graph API.
 */
function getTokenAndApiData() {
  settingsStorage.setItem('oauth-loading', 'true');
  checkAccessCode()
    .then(() => {
      console.log('Getting access token...');
      getAccessToken()
        .then(setExpiry)
        .then(getProfile)
        .then(() => settingsStorage.removeItem('oauth-loading'))
        .then(getNotes)
        .catch(error => {
          logError('Error while getting access token: ' + JSON.stringify(error));
          settingsStorage.removeItem('oauth-loading');
        });
    })
    .catch(() => {
      console.log('Not getting access token');
      settingsStorage.removeItem('oauth-loading');
    });
}

/**
 * Checks/gets the access token and syncs the selected note.
 */
function syncNote() {
  if (!isAccessTokenValid()) {
    settingsStorage.setItem('oauth-loading', 'true');
    refreshAccessToken()
      .then(setExpiry)
      .then(() => settingsStorage.removeItem('oauth-loading'))
      .then(syncSelectedNote)
      .catch(error => {
        logError('Error while refreshing access token: ' + JSON.stringify(error));
        settingsStorage.removeItem('oauth-loading');
      });
  } else {
    syncSelectedNote();
  }
}

/**
 * Checks/gets the access token and gets the list of notes.
 */
function refreshNotes() {
  settingsStorage.setItem('notes-loading', 'true');
  settingsStorage.removeItem('refreshNotes');
  settingsStorage.removeItem('selectedNote');
  settingsStorage.removeItem('syncError');
  settingsStorage.removeItem('notes');

  if (!isAccessTokenValid()) {
    settingsStorage.setItem('oauth-loading', 'true');
    refreshAccessToken()
      .then(setExpiry)
      .then(() => settingsStorage.removeItem('oauth-loading'))
      .then(getNotes)
      .catch(error => {
        logError('Error while refreshing access token: ' + JSON.stringify(error));
        settingsStorage.removeItem('oauth-loading');
      });
  } else {
    getNotes();
  }
}
