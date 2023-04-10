import {} from 'ws';
import { getRaidTweetChClient } from 'gbs-open-lib/server';
import { honoApp } from './server';
import { serve } from '@hono/node-server';
import { serverEnv } from './config';
import { onUpgrade, sendRaidTweetMini } from './wss';

async function main() {
  const server = serve({
    fetch: honoApp.fetch,
    port: Number.parseInt(serverEnv.SYNC_PORT),
  });

  server.on('listening', () => {
    console.log('listening...', `127.0.0.1:${serverEnv.SYNC_PORT}`);
  });

  server.on('upgrade', onUpgrade);

  const subRedis = getRaidTweetChClient('gbs-rt-tweet');

  subRedis.on('tweet', (tweet) => {
    console.log(tweet);
    sendRaidTweetMini(tweet);
  });
}

main();
