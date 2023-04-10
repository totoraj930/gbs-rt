import { z } from 'zod';
import * as dotenv from 'dotenv';
import { GbsList, zGbsList } from 'gbs-open-lib';
import axios from 'axios';
dotenv.config();

export const zConfig = z.object({
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
  REDIS_PASS: z.string(),
  GBS_LIST: z.string(),
  CACHE_PORT: z.string(),
  SYNC_PORT: z.string(),
});

export const serverEnv = zConfig.parse(process.env);

export let gbsList: GbsList = [];

export async function initGbsList() {
  const res = await axios.get(serverEnv.GBS_LIST);
  gbsList = zGbsList.parse(res.data);
}

export function getEnemyId(name: string, level: string) {
  const enemy = gbsList.find((item) => {
    return (item.en === name || item.ja === name) && item.level === level;
  });
  return enemy?.id ?? -1;
}
