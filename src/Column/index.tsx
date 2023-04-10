import { hasFocus, setSettings, settings } from '@/Store/settings';
import { allTweets, copyTweet } from '@/Store/tweets';
import { tweetReciver } from '@/Store/tweets/receiver';
import { TweetData } from '@/Store/tweets/schema';
import {
  For,
  Show,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import { styled } from 'solid-styled-components';
import { Tweet } from './Tweet';
import clsx from 'clsx';
import { hasClipboardPermission } from '@/utils';

declare global {
  interface Window {
    gbsLatestTweetId?: string;
  }
}

export function Column() {
  const [filteredTweets, setFilteredTweets] = createSignal<TweetData[]>([]);

  function onTweet(tweetData: TweetData) {
    setFilteredTweets((prev) => {
      // 追加済みならなにもしない
      if (prev.find((target) => target.tweetId === tweetData.tweetId)) {
        return prev;
      }

      // 重複
      if (tweetData.firstTime !== tweetData.time) {
        return prev;
      }
      const res = [...prev];
      res.splice(0, 0, tweetData);

      window.gbsLatestTweetId = tweetData.battleId;

      if (settings.autoCopy && hasFocus()) {
        copyTweet(tweetData);
      }
      return res.slice(0, 15);
    });
  }

  onMount(() => {
    tweetReciver.on('tweet', onTweet);
  });

  onCleanup(() => {
    tweetReciver.off('tweet', onTweet);
  });

  return (
    <Wrap>
      <header>
        <Show when={hasClipboardPermission()}>
          <AutoButton
            class={clsx({ on: settings.autoCopy, pause: !hasFocus() })}
            onClick={() => {
              setSettings('autoCopy', (prev) => !prev);
            }}
          >
            AUTO
          </AutoButton>
        </Show>
      </header>
      <div class="gbs-scroll">
        <div class="gbs-scroll-inner">
          <For each={filteredTweets()}>
            {(tweetData) => {
              return (
                <div>
                  <Tweet tweet={tweetData} />
                  <hr class="tweet-hr" />
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </Wrap>
  );
}

const AutoButton = styled.button`
  border: 0;
  display: block;
  width: 60px;
  padding: 3px 0;
  text-align: center;
  font-weight: bold;
  background: #fff;
  color: #222;
  border-radius: 999px;
  font-size: 13px;
  &.on {
    background: #05d9ff;
    color: #fff;
    &.pause {
      opacity: 0.5;
    }
  }
`;

const Wrap = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  > header {
    flex-grow: 0;
    flex-shrink: 0;
    padding: 5px;
    border-top: 1px solid #333;
    border-bottom: 1px solid #333;
  }
  .gbs-scroll {
    position: relative;
    flex: 1;
    position: relative;
    overflow-y: scroll;
    > .gbs-scroll-inner {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      height: 100%;
      .tweet-hr {
        display: block;
        border: 0;
        border-top: 1px solid #444;
      }
    }
  }
`;
