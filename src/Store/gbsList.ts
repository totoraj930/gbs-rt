import { createSignal, createMemo } from 'solid-js';
import { EnemyElement, zGbsListItem, zGbsList, GbsList } from 'gbs-open-lib';
export { EnemyElement, zGbsListItem };
export type { GbsList };

export const [gbsList, setGbsList] = createSignal<GbsList>([]);

export async function loadGbsList() {
  const url = 'https://gbs-open.eriri.net/api/list/list.json';
  try {
    const res = await fetch(url);
    const rawJson = await res.json();
    const list = zGbsList.parse(rawJson);
    setGbsList(
      list
        .sort((a, b) => {
          const aNum = Number.parseInt(a.level);
          const bNum = Number.parseInt(b.level);
          if (!Number.isFinite(bNum)) return -1;
          if (aNum < bNum) return -1;
          else if (aNum > bNum) return 1;
          return 0;
        })
        .sort((a, b) => a.attr - b.attr)
    );
  } catch (err) {
    console.error(err);
  }
}

export const [searchText, setSearchText] = createSignal('');
export const [searchTag, setSearchTag] = createSignal('All');

export const filteredGbsList = createMemo(() => {
  return gbsList().filter((item) => {
    if (item.tags.includes('hide')) return false;
    if (searchTag() !== 'All' && !item.tags.includes(searchTag())) return false;
    if (
      !item.ja.toLowerCase().includes(searchText().toLowerCase()) &&
      !item.en.toLowerCase().includes(searchText().toLowerCase())
    )
      return false;
    return true;
  });
});
