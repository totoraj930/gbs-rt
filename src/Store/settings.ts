import { createEffect, createSignal, on } from 'solid-js';
import { createStore } from 'solid-js/store';
import { autoscroll, toggleAutoscroll } from './autoscroll';
import { hasClipboardPermission } from '@/utils';
import { z } from 'zod';

const [hasFocus, setHasFocus] = createSignal(true);
export { hasFocus };
const onFocus = () => {
  setHasFocus(true);
};
const onBlur = () => setHasFocus(false);
export function initFocusDetector() {
  window.removeEventListener('focus', onFocus);
  window.removeEventListener('blur', onBlur);
  window.addEventListener('focus', onFocus);
  window.addEventListener('blur', onBlur);
}

const [autoTiming, setAutoTiming] = createSignal<number | null>(0);
createEffect(
  on([autoTiming, hasFocus], ([timing, focus]) => {
    if (timing === null) {
      toggleAutoscroll(false);
      return;
    }
    if (focus && !autoscroll()) {
      toggleAutoscroll(true);
    }
  })
);

/**
 * Permissions APIでclipboard-writeが許可されているか
 */
const [canAutoCopy, setCanAutoCopy] = createSignal(false);
export { canAutoCopy };
export async function initAutoCopy() {
  setCanAutoCopy(await hasClipboardPermission());
}

export const [filterId, setFilterId] = createSignal(-1);

export const zClickAction = z.enum([
  'copy',
  'pc:browser',
  'mobile:mbga',
  'mobile:app',
]);
export type ClickAction = z.infer<typeof zClickAction>;

export const zSettings = z.object({
  clickAction: zClickAction.default('copy'),
  duplicate: z.enum(['all', 'latest']).default('latest'),
  autoCopy: z.boolean().default(false),
  date24: z.boolean().default(false),
  showImage: z.boolean().default(false),
});
export type Settings = z.infer<typeof zSettings>;

export const [settings, setSettings] = createStore(zSettings.parse({}));
