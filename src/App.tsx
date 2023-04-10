import { createEffect, on, onMount } from 'solid-js';
import {
  getTweetFromElm,
  initTweetElmObserver,
  tweetElmReceiver,
} from './Store/tweets/dom';

import { styled, css } from 'solid-styled-components';
import axios from 'axios';
import {
  autoscroll,
  initAutoscrollObserver,
  toggleAutoscroll,
} from './Store/autoscroll';
import { sendMessage } from './Store/ws';
import { connectReciver, sendFilter } from './Store/tweets/receiver';
import {
  filterId,
  initAutoCopy,
  initFocusDetector,
  setFilterId,
} from './Store/settings';
import { Column } from './Column';
import { allTweets } from './Store/tweets';
import { gbsList } from './Store/gbsList';

const indexCss = `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    line-height: 1;
  }
  #gbs-root {
    width: 100%;
  }
  #contentsBody .main {
    position: relative;
  }
  #wrapper #contentsInner {
    position: relative;
  }
  .s div[class^=SearchWrapper] {
    /*
    height: 0;
    min-height: 0;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
    */
  }
  .p #search {
    /*
    height: 0;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
    */
  }
`;

export function getEnemyId(name: string, level: string) {
  const enemy = gbsList().find((item) => {
    return (item.en === name || item.ja === name) && item.level === level;
  });
  return enemy?.id ?? -1;
}

let first = true;

export function App() {
  onMount(() => {
    console.log('Started App');

    initAutoCopy();

    tweetElmReceiver.on('tweets', async (tweets) => {
      if (tweets.length < 1) return;

      if (first) {
        const enemyIds = new Set<number>();
        for (const tweet of tweets) {
          enemyIds.add(getEnemyId(tweet.enemy_name, tweet.level));
        }
        const targetEnemyId = [...enemyIds].sort((a, b) => b - a)[0];
        setFilterId(targetEnemyId);
        first = false;
        console.log(targetEnemyId);
      }

      const newTweets = tweets.filter((tweet) => {
        return !allTweets().find((target) => target.tweetId === tweet.tweet_id);
      });

      sendMessage({
        type: 'raw',
        data: newTweets,
      });
    });

    createEffect(
      on(filterId, (id) => {
        sendFilter(id);
      })
    );

    connectReciver();

    setTimeout(() => {
      initFocusDetector();
      initTweetElmObserver();
      initAutoscrollObserver();
    }, 500);

    const $style = document.createElement('style');
    $style.innerHTML = indexCss;
    document.head.append($style);
  });
  return (
    <Div>
      <header>
        <h1>Granblue Search</h1>
        <p>for リアルタイム検索</p>
      </header>
      <Column />
      {/* <p>autoscroll: {autoscroll() + ''}</p>
      <button
        onClick={() => {
          toggleAutoscroll(!autoscroll());
        }}
      >
        toggle
      </button> */}
    </Div>
  );
}

const Div = styled.div`
  /* position: fixed; */

  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  max-width: min(340px, 100vh);
  height: calc(100vh - 200px);
  top: 0;
  left: 0;
  background: #222;
  color: #fff;
  z-index: 200;

  display: flex;
  flex-direction: column;
  > header {
    display: flex;
    gap: 5px;
    padding: 10px 5px;
    align-items: center;
    h1 {
      font-size: 14px;
      font-weight: bold;
    }
    p {
      font-size: 13px;
    }
  }
`;
