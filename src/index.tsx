import z from 'zod';
import { render } from 'solid-js/web';
import { App } from './App';
import { gbsList, loadGbsList } from './Store/gbsList';
import { filterId, setFilterId } from './Store/settings';

async function main() {
  await loadGbsList();

  checkUrl();

  console.log(filterId());

  const root = document.createElement('div');
  root.id = 'gbs-root';
  const $main = document.querySelector('#contentsBody div.main');

  const $spMain = document.querySelector('.s #contents');

  if ($main) {
    const $tab = $main.querySelector('div[class^=Tab_TabContainer]')!;
    $main.insertBefore(root, $tab);
  } else if ($spMain) {
    const $tab = $spMain.querySelector('#contentsInner');
    $tab?.prepend(root);
  }

  render(() => <App />, root);
}

main();

function checkUrl() {
  const url = new URL(window.location.href);
  if (!isRealtimePage(url)) return;
  const enemy = getEnemyFromUrl(url);
  setFilterId(enemy?.id ?? -1);
}

function isRealtimePage(url: URL) {
  if (url.host !== 'search.yahoo.co.jp') return false;
  if (url.pathname !== '/realtime/search') return false;
  return true;
}

function getEnemyFromUrl(url: URL) {
  const p = url.searchParams.get('p');
  const md = url.searchParams.get('md');

  if (!p) return null;
  if (md && md === 'h') return null;

  const text = decodeURIComponent(p);

  // "Lv200 アーカーシャ"
  const regex1 = /"(Lv[0-9]+\s|)(.+)"/;

  if (text && regex1.test(text)) {
    const [, lv, ja] = text.match(regex1)!;
    const level = (lv ?? '').match(/[0-9]+/)?.[0] ?? '???';
    const enemy = gbsList().find((item) => {
      const matchLv = item.level === level;
      const matchName = item.ja === ja;
      return matchLv && matchName;
    });
    return enemy ?? null;
  } else {
    return null;
  }
}
