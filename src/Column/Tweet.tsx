import { settings } from '@/Store/settings';
import { copiedIds, copyTweet, globalTime } from '@/Store/tweets';
import { TweetData } from '@/Store/tweets/schema';
import clsx from 'clsx';
import { Show, createMemo } from 'solid-js';
import { styled } from 'solid-styled-components';

type Props = {
  tweet: TweetData;
};
export function Tweet(props: Props) {
  const viewTime = createMemo(() => {
    if (settings.date24) {
      const d = new Date(props.tweet.time);
      const hh = `0${d.getHours()}`.slice(-2);
      const mm = `0${d.getMinutes()}`.slice(-2);
      // const ss = `0${d.getSeconds()}`.slice(-2);
      return `${hh}:${mm}`;
    }
    const now = globalTime();
    const seconds = Math.round((now - props.tweet.time) / 1000);
    const minutes = ~~(seconds / 60);
    const time = minutes > 0 ? minutes + '分' : seconds + '秒';
    return time;
  });

  const enemyName = createMemo(() => {
    return props.tweet.enemy['ja'];
  });

  const enemyLevel = createMemo(() => {
    return 'Lv.' + props.tweet.enemy.level;
  });

  const copied = createMemo(() => {
    return copiedIds().includes(props.tweet.battleId);
  });

  const image = createMemo(() => {
    return settings.showImage && props.tweet.enemy.image
      ? `url(https://pbs.twimg.com/media/${props.tweet.enemy.image})`
      : 'none';
  });

  return (
    <Button
      class={clsx({
        'tweet-copied': copied(),
      })}
      onMouseDown={() => copyTweet(props.tweet, settings.clickAction)}
      onTouchEnd={() => copyTweet(props.tweet, settings.clickAction)}
    >
      <span class="tweet-flash">{}</span>
      <span class="time">{viewTime()}</span>
      <span class="tweet-body tweet-outline-text">
        <span class="enemy">
          <span class="level">{enemyLevel()}</span>
          <span class="name">{enemyName()}</span>
        </span>
      </span>
      <span class="sender tweet-outline-text">@{props.tweet.sender}</span>
      <Show
        when={
          typeof props.tweet.comment === 'string' &&
          props.tweet.comment.length > 0
        }
      >
        <span class="tweet-comment" title={props.tweet.comment}>
          {props.tweet.comment}
        </span>
      </Show>

      <span
        class={clsx(
          'tweet-battle-id absolute right-[5px] bottom-[6px] text-[14px] font-[700]',
          'text-white'
        )}
      >
        {props.tweet.battleId}
      </span>
    </Button>
  );
}

const Button = styled.button`
  display: block;
  position: relative;
  width: 100%;
  user-select: none;
  background: #272727;
  text-align: left;
  -webkit-tap-highlight-color: transparent;

  outline: none;
  border: 0;
  color: #fff;
  padding: 5px;

  &.tweet-copied::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 100;
    background: rgba(0, 0, 0, 0.5);
  }
  > .time {
    position: absolute;
    top: 5px;
    right: 5px;
    padding: 4px 0 3px 0;
    z-index: 1;
    min-width: 60px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    text-align: center;
    font-size: 14px;
  }
  > .tweet-body {
    .enemy {
      position: relative;
      display: block;
      max-width: 100%;
      z-index: 0;
      margin-bottom: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: bold;
      line-height: 1.5;
      .level {
        display: block;
        font-size: 0.8em;
      }
      .name {
        display: inline;
        text-overflow: ellipsis;
        font-size: 0.9em;
      }
    }
  }

  > .sender {
    position: relative;
    display: block;
    z-index: 2;
    font-size: 14px;
  }

  > .tweet-comment {
    z-index: 1;
    position: relative;
    display: inline-block;
    max-width: calc(100% - 80px);
    margin-top: 3px;
    /* padding: 9px 7px 3px 7px; */
    padding: 3px 7px;
    color: #fff;
    font-size: 14px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    &::before {
      content: '';
      z-index: -1;
      position: absolute;
      width: 100%;
      /* height: calc(100% - 5px); */
      height: 100%;
      bottom: 0;
      left: 0;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 5px;
    }
  }

  > .tweet-battle-id {
    position: absolute;
    right: 5px;
    bottom: 6px;
    font-size: 14px;
    font-weight: bold;
    text-shadow: -2px -2px 0 #000, -2px -1px 0 #000, -2px 0 0 #000,
      -2px 1px 0 #000, -2px 2px 0 #000, -1px -2px 0 #000, -1px -1px 0 #000,
      -1px 0 0 #000, -1px 1px 0 #000, -1px 2px 0 #000, 0 -2px 0 #000,
      0 -1px 0 #000, 0 0 0 #000, 0 1px 0 #000, 0 2px 0 #000, 1px -2px 0 #000,
      1px -1px 0 #000, 1px 0 0 #000, 1px 1px 0 #000, 1px 2px 0 #000,
      2px -2px 0 #000, 2px -1px 0 #000, 2px 0 0 #000, 2px 1px 0 #000,
      2px 2px 0 #000;
  }

  > .tweet-flash {
  }

  --c-tweet-outline-1: #2e2a2a;
  .tweet-outline-text {
    text-shadow: -2px -2px 0 var(--c-tweet-outline-1),
      -2px -1px 0 var(--c-tweet-outline-1), -2px 0 0 var(--c-tweet-outline-1),
      -2px 1px 0 var(--c-tweet-outline-1), -2px 2px 0 var(--c-tweet-outline-1),
      -1px -2px 0 var(--c-tweet-outline-1), -1px -1px 0 var(--c-tweet-outline-1),
      -1px 0 0 var(--c-tweet-outline-1), -1px 1px 0 var(--c-tweet-outline-1),
      -1px 2px 0 var(--c-tweet-outline-1), 0 -2px 0 var(--c-tweet-outline-1),
      0 -1px 0 var(--c-tweet-outline-1), 0 0 0 var(--c-tweet-outline-1),
      0 1px 0 var(--c-tweet-outline-1), 0 2px 0 var(--c-tweet-outline-1),
      1px -2px 0 var(--c-tweet-outline-1), 1px -1px 0 var(--c-tweet-outline-1),
      1px 0 0 var(--c-tweet-outline-1), 1px 1px 0 var(--c-tweet-outline-1),
      1px 2px 0 var(--c-tweet-outline-1), 2px -2px 0 var(--c-tweet-outline-1),
      2px -1px 0 var(--c-tweet-outline-1), 2px 0 0 var(--c-tweet-outline-1),
      2px 1px 0 var(--c-tweet-outline-1), 2px 2px 0 var(--c-tweet-outline-1);
  }
`;
