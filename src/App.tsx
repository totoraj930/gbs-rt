import { onMount } from 'solid-js';
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
import { connectReciver } from './Store/tweets/receiver';
import { initFocusDetector } from './Store/settings';
import { Column } from './Column';
import { allTweets } from './Store/tweets';

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
    height: 0;
    min-height: 0;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
  }
  .p #search {
    height: 0;
    overflow: hidden;
    opacity: 0;
    pointer-events: none;
  }
`;

export function App() {
  onMount(() => {
    console.log('Started App');

    window.addEventListener('focus', () => {});

    tweetElmReceiver.on('tweets', async (tweets) => {
      const newTweets = tweets.filter((tweet) => {
        return !allTweets().find((target) => target.tweetId === tweet.tweet_id);
      });
      // console.log(newTweets, tweets.length, newTweets.length);
      sendMessage({
        type: 'raw',
        data: newTweets,
      });
      // await fetch('http://127.0.0.1:3000/post', {
      //   method: 'POST',
      //   mode: 'cors',
      //   headers: {
      //     'content-type': 'application/json',
      //   },
      //   body: JSON.stringify(tweets),
      // });
    });

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
