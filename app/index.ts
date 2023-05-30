import { peerSocket } from 'messaging';

/**
 * Message is received.
 */
peerSocket.onmessage = message => {
  console.log('Received message from companion:');
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
