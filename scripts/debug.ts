import puppeteer from 'puppeteer';
import path from 'node:path';
import fs from 'node:fs';
import { debugServerApp, serverEvent } from './server';
import { serve } from '@hono/node-server';

const tmpDir = path.join('.tmp');
const scriptFile = path.join('dist/index.global.js');
// const ytUrl =
//   'https://search.yahoo.co.jp/realtime/search?p=%22Lvl%20200%20Akasha%22%20OR%20%22Lv200%20%E3%82%A2%E3%83%BC%E3%82%AB%E3%83%BC%E3%82%B7%E3%83%A3%22&ei=UTF-8&mtype=';
const ytUrl =
  'https://search.yahoo.co.jp/realtime/search?p=%22Lvl%20150%20Proto%20Bahamut%22%20OR%20%22Lv150%20%E3%83%97%E3%83%AD%E3%83%88%E3%83%90%E3%83%8F%E3%83%A0%E3%83%BC%E3%83%88%22';

async function main() {
  const browser = await puppeteer.launch({
    userDataDir: tmpDir,
    headless: false,
    ignoreDefaultArgs: ['--disable-extensions'],
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  await page.goto(ytUrl);

  async function reload() {
    const gbsScript = fs.readFileSync(scriptFile, {
      encoding: 'utf-8',
      flag: 'rs+',
    });
    // const gbsFunc = new Function(gbsScript);
    await page.reload();
    try {
      // await page.evaluate(`(() => {${gbsFunc.toString()}anonymous()})()`);
      await page.evaluate(gbsScript);
    } catch (err) {
      console.error(err);
    }
  }

  await reload();

  serverEvent.on('tweets', (tweets) => {
    console.log(tweets);
  });

  serverEvent.on('reload', async () => {
    await reload();
  });

  serve({
    fetch: debugServerApp.fetch,
    port: 3000,
  }).on('listening', () => {
    console.log('listening', `localhost:3000`);
  });
}

main();
