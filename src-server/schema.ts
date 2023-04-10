import { zRawRaidTweet } from '@/Store/tweets/schema';
import { zRaidTweetMini } from 'gbs-open-lib';
import { z } from 'zod';

export const zServerMessage = z.union([
  z.object({
    type: z.literal('t'),
    data: zRaidTweetMini,
  }),
  z.object({
    type: z.literal('time'),
    data: z.number(),
  }),
  z.object({
    type: z.literal('autoscroll'),
    active: z.boolean(),
    timing: z.number(),
  }),
  z.object({
    type: z.literal('error'),
    message: z.string(),
  }),
  z.object({
    type: z.literal('message'),
    message: z.string(),
  }),
  z.object({
    type: z.literal('updateGbsList'),
  }),
  z.object({
    type: z.literal('updateInfo'),
  }),
  z.object({
    type: z.literal('pong'),
  }),
  z.object({
    type: z.literal('subs'),
    id: z.number().int(),
    num: z.number().int(),
  }),
]);

export type ServerMessage = z.infer<typeof zServerMessage>;

export const zClientMessage = z.union([
  z.object({
    type: z.literal('raw'),
    data: z.array(zRawRaidTweet),
  }),
  z.object({
    type: z.literal('filter'),
    id: z.number().int(),
  }),
  z.object({
    type: z.literal('autoscroll'),
    active: z.boolean(),
  }),
  z.object({
    type: z.literal('ping'),
  }),
  z.object({
    type: z.literal('auth'),
    token: z.string(),
  }),
]);

export type ClientMessage = z.infer<typeof zClientMessage>;
