import { forwardRef, ReactNode, SelectHTMLAttributes, useId, useState } from 'react';
import { useSelect } from 'downshift';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { MdArrowDropDown } from 'react-icons/md';

import { Icon } from 'components';
import './FormSelect.scss';
import { ControllerRenderProps } from 'react-hook-form';

type FormSelectProps = Partial<ControllerRenderProps> & SelectHTMLAttributes<HTMLSelectElement> & {
  label: ReactNode;
  name: string;
  hideLabel?: boolean;
  direction?: 'down' | 'up';
  options: {
    label: string;
    value: string;
  }[];
  onSelectionChange?: (selection: { label: string, value: string } | null) => void;
}

const itemToString = (item: ({ label: string, value: string } | null)) => {
  return item ? item.value : '';
};

const FormSelect= forwardRef<HTMLSelectElement, FormSelectProps>((
  {
    label,
    hideLabel,
    direction = 'down',
    options,
    disabled,
    placeholder,
    defaultValue,
    onSelectionChange,
    ...rest
  },
  ref
) => {
  const id = useId();
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
    id,
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
    <div className={selectClasses} style={rest.style}>
      {label && !hideLabel && <label htmlFor={id} className='select__label' {...getLabelProps()}>{label}</label>}
      <div className='select__wrapper' >
        <div className='select__trigger' {...getToggleButtonProps()}>
          {selectedItem?.label ?? placeholderValue}
          <Icon label='Dropdown icon' size='medium' icon={<MdArrowDropDown color='#5D6071' />} />
        </div>
        <ul ref={ref} className={direction === 'down' ? 'select__menu' : 'select__menu_up'} {...getMenuProps()}>
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
});


export default FormSelect;
