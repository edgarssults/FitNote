import { peerSocket } from "messaging";
import { settingsStorage } from "settings";
import { me } from "companion";
import { getProfile } from "./logic/profile";
import { getNotes, syncSelectedNote } from "./logic/notes";
import { setExpiry, refreshAccessToken } from "./logic/oauth";

// Reset the settings used to communicate with the settings page
settingsStorage.removeItem('syncSelectedNote');
settingsStorage.removeItem('refreshAccessToken');

if (me.launchReasons.settingsChanged) {
  console.warn('Settings were changed while companion was not running...');
  // TODO: Sync note again, it might have changed
}

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
  
  console.log(`Setting changed: ${evt.key}\n${evt.oldValue} >>> ${evt.newValue}`);
  
  // User has logged in
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

  if (evt.key === 'refreshAccessToken' && evt.newValue) {
    refreshAccessToken();
    return;
  }
};