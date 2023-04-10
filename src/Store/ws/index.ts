import { RaidTweetMini } from 'gbs-open-lib';
import mitt from 'mitt';
import { ClientMessage, zServerMessage } from '@server/schema';
import { createSignal } from 'solid-js';
import { setSubsNum } from '../tweets';

type WsEvent = {
  tweet: RaidTweetMini;
  time: number;
  message: string;
  ping: number;

  open: void;
  close: void;
  error: string | undefined;
};
export const gbsWs = mitt<WsEvent>();

export let ws: WebSocket | null = null;

export function sendMessage(clientMessage: ClientMessage) {
  try {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const msg = JSON.stringify(clientMessage);
      ws.send(msg);
    }
  } catch {}
}

let startPingTime = Date.now();
let prevMessageTime = Date.now();
const [ping, setPing] = createSignal(0);
export { ping };

let isStart = false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const timer = setInterval(() => {
  if (Date.now() - prevMessageTime > 8000 && isStart) {
    return connect();
  }
  if (
    isStart &&
    ws &&
    ws.readyState !== WebSocket.OPEN &&
    ws.readyState !== WebSocket.CONNECTING &&
    ws.readyState !== WebSocket.CLOSING
  ) {
    return connect();
  }
}, 2000);

export function connect() {
  isStart = false;
  if (ws) {
    ws.close();
    ws = null;
  }
  isStart = true;
  try {
    // ws = new WebSocket(`ws://${location.hostname}:10510/ws/`);
    // ws = new WebSocket(`wss://gbs-open.eriri.net/private/api/stream/ws/`);
    // ws = new WebSocket(`ws://127.0.0.1:10505/ws/`);
    ws = new WebSocket(`wss://gbs-rt.eriri.net/ws/`);

    ws.addEventListener('message', (event) => {
      prevMessageTime = Date.now();
      try {
        // console.log(JSON.parse(event.data));
        const msg = zServerMessage.parse(JSON.parse(event.data));
        switch (msg.type) {
          case 't': {
            gbsWs.emit('tweet', msg.data);
            break;
          }
          case 'time': {
            gbsWs.emit('time', msg.data);
            break;
          }
          case 'message': {
            gbsWs.emit('message', msg.message);
            break;
          }
          case 'pong': {
            gbsWs.emit('ping', Math.floor((Date.now() - startPingTime) / 2));
            setPing(Math.floor((Date.now() - startPingTime) / 2));
            setTimeout(() => {
              startPingTime = Date.now();
              sendMessage({ type: 'ping' });
            }, 3000);
            break;
          }
          case 'subs': {
            setSubsNum(msg.num);
          }
        }
      } catch (err) {
        console.error(err);
      }
    });

    ws.addEventListener('open', () => {
      gbsWs.emit('open');
      startPingTime = Date.now();
      sendMessage({ type: 'ping' });
    });
    ws.addEventListener('close', () => {
      gbsWs.emit('close');
    });
    ws.addEventListener('error', () => {
      // gbsWs.emit('error', 'サーバー接続エラー');
    });
  } catch {
    gbsWs.emit('error', 'サーバーに接続できませんでした');
  }
}
