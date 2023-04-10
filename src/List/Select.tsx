import clsx from 'clsx';
import { createMemo, For } from 'solid-js';
import { uid } from '../utils';

type SelectOption = {
  name: string;
  value: string | number;
};
type SelectOptions = readonly SelectOption[];

type SelectProps<T extends SelectOptions, V = T[number]['value']> = {
  value: V;
  options: T;
  name?: string;
  onChange?: (value: V) => void;
  class?: string;
  disabled?: boolean;
};

export function Select<T extends SelectOptions = []>(props: SelectProps<T>) {
  const name = createMemo(() => props.name ?? uid());
  return (
    <select
      id={name()}
      name={name()}
      value={props.value}
      onInput={(event) => {
        for (const target of props.options) {
          if (target.value.toString() === event.currentTarget.value) {
            props.onChange?.(target.value);
            break;
          }
        }
      }}
      class={clsx(props.class)}
      disabled={props.disabled}
    >
      <For each={props.options}>
        {(item) => {
          return <option value={item.value}>{item.name}</option>;
        }}
      </For>
    </select>
  );
}
