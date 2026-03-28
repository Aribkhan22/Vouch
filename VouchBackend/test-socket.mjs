/**
 * Socket.IO end-to-end test
 * Usage: node test-socket.mjs <startupToken> <lawyerToken> <chatId>
 */
import { io } from 'socket.io-client';

const [, , sToken, pToken, chatId] = process.argv;
if (!sToken || !pToken || !chatId) {
  console.error('Usage: node test-socket.mjs <startupToken> <lawyerToken> <chatId>');
  process.exit(1);
}

const BASE = 'http://localhost:5000';
let received = 0;

const startup = io(BASE, { auth: { token: sToken }, transports: ['websocket'] });
const lawyer  = io(BASE, { auth: { token: pToken }, transports: ['websocket'] });

function check(label, condition, detail = '') {
  const mark = condition ? '✅' : '❌';
  console.log(`${mark}  ${label}${detail ? ' — ' + detail : ''}`);
  if (!condition) process.exitCode = 1;
}

startup.on('connect', () => {
  console.log('Startup connected:', startup.id);
  startup.emit('chat:join', chatId);
});

lawyer.on('connect', () => {
  console.log('Lawyer  connected:', lawyer.id);
  lawyer.emit('chat:join', chatId);
  // Give both sockets time to join, then send a message
  setTimeout(() => {
    console.log('\n--- Startup sends a real-time message ---');
    startup.emit('message:send', { chatId, text: '[Socket test] Hello from startup via socket!' });
  }, 600);
});

// Lawyer should receive the message emitted by startup
lawyer.on('message:new', (msg) => {
  received++;
  check('Lawyer received message:new event', true);
  check('Correct chatId in event', msg.chatId === chatId, msg.chatId);
  check('Text matches', msg.text === '[Socket test] Hello from startup via socket!', msg.text);
  check('senderId present', !!msg.senderId, msg.senderId);

  // Cleanup
  setTimeout(() => {
    startup.disconnect();
    lawyer.disconnect();
    console.log('\n--- Socket.IO test complete ---');
    if (received === 0) check('At least one message received', false);
    process.exit(process.exitCode ?? 0);
  }, 300);
});

startup.on('message:new', (msg) => {
  // Startup also receives its own message echoed back (broadcast to room)
  console.log('Startup received echo:', msg.text);
});

startup.on('connect_error', (e) => { console.error('Startup connect error:', e.message); process.exit(1); });
lawyer .on('connect_error', (e) => { console.error('Lawyer  connect error:', e.message); process.exit(1); });

// Timeout safety
setTimeout(() => {
  if (received === 0) {
    check('message:new received within 5s', false);
    startup.disconnect(); lawyer.disconnect();
    process.exit(1);
  }
}, 5000);
