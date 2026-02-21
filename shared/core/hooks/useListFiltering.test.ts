import { renderHook, act } from '@testing-library/react';
import { useListFiltering, filterByVendor, groupByVendor } from './useListFiltering';

interface TestItem {
  id: number;
  name: string;
  vendorId?: string;
}

const items: TestItem[] = [
  { id: 1, name: 'Global Widget', vendorId: undefined },
  { id: 2, name: 'Acme Bolt', vendorId: 'acme' },
  { id: 3, name: 'Acme Nut', vendorId: 'acme' },
  { id: 4, name: 'Beta Gear', vendorId: 'beta' },
];

const getVendorId = (item: TestItem) => item.vendorId;
const getSearchText = (item: TestItem) => item.name;

describe('useListFiltering', () => {
  it('returns all items when no filter is set', () => {
    const { result } = renderHook(() =>
      useListFiltering({ items, getVendorId })
    );

    expect(result.current.filteredItems).toEqual(items);
    expect(result.current.filteredCount).toBe(4);
    expect(result.current.totalCount).toBe(4);
  });

  it('filters by vendor when filter matches vendor ID', () => {
    const { result } = renderHook(() =>
      useListFiltering({ items, getVendorId, initialFilter: 'acme' })
    );

    // Should include acme items and global items (items without vendor)
    expect(result.current.filteredItems).toEqual([
      items[0], // global
      items[1], // acme
      items[2], // acme
    ]);
  });

  it('returns global items when filter is "global"', () => {
    const { result } = renderHook(() =>
      useListFiltering({ items, getVendorId, initialFilter: 'global' })
    );

    expect(result.current.filteredItems).toEqual([items[0]]);
  });

  it('filters by search text when getSearchText provided without getVendorId', () => {
    const { result } = renderHook(() =>
      useListFiltering({ items, getSearchText, initialFilter: 'bolt' })
    );

    expect(result.current.filteredItems).toEqual([items[1]]);
  });

  it('clearFilter resets the filter', () => {
    const { result } = renderHook(() =>
      useListFiltering({ items, getVendorId, initialFilter: 'acme' })
    );

    expect(result.current.isFiltered).toBe(true);

    act(() => {
      result.current.clearFilter();
    });

    expect(result.current.filter).toBe('');
    expect(result.current.filteredItems).toEqual(items);
    expect(result.current.isFiltered).toBe(false);
  });

  it('isFiltered reflects filter state', () => {
    const { result } = renderHook(() =>
      useListFiltering({ items, getVendorId })
    );

    expect(result.current.isFiltered).toBe(false);

    act(() => {
      result.current.setFilter('acme');
    });

    expect(result.current.isFiltered).toBe(true);
  });

  it('groupedItems groups correctly', () => {
    const { result } = renderHook(() =>
      useListFiltering({ items, getVendorId })
    );

    expect(result.current.groupedItems.global).toEqual([items[0]]);
    expect(result.current.groupedItems.byVendor['acme']).toEqual([items[1], items[2]]);
    expect(result.current.groupedItems.byVendor['beta']).toEqual([items[3]]);
  });
});

describe('filterByVendor', () => {
  it('returns all items for empty filter', () => {
    expect(filterByVendor(items, '', getVendorId)).toEqual(items);
  });

  it('returns all items for "all" filter', () => {
    expect(filterByVendor(items, 'all', getVendorId)).toEqual(items);
  });

  it('returns global items for "global" filter', () => {
    const result = filterByVendor(items, 'global', getVendorId);
    expect(result).toEqual([items[0]]);
  });

  it('returns items matching vendor ID', () => {
    const result = filterByVendor(items, 'acme', getVendorId);
    expect(result).toEqual([items[1], items[2]]);
  });
});

describe('groupByVendor', () => {
  it('groups items by vendor', () => {
    const result = groupByVendor(items, getVendorId);

    expect(result.byVendor['acme']).toEqual([items[1], items[2]]);
    expect(result.byVendor['beta']).toEqual([items[3]]);
  });

  it('puts items without vendor in global', () => {
    const result = groupByVendor(items, getVendorId);

    expect(result.global).toEqual([items[0]]);
  });
});
