import { RawRaidTweet, zRawRaidTweet } from '@/Store/tweets/schema';
import { GbfTweet } from '@totoraj930/gbf-tweet-parser';
import mitt from 'mitt';
import { IncomingMessage, Server, ServerResponse } from 'node:http';
import { parse } from 'node:url';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { z } from 'zod';

type ServerEvent = {
  reload: void;
  tweets: RawRaidTweet[];
};

export const serverEvent = mitt<ServerEvent>();

const app = new Hono();

app.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: ['*'],
    allowMethods: ['*'],
  })
);

app.get('/', async (c) => {
  serverEvent.emit('reload');
  if (c.runtime === 'node') {
  }
  return c.text('ok');
});

const zPostBody = z.array(zRawRaidTweet);
app.post('/post', async (c) => {
  try {
    const tweets = zPostBody.parse(await c.req.json());
    serverEvent.emit('tweets', tweets);
  } catch (err) {
    console.error(err);
  }
  return c.text('ok', 200);
});

export { app as debugServerApp };
