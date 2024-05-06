import { FC, ReactNode, SelectHTMLAttributes, useId, useState } from 'react';
import { useSelect } from 'downshift';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { MdArrowDropDown } from 'react-icons/md';

import { Icon } from 'components';
import './FormSelect.scss';

type SelectOption = { label: string, value: string };

type FormMultiselectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: ReactNode;
  name: string;
  placeholder?: string;
  hideLabel?: boolean;
  options: SelectOption[];
  selectedOptions?: SelectOption[];
  onSelectionChange?: (selection: SelectOption[] | null) => void;
};

const FormMultiselect: FC<FormMultiselectProps> = (
  {
    label,
    hideLabel,
    options,
    disabled,
    placeholder,
    defaultValue,
    selectedOptions,
    onSelectionChange,
    ...rest
  },
) => {
  const id = useId();
  const { t } = useTranslation();
  const [selectedItems, setSelectedItems] = useState<SelectOption[]>(selectedOptions ?? []);
  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({
    items: options,
    stateReducer: (state, actionAndChanges) => {
      const { changes, type } = actionAndChanges;
      if (type === useSelect.stateChangeTypes.ItemClick) {
        return {
          ...changes,
          isOpen: true,
          highlightedIndex: state.highlightedIndex,
        };
      } else {
         return changes;
      }
    },
    selectedItem: null,
    onSelectedItemChange: ({ selectedItem }) => {
      if (!selectedItem) {
        return;
      }
      const index = selectedItems.findIndex((item) => item.value === selectedItem.value);
      const items = [];
      if (index > 0) {
        items.push(
          ...selectedItems.slice(0, index),
          ...selectedItems.slice(index + 1)
        );
      } else if (index === 0) {
        items.push(...selectedItems.slice(1));
      } else {
        items.push(...selectedItems, selectedItem);
      }
      setSelectedItems(items);
      if (onSelectionChange) onSelectionChange(items);
    },
  });

  const selectClasses = clsx(
    'select',
    disabled && 'select--disabled',
  );

  const placeholderValue = placeholder || t('global.choose');

  return (
    <div className={selectClasses} style={rest.style}>
      {label && !hideLabel && <label htmlFor={id} className='select__label' {...getLabelProps()}>{label}</label>}
      <div className='select__wrapper'>
        <div className='select__trigger' {...getToggleButtonProps()}>
          {selectedItems.length > 0 ? `${t('global.chosen')} (${selectedItems.length})` : placeholderValue}
          <Icon label='Dropdown icon' size='medium' icon={<MdArrowDropDown color='#5D6071' />} />
        </div>

        <ul className='select__menu' {...getMenuProps()}>
          {isOpen &&
            options.map((item, index) => (
              <li
                key={`${item.label}-${index}`}
                className={clsx('select__option', { 'select__option--selected': highlightedIndex === index })}
                {...getItemProps({
                  item,
                  index,
                })}
              >
                <input
                  type='checkbox'
                  checked={selectedItems.map((s) => s.value).includes(item.value)}
                  value={item.value}
                  onChange={() => null}
                />
                <span>{item.label}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};


export default FormMultiselect;
