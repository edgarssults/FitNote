import { peerSocket } from "messaging";
import { settingsStorage } from "settings";
import { me } from "companion";

if (me.launchReasons.settingsChanged) {
  console.warn('Settings were changed while companion was not running...');
}

/**
 * A user changes a setting.
 */
settingsStorage.onchange = evt => {
  console.log(`Setting changed: ${evt.key}\n${evt.oldValue}\n>>>\n${evt.newValue}`);
};

/**
 * Message is received.
 */
peerSocket.onmessage = message => {
  console.log('Received message from app:');
  console.log(message.data);
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
