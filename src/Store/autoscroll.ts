import { createEffect, createSignal } from 'solid-js';
import { sendMessage } from './ws';

const [autoscroll, setAutoscroll] = createSignal(true);
export { autoscroll };

createEffect(() => {
  sendMessage({
    type: 'autoscroll',
    active: autoscroll(),
  });
});

const observer = new MutationObserver(onChange);

let prevClickTime = 0;
function onChange() {
  const $input: HTMLInputElement | null =
    document.querySelector('input#autoscroll');

  if ($input) {
    setAutoscroll($input.checked);
  }

  const $totop: HTMLParagraphElement | null =
    document.querySelector('#totop > a');

  if ($totop && $totop.querySelector('p')) {
    if (Date.now() - prevClickTime > 1000) {
      $totop.click();
      prevClickTime = Date.now();
    }
  }

  const $spLoadNew: HTMLAnchorElement | null = document.querySelector(
    '#nsr div[class^=LoadNewTimeline] a'
  );

  if ($spLoadNew) {
    if (Date.now() - prevClickTime > 1000) {
      $spLoadNew.click();
      prevClickTime = Date.now();
    }
  }
}

export function initAutoscrollObserver() {
  const $target: HTMLDivElement | null = document.querySelector('div#contents');
  observer.observe($target!, {
    childList: true,
    attributes: true,
    subtree: true,
  });
  onChange();
}

export function toggleAutoscroll(active: boolean) {
  const $input: HTMLInputElement | null =
    document.querySelector('input#autoscroll');
  if (!$input) return null;

  if ($input.checked !== active) {
    $input.click();
  }
}
