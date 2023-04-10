import mitt from 'mitt';
import { GbfTweet, parse } from '@totoraj930/gbf-tweet-parser';
import { RawRaidTweet } from './schema';

type Tweet = {
  createdAt: number;
} & GbfTweet;

type TweetElmEvent = {
  tweets: RawRaidTweet[];
};

export const tweetElmReceiver = mitt<TweetElmEvent>();

let $prevLastDiv: Element | null = null;

const observer = new MutationObserver(getTweetFromElm);

export function initTweetElmObserver() {
  const $target = document.body.querySelector('#autosr');
  observer.observe($target!, { childList: true, subtree: true });
  getTweetFromElm();
}

export function getTweetFromElm() {
  const selectors = [
    '#autosr div[class^=Tweet_bodyContainer]',
    '#sr div[class^=Tweet_bodyContainer]',
    '#autosr div[class^=Timeline_TweetContainer]',
  ];
  const $divList = document.body.querySelectorAll(selectors.join(', '));
  const res: RawRaidTweet[] = [];
  for (const $div of $divList) {
    if ($prevLastDiv === $div) break;
    const $p: HTMLParagraphElement | null = $div.querySelector(
      'p[class^=Tweet_body]'
    );
    const $a: HTMLAnchorElement | null = $div.querySelector(
      'time[class^=Tweet_time] a'
    );
    const $name: HTMLSpanElement | null = $div.querySelector(
      'span[class^=Tweet_authorName]'
    );
    const $screenName: HTMLAnchorElement | null = $div.querySelector(
      'a[class^=Tweet_authorID]'
    );

    if (!$p || !$a || !$name || !$screenName) continue;

    const tweet = $p.innerText
      .replace(
        /\s(I need backup!|参加者募集！)\s/g,
        (str) => '\n' + str.trim() + '\n'
      )
      .replace(/\spic\.twitter\.com.*$/, '');

    const gbfTweet = parse(tweet);
    const idStr = $a.href.match(/[0-9]{13,}$/)?.[0];

    if (!idStr || !gbfTweet) continue;
    const time = snowflakeToTime(idStr);
    res.unshift({
      time,
      name: $name.innerText,
      screen_name: $screenName.innerText.replace(/^@/, ''),
      tweet_id: idStr,
      battle_id: gbfTweet.battleId,
      enemy_name: gbfTweet.enemyName,
      level: gbfTweet.level,
      language: gbfTweet.language,
    });
  }

  tweetElmReceiver.emit('tweets', res);

  $prevLastDiv = $divList[0] ?? $prevLastDiv;
}

export function snowflakeToTime(idStr: string) {
  const time = Number(BigInt(idStr) >> 22n) + 1288834974657;
  return time;
}
