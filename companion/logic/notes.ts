import * as messaging from "messaging";
import { settingsStorage } from "settings";
import { getGraphJson, getGraphText } from "./graph";
import { getOAuthToken } from "./oauth";

/**
 * Gets notes from MS Graph API.
 */
export function getNotes(): void {
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
function setNotes(noteData: any): void {
  let notes = noteData.value.map((n: { title: string; id: string; }) => ({ name: n.title, value: n.id }));
  settingsStorage.setItem('notes', JSON.stringify(notes));
}

/**
 * Syncs the selected note with the watch.
 */
export function syncSelectedNote(): void {
  // Reset the settings used to communicate with the settings page
  settingsStorage.removeItem('syncSelectedNote');
  settingsStorage.removeItem('syncError');
  settingsStorage.removeItem('selectedNoteSynced');

  let token = getOAuthToken();
  if (!token) {
    console.error('syncSelectedNote: Could not get OAuth token!');
    return;
  }

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
function sendToApp(noteContent: string): void {
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
  } else if (messaging.peerSocket.readyState === messaging.peerSocket.CLOSED) {
    // TODO: Save synced note and send it to the watch when the app starts up
    setSyncError('Open the app on the watch to sync.');
  } else {
    setSyncError('Could not send note to watch!');
  }
}

/**
 * Set a sync error to display to the user.
 * @param error Error string.
 */
function setSyncError(error: string): void {
  console.error(error);
  settingsStorage.setItem('syncError', error);
}
