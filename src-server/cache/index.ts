import {
  RawRaidTweetMini,
  sendRaidTweet,
  getRawChClient,
  RaidTweetMini,
} from 'gbs-open-lib/server';
import { getEnemyId, initGbsList } from '../config';
import { releaseTimeCache, addCacheAndGrantFirstTime } from './cache';

async function main() {
  await initGbsList();
  console.log('✅ initGbsList()');

  const subRedis = getRawChClient('gbs-rt-raw');
  subRedis.on('tweet', (raw) => {
    const mini = createRaidTweetMini(raw);
    if (mini) {
      sendRaidTweet(mini, 'gbs-rt-tweet');
    }
  });

  // 不要なキャッシュを削除
  setInterval(() => {
    releaseTimeCache();
  }, 1000 * 60);
}

function createRaidTweetMini(raw: RawRaidTweetMini): RaidTweetMini | null {
  const { en, lv, ...props } = raw;
  const enemyId = getEnemyId(en, lv);
  const temp: RaidTweetMini = {
    ...props,
    ei: enemyId,
    ft: raw.t,
  };
  if (enemyId === -1) {
    temp.en = en;
    temp.lv = lv;
  }
  return addCacheAndGrantFirstTime(temp);
}

main();
