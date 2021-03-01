import { peerSocket } from 'messaging';
import { settingsStorage } from "settings";
import { getGraphText, getGraphJson } from "./graph";
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

  console.log('Getting notes...');
  settingsStorage.setItem('notes-loading', 'true');

  getGraphJson('https://graph.microsoft.com/v1.0/me/onenote/pages?$select=id,title&$orderBy=lastModifiedDateTime%20desc', token)
    .then(response => setNotes(response))
    .then(() => settingsStorage.removeItem('notes-loading'))
    .catch(error => {
      console.error(JSON.stringify(error));
      settingsStorage.removeItem('notes-loading');
    });
}

/**
 * Sets retrieved notes in settings.
 * @param noteData Notes.
 */
function setNotes(noteData: any): void {
  let notes = noteData.value.map((n: { title: string; id: string; }) => ({ name: n.title, value: n.id }));
  settingsStorage.setItem('notes', JSON.stringify(notes));
  console.log('Got notes');
}

/**
 * Syncs the selected note with the watch.
 */
export function syncSelectedNote(): void {
  console.log('Syncing note...');
  settingsStorage.setItem('sync-loading', 'true');

  // Reset the settings used to communicate with the settings page
  settingsStorage.removeItem('syncSelectedNote');
  settingsStorage.removeItem('syncError');
  settingsStorage.removeItem('selectedNoteSynced');

  let token = getOAuthToken();
  if (!token) {
    console.error('syncSelectedNote: Could not get OAuth token!');
    setSyncError('Could not sync note');
    settingsStorage.removeItem('sync-loading');
    return;
  }

  // Get the selectedNote setting
  let selectedNoteSetting = settingsStorage.getItem('selectedNote');
  if (!selectedNoteSetting) {
    console.error('Could not find selectedNote setting!');
    setSyncError('Could not sync note');
    settingsStorage.removeItem('sync-loading');
    return;
  }

  // Get the selected note's content
  let selectedNote = JSON.parse(selectedNoteSetting);
  getGraphText(`https://graph.microsoft.com/v1.0/me/onenote/pages/${selectedNote.values[0].value}/content`, token)
    .then(response => sendToApp(response))
    .then(() => settingsStorage.removeItem('sync-loading'))
    .catch(() => {
      settingsStorage.removeItem('sync-loading');
      setSyncError('Could not send note to watch!');
    });
}

/**
 * Clears the synced note from the watch.
 */
export function clearSyncedNote(): void {
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

/**
 * Syncs the note that's sitting in the queue with the watch.
 */
export function syncQueuedNote(): void {
  let queuedNoteSetting = settingsStorage.getItem('queuedNote');
  if (!queuedNoteSetting) {
    console.log('No note queued');
    return;
  }

  let queuedNote = JSON.parse(queuedNoteSetting);
  if (peerSocket.readyState === peerSocket.OPEN) {
    peerSocket.send(queuedNote);
    settingsStorage.removeItem('queuedNote');
    console.log('Queued note sent to app');
  } else {
    setSyncError('Could not send note to watch!');
  }
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
  if (peerSocket.readyState === peerSocket.OPEN) {
    // Send the note to the watch right away
    peerSocket.send(contentArray);
    settingsStorage.setItem('selectedNoteSynced', Date.now().toString());
    console.log('Note sent to app');
  } else if (peerSocket.readyState === peerSocket.CLOSED) {
    // Queue the note for sending as soon as the app is started on the watch
    settingsStorage.setItem('queuedNote', JSON.stringify(contentArray));
    settingsStorage.setItem('selectedNoteSynced', Date.now().toString());
    console.log('Note queued for sending to app');
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
