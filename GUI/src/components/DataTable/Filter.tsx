import React, { FC, useState, MouseEvent } from 'react';
import { Column, Table } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { MdOutlineSearch } from 'react-icons/md';

import { Icon } from 'components';
import useDocumentEscapeListener from 'hooks/useDocumentEscapeListener';
import DebouncedInput from './DebouncedInput';

type FilterProps = {
  column: Column<any, unknown>;
  table: Table<any>;
};

const Filter: FC<FilterProps> = ({ column, table }) => {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  useDocumentEscapeListener(() => setFilterOpen(false));

  const handleFilterToggle = (e: MouseEvent) => {
    e.stopPropagation();
    setFilterOpen(!filterOpen);
  };

  return (
    <>
      <button onClick={handleFilterToggle}>
        <Icon icon={<MdOutlineSearch fontSize={16} />} size="medium" />
      </button>
      {filterOpen && (
        <div className="data-table__filter">
          {typeof firstValue === 'number' ? (
            <DebouncedInput
              type="number"
              min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
              max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
              value={(columnFilterValue as [number, number])?.[0] ?? ''}
              onChange={(value) =>
                column.setFilterValue((old: [number, number]) => [
                  value,
                  old?.[1],
                ])
              }
            />
          ) : (
            <DebouncedInput
              type="text"
              value={''}
              onChange={(value) => column.setFilterValue(value)}
              placeholder={t('global.search') + '...'}
              // list={column.id + 'list'}
            />
          )}
        </div>
      )}
    </>
  );

  // return typeof firstValue === 'number' ? (
  //   <div>
  //     <div className='flex space-x-2'>
  //       <DebouncedInput
  //         type='number'
  //         min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
  //         max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
  //         value={(columnFilterValue as [number, number])?.[0] ?? ''}
  //         onChange={value =>
  //           column.setFilterValue((old: [number, number]) => [value, old?.[1]])
  //         }
  //         placeholder={`Min ${
  //           column.getFacetedMinMaxValues()?.[0]
  //             ? `(${column.getFacetedMinMaxValues()?.[0]})`
  //             : ''
  //         }`}
  //         className='w-24 border shadow rounded'
  //       />
  //       <DebouncedInput
  //         type='number'
  //         min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
  //         max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
  //         value={(columnFilterValue as [number, number])?.[1] ?? ''}
  //         onChange={value =>
  //           column.setFilterValue((old: [number, number]) => [old?.[0], value])
  //         }
  //         placeholder={`Max ${
  //           column.getFacetedMinMaxValues()?.[1]
  //             ? `(${column.getFacetedMinMaxValues()?.[1]})`
  //             : ''
  //         }`}
  //         className='w-24 border shadow rounded'
  //       />
  //     </div>
  //     <div className='h-1' />
  //   </div>
  // ) : (
  //   <>
  //     <datalist id={column.id + 'list'}>
  //       {sortedUniqueValues.slice(0, 5000).map((value: any) => (
  //         <option value={value} key={value} />
  //       ))}
  //     </datalist>
  //     <DebouncedInput
  //       type='text'
  //       value={(columnFilterValue ?? '') as string}
  //       onChange={value => column.setFilterValue(value)}
  //       placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
  //       className='w-36 border shadow rounded'
  //       list={column.id + 'list'}
  //     />
  //     <div className='h-1' />
  //   </>
  // );
};

export default Filter;
