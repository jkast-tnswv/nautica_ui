import { renderHook, act } from '@testing-library/react';
import { useTableFeatures } from './useTableFeatures';

interface Item {
  id: number;
  name: string;
  category: string;
}

const data: Item[] = [
  { id: 1, name: 'Alpha', category: 'A' },
  { id: 2, name: 'Beta', category: 'B' },
  { id: 3, name: 'Gamma', category: 'A' },
  { id: 4, name: 'Delta', category: 'B' },
  { id: 5, name: 'Epsilon', category: 'A' },
];

const getSearchText = (r: Item) => `${r.name} ${r.category}`;

describe('useTableFeatures', () => {
  it('returns all data when no search, filter, or pagination', () => {
    const { result } = renderHook(() =>
      useTableFeatures({ data, searchQuery: '', getSearchText }),
    );
    expect(result.current.displayData).toEqual(data);
    expect(result.current.totalCount).toBe(5);
    expect(result.current.filteredCount).toBe(5);
  });

  it('filters data by search query', () => {
    const { result } = renderHook(() =>
      useTableFeatures({ data, searchable: true, searchQuery: 'alpha', getSearchText }),
    );
    expect(result.current.displayData).toHaveLength(1);
    expect(result.current.displayData[0].name).toBe('Alpha');
    expect(result.current.filteredCount).toBe(1);
    expect(result.current.totalCount).toBe(5);
  });

  it('search is case-insensitive', () => {
    const { result } = renderHook(() =>
      useTableFeatures({ data, searchable: true, searchQuery: 'BETA', getSearchText }),
    );
    expect(result.current.displayData).toHaveLength(1);
    expect(result.current.displayData[0].name).toBe('Beta');
  });

  it('applies column filters', () => {
    const columnFilters = [{ columnIndex: 0, getValue: (r: Item) => r.category }];
    const activeFilters = new Map([[0, new Set(['A'])]]);
    const { result } = renderHook(() =>
      useTableFeatures({ data, searchQuery: '', getSearchText, columnFilters, activeFilters }),
    );
    expect(result.current.displayData).toHaveLength(3);
    expect(result.current.displayData.every(r => r.category === 'A')).toBe(true);
  });

  it('combines search and column filters', () => {
    const columnFilters = [{ columnIndex: 0, getValue: (r: Item) => r.category }];
    const activeFilters = new Map([[0, new Set(['A'])]]);
    const { result } = renderHook(() =>
      useTableFeatures({
        data,
        searchable: true,
        searchQuery: 'gamma',
        getSearchText,
        columnFilters,
        activeFilters,
      }),
    );
    expect(result.current.displayData).toHaveLength(1);
    expect(result.current.displayData[0].name).toBe('Gamma');
  });

  it('paginates correctly', () => {
    const { result } = renderHook(() =>
      useTableFeatures({ data, searchQuery: '', getSearchText, paginate: true, pageSize: 2 }),
    );
    expect(result.current.displayData).toHaveLength(2);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.startIndex).toBe(1);
    expect(result.current.endIndex).toBe(2);
  });

  it('navigates to another page', () => {
    const { result } = renderHook(() =>
      useTableFeatures({ data, searchQuery: '', getSearchText, paginate: true, pageSize: 2 }),
    );
    act(() => result.current.setCurrentPage(2));
    expect(result.current.currentPage).toBe(2);
    expect(result.current.displayData).toHaveLength(2);
    expect(result.current.displayData[0].name).toBe('Gamma');
    expect(result.current.startIndex).toBe(3);
    expect(result.current.endIndex).toBe(4);
  });

  it('last page has remaining items', () => {
    const { result } = renderHook(() =>
      useTableFeatures({ data, searchQuery: '', getSearchText, paginate: true, pageSize: 2 }),
    );
    act(() => result.current.setCurrentPage(3));
    expect(result.current.displayData).toHaveLength(1);
    expect(result.current.displayData[0].name).toBe('Epsilon');
  });

  it('returns all data when paginate is false', () => {
    const { result } = renderHook(() =>
      useTableFeatures({ data, searchQuery: '', getSearchText, paginate: false }),
    );
    expect(result.current.displayData).toHaveLength(5);
    expect(result.current.totalPages).toBe(1);
  });

  it('handles empty data array', () => {
    const { result } = renderHook(() =>
      useTableFeatures({ data: [], searchQuery: '', getSearchText }),
    );
    expect(result.current.displayData).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.filteredCount).toBe(0);
  });

  it('handles pageSize larger than data', () => {
    const { result } = renderHook(() =>
      useTableFeatures({ data, searchQuery: '', getSearchText, paginate: true, pageSize: 100 }),
    );
    expect(result.current.displayData).toHaveLength(5);
    expect(result.current.totalPages).toBe(1);
  });

  it('verifies correct items on page 2', () => {
    const { result } = renderHook(() =>
      useTableFeatures({ data, searchQuery: '', getSearchText, paginate: true, pageSize: 2 }),
    );
    act(() => result.current.setCurrentPage(2));
    expect(result.current.displayData.map(d => d.name)).toEqual(['Gamma', 'Delta']);
  });
});
