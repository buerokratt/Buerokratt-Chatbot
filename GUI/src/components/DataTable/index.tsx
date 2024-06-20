import React, { CSSProperties, FC, ReactNode, useId } from 'react';
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
  FilterFn,
  getFilteredRowModel,
  VisibilityState,
  getPaginationRowModel,
  PaginationState,
  TableMeta,
  Row,
  RowData, ColumnFiltersState,
  ColumnPinningState,
} from '@tanstack/react-table';
import {
  RankingInfo,
  rankItem,
} from '@tanstack/match-sorter-utils';
import {
  MdUnfoldMore,
  MdExpandMore,
  MdExpandLess,
  MdOutlineEast,
  MdOutlineWest,
} from 'react-icons/md';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Icon, Track } from 'components';
import Filter from './Filter';
import './DataTable.scss';

type DataTableProps = {
  data: any;
  columns: ColumnDef<any, any>[];
  tableBodyPrefix?: ReactNode;
  isClientSide?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: PaginationState;
  sorting?: SortingState;
  columnPinning?: ColumnPinningState;
  setPagination?: (state: PaginationState) => void;
  setSorting?: (state: SortingState) => void;
  globalFilter?: string;
  setGlobalFilter?: React.Dispatch<React.SetStateAction<string>>;
  columnVisibility?: VisibilityState;
  setColumnVisibility?: React.Dispatch<React.SetStateAction<VisibilityState>>;
  disableHead?: boolean;
  pagesCount?: number;
  meta?: TableMeta<any>;
};

type ColumnMeta = {
  meta: {
    size: number | string;
    sticky: 'left' | 'right';
  };
};

type CustomColumnDef = ColumnDef<any> & ColumnMeta;

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }

  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    getRowStyles: (row: Row<TData>) => CSSProperties;
  }
  class Column<TData extends RowData> {
    columnDef: CustomColumnDef;
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({
    itemRank,
  });
  return itemRank.passed;
};

const DataTable: FC<DataTableProps> = (
  {
    data,
    columns,
    isClientSide = true,
    tableBodyPrefix,
    sortable,
    filterable,
    pagination,
    sorting,
    columnPinning,
    setPagination,
    setSorting,
    globalFilter,
    setGlobalFilter,
    columnVisibility,
    setColumnVisibility,
    disableHead,
    pagesCount,
    meta,
  },
) => {
  const id = useId();
  const { t } = useTranslation();
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnPinning: columnPinning ?? {
        left: [],
        right: [],
      },
      columnVisibility,
      ...{ pagination },
    },
    enableColumnPinning: columnPinning != undefined ? true : false,
    meta,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: fuzzyFilter,
    onSortingChange: (updater) => {
      if (typeof updater !== 'function') return;
      setSorting?.(updater(table.getState().sorting));
    },
    onPaginationChange: (updater) => {
      if (typeof updater !== 'function') return;
      setPagination?.(updater(table.getState().pagination));
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(pagination && { getPaginationRowModel: getPaginationRowModel() }),
    ...(sortable && { getSortedRowModel: getSortedRowModel() }),
    manualPagination: isClientSide ? undefined : true,
    manualSorting: isClientSide ? undefined : true,
    pageCount: isClientSide ? undefined : pagesCount,
  });

  return (
    <div className='data-table__scrollWrapper'>
      <table className='data-table'>
        {!disableHead && (
          <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} style={{ width: header.column.columnDef.meta?.size, position: header.column.columnDef.meta?.sticky ? 'sticky' : undefined , 
                  left: header.column.columnDef.meta?.sticky === 'left' ? `${header.column.getAfter('left') * 0.675}px` : undefined, 
                  right: header.column.columnDef.meta?.sticky === 'right' ? `${header.column.getAfter('right') * 0.675}px` : undefined,
                  backgroundColor: 'white', zIndex: header.column.columnDef.meta?.sticky ? 1 : 0 }}>
                  {header.isPlaceholder ? null : (
                      <Track gap={8}>
                        {sortable && header.column.getCanSort() && (
                          <button onClick={header.column.getToggleSortingHandler()}>
                            {{
                              asc: <Icon icon={<MdExpandMore fontSize={20} />} size='medium' />,
                              desc: <Icon icon={<MdExpandLess fontSize={20} />} size='medium' />,
                            }[header.column.getIsSorted() as string] ?? (
                              <Icon icon={<MdUnfoldMore fontSize={22} />} size='medium' />
                            )}
                          </button>
                        )}
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {filterable && header.column.getCanFilter() && (
                          <Filter column={header.column} table={table} />
                        )}
                      </Track>
                  )}
                </th>
              ))}
            </tr>
          ))}
          </thead>
        )}
        <tbody>
        {tableBodyPrefix}
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} style={table.options.meta?.getRowStyles(row)}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} style={{position: cell.column.columnDef.meta?.sticky ? 'sticky' : undefined , 
                  left: cell.column.columnDef.meta?.sticky === 'left' ? `${cell.column.getAfter('left') * 0.675}px` : undefined, 
                  right: cell.column.columnDef.meta?.sticky === 'right' ? `${cell.column.getAfter('right') * 0.675}px` : undefined,
                  backgroundColor: 'white', zIndex: cell.column.columnDef.meta?.sticky ? 1 : 0}} >{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
        </tbody>
      </table>
      {pagination && (
        <div className='data-table__pagination-wrapper'>
          {(table.getPageCount() * table.getState().pagination.pageSize) > table.getState().pagination.pageSize && (
            <div className='data-table__pagination'>
              <button
                className='previous'
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <MdOutlineWest />
              </button>
              <nav role='navigation' aria-label={t('global.paginationNavigation') ?? ''}>
                <ul className='links'>
                  {[...Array(table.getPageCount())].map((_, index) => (
                    <li
                      key={`${id}-${index}`}
                      className={clsx({ 'active': table.getState().pagination.pageIndex === index })}
                    >
                      <Link
                        to={`?page=${index + 1}`}
                        onClick={() => table.setPageIndex(index)}
                        aria-label={t('global.gotoPage') + index}
                        aria-current={table.getState().pagination.pageIndex === index}
                      >
                        {index + 1}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <button
                className='next'
                onClick={() => {
                  table.nextPage();
                }}
                disabled={!table.getCanNextPage()}
              >
                <MdOutlineEast />
              </button>
            </div>
          )}
          <div className='data-table__page-size'>
            <label htmlFor={id}>{t('global.resultCount')}</label>
            <select
              id={id}
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
