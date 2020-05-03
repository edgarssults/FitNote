import document from 'document';
import { peerSocket } from 'messaging';
import * as fs from 'fs';

const maxParagraphCount = 50;
const singleNoteFileName = 'SingleNote.json';

console.log('Started');

const scrollView = <GraphicsElement>document.getElementById("sv");
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
function displayNote(paragraphs: any) {
  // TODO: Add a loader?

  // Hide intro image and text
  if (introImage && introText) {
    introImage.style.visibility = 'hidden';
    introText.style.visibility = 'hidden';
  }

  // Scroll to top and show the paragraph list
  if (scrollView) {
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
peerSocket.onmessage = evt => {
  console.log(`Received:\n${JSON.stringify(evt)}`);
  fs.writeFileSync(singleNoteFileName, evt.data, 'json');
  console.log('Loading note from message...');
  displayNote(evt.data);
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