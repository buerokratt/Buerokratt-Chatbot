import React, { FC, useMemo, useState, MouseEvent } from 'react';
import { Column, Table } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { MdOutlineSearch } from 'react-icons/md';

import { Icon } from 'components';
import useDocumentEscapeListener from 'hooks/useDocumentEscapeListener';
import DebouncedInput from './DebouncedInput';

type FilterProps = {
  column: Column<any, unknown>
  table: Table<any>
}

const Filter: FC<FilterProps> = ({ column, table }) => {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  useDocumentEscapeListener(() => setFilterOpen(false));

  const sortedUniqueValues = useMemo(
    () =>
      typeof firstValue === 'number'
        ? []
        : Array.from(column.getFacetedUniqueValues().keys()).sort(),
    [column.getFacetedUniqueValues()],
  );

  const handleFilterToggle = (e: MouseEvent) => {
    e.stopPropagation();
    setFilterOpen(!filterOpen);
  };

  return (
    <>
      <button onClick={handleFilterToggle}>
        <Icon icon={<MdOutlineSearch fontSize={16} />} size='medium' />
      </button>
      {filterOpen && (
        <div className='data-table__filter'>
          {typeof firstValue === 'number' ? (
            <DebouncedInput
              type='number'
              min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
              max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
              value={(columnFilterValue as [number, number])?.[0] ?? ''}
              onChange={value =>
                column.setFilterValue((old: [number, number]) => [value, old?.[1]])
              }
            />
          ) : (
            <DebouncedInput
              type='text'
              value={(columnFilterValue ?? '') as string}
              onChange={value => column.setFilterValue(value)}
              placeholder={String(column.columnDef.header)}
            />
          )}
        </div>
      )}
    </>
  );
};

export default Filter;
