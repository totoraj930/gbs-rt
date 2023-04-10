import mitt from 'mitt';
import { gbsList } from '@/Store/gbsList';
import { globalTimeDiff, setAllTweets, setGlobalTimeDiff } from '.';
import { TweetData, zCacheResponse } from './schema';
import { connect, gbsWs, sendMessage } from '../ws';
// import { allFilterIds, allFilterIdStrs } from '../globalSettings';
import { createEffect, createSignal, on } from 'solid-js';
import type { RaidTweetMini } from 'gbs-open-lib';
import { filterId } from '../settings';

type ReceiverEvents = {
  tweet: TweetData;
  connected: void;
  disconnected: void;
  ping: number;
};

/**
 * 受信機
 */
export const tweetReciver = mitt<ReceiverEvents>();

/**
 * WebSocketクライアントからのイベント処理
 */
gbsWs.on('tweet', (mini) => {
  try {
    emitTweetFromMiniData(mini);
  } catch {
    /* */
  }
});

/**
 * 初回のフィルタ更新
 */
gbsWs.on('open', () => {
  sendFilter(filterId());
});

/**
 * サーバーとの時間のずれを確認
 */
gbsWs.on('time', (time) => {
  setGlobalTimeDiff(time - Date.now());
});

gbsWs.on('ping', (num) => {
  tweetReciver.emit('ping', num);
});

gbsWs.on('error', (msg) => {
  console.error(msg);
});

gbsWs.on('close', () => {
  // addToast({
  //   type: 'warn',
  //   duration: 3000,
  //   message: text('サーバーから切断しました'),
  // });
});

export function randomTweet(): TweetData | null {
  const list = gbsList();
  // スパバハ, ジーク, アガスティア, 強バハ
  const enemys = [117, 126, 127, 55];
  const senders = ['totoraj_game', 'hogefuga', 'xYdfs12d__2'];
  const sender = senders[Math.floor(Math.random() * senders.length)];
  const enemyId = enemys[Math.floor(Math.random() * enemys.length)];
  const enemy = list.find((item) => item.id === enemyId);
  if (!enemy) return null;
  const battleId = 'xxxxxxxx'
    .replace(/x/g, () => Math.floor(Math.random() * 16).toString(16))
    .toUpperCase();
  const time = Date.now() - Math.floor(Math.random() * 5000);
  return {
    battleId,
    enemy,
    time,
    firstTime: time,
    language: 'ja',
    sender,
    tweetId: Math.random() + '',
    elapsed: Date.now() + globalTimeDiff() - time,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function emitRandomTweet() {
  const tweet = randomTweet();
  if (tweet) emitTweet(tweet);
}

function emitTweetFromMiniData(mini: RaidTweetMini) {
  const enemy = gbsList().find((item) => item.id === mini.ei);
  const tweet: TweetData = {
    tweetId: mini.ti,
    battleId: mini.bi,
    language: mini.l,
    // elapsed: Date.now() + globalTimeDiff() - mini.t,
    elapsed: mini.et,
    time: mini.t,
    firstTime: mini.ft,
    sender: mini.sn,
    comment: mini.c,
    enemy: enemy ?? {
      attr: 0,
      en: mini.en ?? '?????',
      ja: mini.en ?? '?????',
      level: mini.lv ?? '???',
      id: mini.ei,
      image: null,
      tags: [],
    },
  };
  emitTweet(tweet);
}

function emitTweet(tweetData: TweetData) {
  tweetReciver.emit('tweet', tweetData);
  setAllTweets((prev) => {
    // 追加済みなら何もしない
    if (prev.find((target) => target.tweetId === tweetData.tweetId)) {
      return prev;
    }
    const res = [...prev];
    let insertPos = 0;
    for (let i = 0; i < res.length; i++) {
      if (res[i].time < tweetData.time) break;
      insertPos = i + 1;
    }
    res.splice(insertPos, 0, tweetData);
    return res.slice(0, 400);
  });
}

// let dummyTimer: number | null = null;
export function connectReciver() {
  connect();
  disconnectReciver();
  // dummyTimer = setInterval(emitRandomTweet, 1000);
}

export function disconnectReciver() {
  // if (dummyTimer) {
  //   clearInterval(dummyTimer);
  // }
}

/**
 * サーバーにフィルターを送信
 */
export function sendFilter(id: number) {
  sendMessage({
    type: 'filter',
    id,
  });
}

/**
 * キャッシュサーバーからクエストを入手
 */
export async function getRaidTweetCache(idStrs: string) {
  if (idStrs.length <= 0) return;
  try {
    const url = new URL('https://gbs-open.eriri.net/api/cache');
    url.searchParams.set('q', idStrs);
    const json = await (await fetch(url.href)).json();
    const res = zCacheResponse.parse(json);
    for (const item of res) {
      for (const mini of item.tweets) {
        emitTweetFromMiniData(mini);
      }
    }
  } catch (err) {
    console.error(err);
  }
}
