import { zGbsListItem, zRaidTweetMini } from 'gbs-open-lib';
import z from 'zod';

export const zRawRaidTweet = z.object({
  name: z.string(),
  screen_name: z.string(),
  tweet_id: z.string(),
  battle_id: z.string(),
  comment: z.string().optional(),
  enemy_name: z.string(),
  level: z.string(),
  language: z.enum(['ja', 'en']),
  time: z.number(),
});

export type RawRaidTweet = z.infer<typeof zRawRaidTweet>;

/**
 * アプリ上で扱うツイートデータ
 */
export const zTweetData = z.object({
  battleId: z.string(),
  language: z.enum(['en', 'ja']),
  time: z.number(),
  firstTime: z.number(),
  sender: z.string(),
  comment: z.string().optional(),
  enemy: zGbsListItem,
  elapsed: z.number(),
  tweetId: z.string(),
});
export type TweetData = z.infer<typeof zTweetData>;

/**
 * キャッシュサーバーのレスポンス
 */
export const zCacheResponse = z.array(
  z.object({
    id: z.number(),
    tweets: z.array(zRaidTweetMini),
  })
);
