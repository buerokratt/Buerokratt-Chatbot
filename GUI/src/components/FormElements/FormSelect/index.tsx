import { FC, SelectHTMLAttributes, useState } from 'react';
import { useSelect } from 'downshift';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { MdArrowDropDown } from 'react-icons/md';

import { Icon } from 'components';
import './FormSelect.scss';


type FormSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  name: string;
  hideLabel?: boolean;
  options: {
    label: string;
    value: string;
  }[];
  onSelectionChange?: (selection: { label: string, value: string } | null) => void;
}

const itemToString = (item: ({ label: string, value: string } | null)) => {
  return item ? item.value : '';
};

const FormSelect: FC<FormSelectProps> = (
  {
    label,
    name,
    hideLabel,
    options,
    disabled,
    placeholder,
    defaultValue,
    onSelectionChange,
  },
) => {
  const { t } = useTranslation();
  const defaultSelected = options.find((o) => o.value === defaultValue) || null;
  const [selectedItem, setSelectedItem] = useState<{ label: string, value: string } | null>(defaultSelected);
  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({
    items: options,
    itemToString,
    selectedItem,
    onSelectedItemChange: ({ selectedItem: newSelectedItem }) => {
      setSelectedItem(newSelectedItem ?? null);
      if (onSelectionChange) onSelectionChange(newSelectedItem ?? null);
    },
  });

  const selectClasses = clsx(
    'select',
    disabled && 'select--disabled',
  );

  const placeholderValue = placeholder || t('global.choose');

  return (
    <div className={selectClasses}>
      {label && !hideLabel && <label htmlFor={name} className='select__label' {...getLabelProps()}>{label}</label>}
      <div className='select__wrapper'>
        <div className='select__trigger' {...getToggleButtonProps()}>
          {selectedItem?.label ?? placeholderValue}
          <Icon label='Dropdown icon' size='medium' icon={<MdArrowDropDown color='#5D6071' />} />
        </div>
        <ul className='select__menu' {...getMenuProps()}>
          {isOpen && (
            options.map((item, index) => (
              <li className={clsx('select__option', { 'select__option--selected': highlightedIndex === index })}
                  key={`${item.value}${index}`} {...getItemProps({ item, index })}>
                {item.label}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};


export default FormSelect;
