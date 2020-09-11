import document from 'document';
import { peerSocket } from 'messaging';
import * as fs from 'fs';

const maxParagraphCount = 50;
const singleNoteFileName = 'SingleNote.json';

const scrollView = <GraphicsElement>document.getElementById("sv");
const border = <GraphicsElement>document.getElementById("border");
const introImage = <GraphicsElement>document.getElementById("introImage");
const introText = <GraphicsElement>document.getElementById("introText");

// Load the synced note from file
if (fs.existsSync(singleNoteFileName)) {
  console.log('Loading note from file...');
  let settings = fs.readFileSync(singleNoteFileName, 'json');
  displayNote(settings);
}

/**
 * Displays the note.
 * @param paragraphs Note.
 */
function displayNote(paragraphs: string[]): void {
  // TODO: Add a loader?

  // Hide intro image and text
  if (introImage && introText) {
    introImage.style.visibility = 'hidden';
    introText.style.visibility = 'hidden';
  }

  // Scroll to top and show the paragraph list
  if (scrollView && border) {
    border.style.visibility = 'visible';
    scrollView.style.visibility = 'visible';
    scrollView.value = 0;
  }
  
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
 * Message is received.
 */
peerSocket.onmessage = message => {
  console.log('Received message from companion');
  console.log('Loading note from message...');
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
