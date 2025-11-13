'use client';

import { Listbox, Transition } from '@headlessui/react';
import type { ReactNode } from 'react';
import { Fragment } from 'react';

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export type FormSelectOption<TValue> = {
  value: TValue;
  label: ReactNode;
  description?: ReactNode;
  key?: string | number;
  disabled?: boolean;
};

export type FormSelectProps<TValue> = {
  value: TValue;
  onChange: (value: TValue) => void;
  options: Array<FormSelectOption<TValue>>;
  placeholder?: ReactNode;
  id?: string;
  buttonClassName?: string;
  optionClassName?: string;
  listClassName?: string;
  disabled?: boolean;
  renderValue?: (option: FormSelectOption<TValue>) => ReactNode;
  by?: (a: TValue, b: TValue) => boolean;
};

export function FormSelect<TValue>({
  value,
  onChange,
  options,
  placeholder,
  id,
  buttonClassName,
  optionClassName,
  listClassName,
  disabled,
  renderValue,
  by,
}: FormSelectProps<TValue>) {
  const activeOption = options.find((option) =>
    by ? by(option.value, value) : option.value === value,
  );

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled} by={by}>
      <div className="relative">
        <Listbox.Button
          id={id}
          className={classNames(
            'relative w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-zinc-100 shadow-inner shadow-white/5 transition focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50',
            buttonClassName,
          )}
        >
          <span className="block truncate">
            {activeOption
              ? renderValue
                ? renderValue(activeOption)
                : activeOption.label
              : (placeholder ?? 'Select...')}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-500">
            ▾
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className={classNames(
              'absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-2xl border border-white/10 bg-zinc-900/95 p-2 text-sm shadow-lg shadow-indigo-500/20 focus:outline-none',
              listClassName,
            )}
          >
            {options.map((option, index) => (
              <Listbox.Option
                key={option.key ?? index}
                value={option.value}
                disabled={option.disabled}
                className={({ active, selected, disabled: isDisabled }) =>
                  classNames(
                    'cursor-pointer rounded-xl px-3 py-2 transition',
                    selected && 'bg-indigo-500/20 text-white',
                    active && !selected && 'bg-indigo-500/10 text-zinc-100',
                    isDisabled && 'cursor-not-allowed opacity-50',
                    optionClassName,
                  )
                }
              >
                <div className="flex flex-col">
                  <span className="font-medium">{option.label}</span>
                  {option.description ? (
                    <span className="text-xs text-zinc-500">
                      {option.description}
                    </span>
                  ) : null}
                </div>
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
