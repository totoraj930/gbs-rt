import type { ClickAction } from '@/Store/settings';

let __num = 0;
export function uid() {
  return ++__num + '-' + Math.random().toString(16).slice(2);
}

export async function hasClipboardPermission() {
  try {
    const res = await navigator.permissions.query({
      name: 'clipboard-write' as PermissionName,
    });
    return res.state === 'granted' || res.state === 'prompt';
  } catch (err) {
    try {
      const ua = window.navigator.userAgent.toLowerCase().trim();
      const is_iOS = /iphone|ipad/.test(ua);
      const is_Android = /android/.test(ua);
      const is_Firefox = /firefox/.test(ua);
      return (!is_iOS && is_Android) || (!is_iOS && is_Firefox);
    } catch {
      /* */
    }
    /* */
  }
  return false;
}

export function getUserLanguage() {
  try {
    return /^ja\b/.test(window.navigator.language) ? 'ja' : 'en';
  } catch {
    return 'ja';
  }
}

export function getUserDarkMode() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function getTimeStr(date: Date = new Date(), short?: boolean) {
  if (short) {
    const YYYY = date.getFullYear();
    const MM = `0${date.getMonth() + 1}`.slice(-2);
    const DD = `0${date.getDate()}`.slice(-2);
    return `${YYYY}-${MM}-${DD}`;
  }
  const hh = `00${date.getHours()}`.slice(-2);
  const mm = `00${date.getMinutes()}`.slice(-2);
  const ss = `00${date.getSeconds()}`.slice(-2);
  const ms = `00${date.getMilliseconds().toString().slice(0, 2)}`.slice(-2);
  return `${hh}:${mm}:${ss}.${ms}`;
}

let prevCopyText = '';
let prevCopyTime = Date.now();
export async function copyText(str: string) {
  if (prevCopyText === str && Date.now() - prevCopyTime < 100)
    return Promise.resolve(false);
  prevCopyTime = Date.now();
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(str);
      prevCopyText = str;
      return true;
    } catch {
      return Promise.resolve(copyTextLegacy(str));
    }
  } else {
    return Promise.resolve(copyTextLegacy(str));
  }
}

export function copyTextLegacy(str: string) {
  try {
    const $p = document.createElement('p');
    $p.textContent = str;
    document.body.append($p);
    const range = document.createRange();
    range.selectNode($p);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    const res = document.execCommand('copy');
    $p.remove();
    prevCopyText = str;
    return res;
  } catch {
    return false;
  }
}

const audioBufferMap: Map<string, AudioBuffer> = new Map();
let audioContext: AudioContext;
let gainNode: GainNode;

export async function initAudioContext() {
  audioContext = new AudioContext();
}

const nowPlaySourceNodes = new Map<string, AudioBufferSourceNode>();

export async function playAudio(url: string, volume: number) {
  if (!audioContext) return () => {};
  if (!gainNode) {
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
  }
  gainNode.gain.value = volume;

  async function getAudioBuffer() {
    let audioBuffer = audioBufferMap.get(url);
    if (!audioBuffer) {
      const res = await fetch(url);
      const arrayBuffer = await res.arrayBuffer();
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      audioBufferMap.set(url, audioBuffer);
      return audioBuffer;
    }
    return audioBuffer;
  }

  // 再生中の同じ音声は止める
  try {
    const nowPlay = nowPlaySourceNodes.get(url);
    if (nowPlay) {
      nowPlay.stop();
    }
  } catch {
    /* */
  }

  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = await getAudioBuffer();
  nowPlaySourceNodes.set(url, sourceNode);
  sourceNode.connect(gainNode);
  sourceNode.start();

  sourceNode.addEventListener('ended', () => {
    nowPlaySourceNodes.delete(url);
  });

  return () => {
    sourceNode.stop();
  };
}

const actionUrls: { [key in ClickAction]: string | null } = {
  copy: null,
  'pc:browser': 'https://game.granbluefantasy.jp/#quest/assist',
  'mobile:mbga': 'https://gbf.game.mbga.jp/#quest/assist',
  'mobile:app': 'mobage-jp-12016007://',
};
// SkyLeap用のwindow.open
let oldWindow: Window | null = null;
let useNewWindow = false;
(function () {
  const ua = window.navigator.userAgent;
  if (ua.match(/Android.+SkyLeap/) || ua.match(/iPhone/)) {
    useNewWindow = true;
  }
  if (ua.match(/Smooz/)) {
    useNewWindow = false;
  }
})();
let prevOpenTime = Date.now();
export function openGbfPage(type: ClickAction) {
  const nowTime = Date.now();
  if (nowTime - prevOpenTime < 500) {
    return;
  }
  prevOpenTime = nowTime;
  const url = actionUrls[type];
  if (!url) return;
  if (useNewWindow) {
    if (oldWindow && !oldWindow.closed) oldWindow.close();
    oldWindow = window.open(url, 'gbs-' + Date.now());
  } else {
    window.open(url, 'gbs');
  }

  // スマホでアプリ版を開いてたら1秒後にwindowを閉じる
  if (type === 'mobile:app') {
    setTimeout(() => {
      if (oldWindow && !oldWindow.closed) {
        oldWindow.close();
      }
    }, 1000);
  }
}
