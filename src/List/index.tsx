import { For, createSignal } from 'solid-js';
import { styled } from 'solid-styled-components';
import { Select } from './Select';
import { filteredGbsList, searchTag, setSearchTag } from '@/Store/gbsList';

const tagOps = [
  { value: 'All', name: '全て' },
  { value: 'ヒヒイロカネ', name: 'ヒヒイロカネ' + '⭐' },
  { value: '刻の流砂', name: '刻の流砂' + '⌛' },
  { value: '六竜', name: '六竜' },
  { value: 'エニアド', name: 'エニアド' },
  { value: 'マグナⅡ', name: 'マグナⅡ' },
  { value: 'マグナ', name: 'マグナ' },
  { value: 'マリス', name: 'マリス' },
  { value: '新石', name: '新石' },
  { value: '四大天司', name: '四大天司' },
  { value: 'イベント', name: 'イベント' },
  { value: '四象降臨', name: '四象降臨' },
  { value: '古戦場', name: '古戦場' },
  { value: 'ゼノ', name: 'ゼノ' },
  { value: 'レヴァンス', name: 'レヴァンス' },
  { value: 'その他', name: 'その他' },
  { value: '高難易度', name: '高難易度' },
  { value: 'Manual', name: '手動入力' + '📝' },
];

type Props = {
  onClose: () => void;
};
export function GbsList(props: Props) {
  return (
    <Wrap>
      <div class="header">
        <button onClick={() => props.onClose()}>閉じる</button>
        <Select
          options={tagOps}
          value={searchTag()}
          onChange={(tag) => setSearchTag(tag)}
        />
      </div>

      <ul>
        <For each={filteredGbsList()}>
          {(item) => {
            const name = item.ja;
            const level = item.level === '???' ? '' : `Lv${item.level}`;
            const p = `"${level} ${name}" ID`;
            const url = new URL(window.location.href);
            const params = url.searchParams;
            params.set('p', p);
            params.set('md', 't');
            const href = url.href;

            return (
              <li>
                <a href={href}>
                  Lv.{item.level} {item.ja}
                </a>
              </li>
            );
          }}
        </For>
      </ul>
    </Wrap>
  );
}

const Wrap = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: #222;
  color: #fff;
  z-index: 9999;
  overflow-y: scroll;
  > .header {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px;
  }

  > ul {
    display: flex;
    flex-direction: column;
    > li {
      a,
      a:link,
      a:visited {
        display: inline-block;
        padding: 10px 10px;
        color: #00ffff;
      }
      border-bottom: 1px solid #333;
    }
  }
`;
