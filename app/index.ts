import document from 'document';
import { peerSocket } from 'messaging';
import * as fs from 'fs';

const maxParagraphCount = 50;
const singleNoteFileName = 'SingleNote.json';

const scrollView = <GraphicsElement>document.getElementById("sv");
const border = <GraphicsElement>document.getElementById("border");
const introImage = <GraphicsElement>document.getElementById("introImage");
const introText = <GraphicsElement>document.getElementById("introText");
const loader = <GraphicsElement>document.getElementById("loader");

// Load the synced note from file
if (fs.existsSync(singleNoteFileName)) {
  console.log('Loading note from file...');
  hideIntro();
  hideNote();
  showLoader();
  let settings = fs.readFileSync(singleNoteFileName, 'json');
  displayNote(settings);
}

/**
 * Message is received.
 */
peerSocket.onmessage = message => {
  console.log('Received message from companion');
  if (message.data === 'clearSyncedNote') {
    console.log('Clearing note...');
    clearNote();
    return;
  }

  console.log('Loading note from message...');
  hideIntro();
  hideNote();
  showLoader();
  fs.writeFileSync(singleNoteFileName, message.data, 'json');
  displayNote(message.data);
};

/**
 * Message socket opens.
 */
peerSocket.onopen = () => {
  console.log("Socket Open");

  // Request a queued note from the companion
  console.log('Checking for queued notes...');
  peerSocket.send({
    type: 'QueuedMessageRequest'
  });
};

/**
 * Message socket closes.
 */
peerSocket.onclose = () => {
  console.log("Socket Closed");
};

/**
 * Displays the note.
 * @param paragraphs Note.
 */
function displayNote(paragraphs: string[]): void {
  hideLoader();
  showNote();

  // Set texts
  for (let i = 0; i < Math.min(paragraphs.length, maxParagraphCount); i++) {
    let paragraph = paragraphs[i];
    let note = <GraphicsElement>document.getElementById(`note${i}`);
    if (note) {
      note.text = paragraph;
      note.style.visibility = 'visible';
    }
  }

  // Clear other texts
  if (paragraphs.length < maxParagraphCount) {
    for (let i = Math.min(paragraphs.length, maxParagraphCount); i < maxParagraphCount; i++) {
      let note = <GraphicsElement>document.getElementById(`note${i}`);
      if (note) {
        note.text = '';
        note.style.visibility = 'hidden';
      }
    }
  }

  console.log('Note loaded');
}

/**
 * Clears the currently synced note.
 */
function clearNote(): void {
  if (!fs.existsSync(singleNoteFileName)) {
    return;
  }

  hideNote();
  showIntro();

  fs.unlinkSync(singleNoteFileName);
}

function showNote(): void {
  if (scrollView && border) {
    border.style.visibility = 'visible';
    scrollView.style.visibility = 'visible';
    scrollView.value = 0;
  }
}

function hideNote(): void {
  for (let i = 0; i < maxParagraphCount; i++) {
    let note = <GraphicsElement>document.getElementById(`note${i}`);
    if (note) {
      note.text = '';
      note.style.visibility = 'hidden';
    }
  }

  if (scrollView && border) {
    border.style.visibility = 'hidden';
    scrollView.style.visibility = 'hidden';
  }
}

function showIntro(): void {
  if (introImage && introText) {
    introImage.style.visibility = 'visible';
    introText.style.visibility = 'visible';
  }
}

function hideIntro(): void {
  if (introImage && introText) {
    introImage.style.visibility = 'hidden';
    introText.style.visibility = 'hidden';
  }
}

function showLoader(): void {
  if (loader) {
    loader.style.visibility = "visible";
  }
}

function hideLoader(): void {
  if (loader) {
    loader.style.visibility = "hidden";
  }
}
