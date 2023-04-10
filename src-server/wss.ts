import { RaidTweetMini } from 'gbs-open-lib';
import { WebSocket, WebSocketServer } from 'ws';
import { ServerMessage, zClientMessage } from './schema';
import { serverEnv } from './config';
import { IncomingMessage } from 'node:http';
import internal from 'node:stream';
import { sendRawRaidTweet } from 'gbs-open-lib/server';
import { RawRaidTweet } from 'gbs-open-lib/server';

export const wss = new WebSocketServer({ noServer: true });
const aliveFlag = new Map<WebSocket, boolean>();
/**
 * PingPong
 */
const interval = setInterval(() => {
  aliveFlag.forEach((flag, ws) => {
    if (!flag) {
      ws.terminate();
      aliveFlag.delete(ws);
      return;
    }
    aliveFlag.set(ws, false);
    ws.ping();
  });
}, 1000 * 10);

const subscriber: Map<number, Set<WebSocket>> = new Map();

export function getSubscriberCount() {
  return [...subscriber.entries()]
    .sort((a, b) => a[0] - b[0])
    .flatMap((item) => {
      if (item[1].size <= 0) return [];
      return [
        {
          id: item[0],
          count: item[1].size,
        },
      ];
    });
}

export function onUpgrade(
  req: IncomingMessage,
  socket: internal.Duplex,
  head: Buffer
) {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
}

wss.on('connection', (ws, req) => {
  aliveFlag.set(ws, true);

  sendMessage(ws, {
    type: 'time',
    data: Date.now(),
  });

  // sendMessage(ws, {
  //   type: 'message',
  //   message: `server_id: ${env.SERVER_PORT}, name: ${
  //     env.SERVER_NAME ?? 'MAIN'
  //   }`,
  // });

  ws.on('error', () => {});

  ws.on('pong', () => {
    aliveFlag.set(ws, true);
  });
  ws.on('close', () => {
    aliveFlag.delete(ws);
    removeAllFilter(ws);
  });

  ws.on('message', (data) => {
    try {
      const json = JSON.parse(data.toString('utf-8'));
      const msg = zClientMessage.parse(json);
      switch (msg.type) {
        case 'filter': {
          console.log(msg.id);
          // 一旦全ての購読を解除
          removeAllFilter(ws);
          let clients = subscriber.get(msg.id);
          if (!clients) {
            clients = new Set();
            subscriber.set(msg.id, clients);
          }
          clients.add(ws);
          const size = clients.size;
          clients.forEach((target) => {
            sendMessage(target, {
              type: 'subs',
              id: msg.id,
              num: size,
            });
          });
          break;
        }
        case 'raw': {
          const tweets = msg.data.map((tweet): RawRaidTweet => {
            return {
              ...tweet,
              elapsed_time: Date.now() - tweet.time,
              user_id: '0',
            };
          });

          for (const rawTweet of tweets) {
            sendRawRaidTweet(rawTweet, 'gbs-rt-raw');
          }
          break;
        }
        case 'ping': {
          sendMessage(ws, { type: 'pong' });
          break;
        }
      }
    } catch {
      sendError(ws, '無効なリクエストです');
    }
  });
});

function removeAllFilter(ws: WebSocket) {
  for (const [id, clients] of subscriber.entries()) {
    if (clients.has(ws)) {
      clients.delete(ws);
      const size = clients.size;
      clients.forEach((target) => {
        sendMessage(target, {
          type: 'subs',
          num: size,
          id,
        });
      });
    }
  }
}

export function sendAll(serverMsg: ServerMessage) {
  try {
    const msg = JSON.stringify(serverMsg);
    for (const ws of wss.clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    }
  } catch {}
}

export function sendRaidTweetMini(tweet: RaidTweetMini) {
  try {
    const clients = subscriber.get(tweet.ei);
    if (!clients) return;
    const json: ServerMessage = {
      type: 't',
      data: tweet,
    };
    const msg = JSON.stringify(json);
    for (const ws of clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    }
  } catch {}
}

function sendError(ws: WebSocket, msg: string) {
  try {
    if (ws.readyState === WebSocket.OPEN) {
      const json: ServerMessage = {
        type: 'error',
        message: msg,
      };
      ws.send(JSON.stringify(json));
    }
  } catch {}
}

function sendMessage(ws: WebSocket, serverMsg: ServerMessage) {
  try {
    const msg = JSON.stringify(serverMsg);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    }
  } catch {}
}
