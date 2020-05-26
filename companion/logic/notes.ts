import * as messaging from "messaging";
import { settingsStorage } from "settings";
import { getGraphJson, getGraphText } from "./graph";
import { getOAuthToken } from "./oauth";

/**
 * Gets notes from MS Graph API.
 */
export function getNotes() {
  let token = getOAuthToken();
  if (!token) {
    console.error('getNotes: Could not get OAuth token!');
    return;
  }

  getGraphJson('https://graph.microsoft.com/v1.0/me/onenote/pages?$select=id,title&$orderBy=lastModifiedDateTime%20desc', token, setNotes);
}

/**
 * Sets retrieved notes in settings.
 * @param noteData Notes.
 */
function setNotes(noteData: any) {
  let notes = noteData.value.map((n: { title: string; id: string; }) => ({ name: n.title, value: n.id }));
  settingsStorage.setItem('notes', JSON.stringify(notes));
}

/**
 * Syncs the selected note with the watch.
 */
export function syncSelectedNote() {
  // Reset the settings used to communicate with the settings page
  settingsStorage.removeItem('syncSelectedNote');
  settingsStorage.removeItem('syncError');
  settingsStorage.removeItem('selectedNoteSynced');

  // Get oauth setting so that we can get the received token
  let oauthSetting = settingsStorage.getItem('oauth');
  if (!oauthSetting) {
    console.error('Could not find oauth setting!');
    return;
  }

  // Parse setting to get the token
  let oauth = JSON.parse(oauthSetting);
  let token = oauth.access_token;

  // Get the selectedNote setting
  let selectedNoteSetting = settingsStorage.getItem('selectedNote');
  if (!selectedNoteSetting) {
    console.error('Could not find selectedNote setting!');
    return;
  }

  // Get the selected note's content
  let selectedNote = JSON.parse(selectedNoteSetting);
  getGraphText(`https://graph.microsoft.com/v1.0/me/onenote/pages/${selectedNote.values[0].value}/content`, token, sendToApp);
}

/**
 * Sends note content to the watch after processing it.
 * @param noteContent Note HTML content.
 */
function sendToApp(noteContent: string) {
  if (!noteContent || noteContent.length == 0) {
    setSyncError('Note is empty!');
    return;
  }

  // Try to find paragraphs
  let paragraphMatches = noteContent.match(/\<p[^\>]+\>.*?\<\/p\>/g);
  if (!paragraphMatches) {
    setSyncError('Could not find paragraphs in note!');
    return;
  }
  
  let contentArray: string[] = [];
  for (let paragraphmatch of paragraphMatches) {
    // Try to find content in the paragraph
    let contentMatch = paragraphmatch.match(/\<p[^\>]+\>(?<content>.*?)\<\/p\>/);
    if (!contentMatch || !contentMatch.groups) {
      continue;
    }

    // Get the content of the paragraph and remove HTML elements from it
    let content = contentMatch.groups.content.replace(/\<[^\>]+\>/g, '');
    contentArray.push(content);
  }
  
  // Send the gathered content to the watch
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(contentArray);
    settingsStorage.setItem('selectedNoteSynced', Date.now().toString());
  } else {
    setSyncError('Could not send note to watch!');
  }
}

/**
 * Set a sync error to display to the user.
 * @param error Error string.
 */
function setSyncError(error: string) {
  // TODO: Utils
  console.error(error);
  settingsStorage.setItem('syncError', error);
}
