import { render, screen, fireEvent, within, waitFor, act } from '@testing-library/react';
import { Table, SimpleTable, Cell } from './Table';
import type { TableColumn, TableAction } from './Table';

// jsdom doesn't have ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof globalThis.ResizeObserver;

interface TestRow {
  id: number;
  name: string;
  status: string;
}

const sampleData: TestRow[] = [
  { id: 1, name: 'Alpha', status: 'active' },
  { id: 2, name: 'Beta', status: 'inactive' },
  { id: 3, name: 'Charlie', status: 'active' },
];

const columns: TableColumn<TestRow>[] = [
  { header: 'Name', accessor: 'name' },
  { header: 'Status', accessor: 'status' },
];

const getRowKey = (row: TestRow) => row.id;

describe('Table', () => {
  it('renders column headers and data', () => {
    render(<Table data={sampleData} columns={columns} getRowKey={getRowKey} paginate={false} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('renders empty message when data is empty', () => {
    render(<Table data={[]} columns={columns} getRowKey={getRowKey} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders custom empty message', () => {
    render(<Table data={[]} columns={columns} getRowKey={getRowKey} emptyMessage="Nothing here" emptyDescription="Add something" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Add something')).toBeInTheDocument();
  });

  it('applies compact class', () => {
    const { container } = render(<Table data={sampleData} columns={columns} getRowKey={getRowKey} compact paginate={false} />);
    expect(container.querySelector('.data-table-compact')).toBeInTheDocument();
  });

  it('applies striped class', () => {
    const { container } = render(<Table data={sampleData} columns={columns} getRowKey={getRowKey} striped paginate={false} />);
    expect(container.querySelector('.data-table-striped')).toBeInTheDocument();
  });

  it('applies hoverable class by default', () => {
    const { container } = render(<Table data={sampleData} columns={columns} getRowKey={getRowKey} paginate={false} />);
    expect(container.querySelector('.data-table-hoverable')).toBeInTheDocument();
  });

  it('calls onRowClick when row clicked', () => {
    const onClick = vi.fn();
    render(<Table data={sampleData} columns={columns} getRowKey={getRowKey} onRowClick={onClick} paginate={false} />);
    fireEvent.click(screen.getByText('Alpha'));
    expect(onClick).toHaveBeenCalledWith(sampleData[0]);
  });

  it('renders function accessor columns', () => {
    const cols: TableColumn<TestRow>[] = [
      { header: 'Display', accessor: (row) => `${row.name} (${row.status})` },
    ];
    render(<Table data={sampleData} columns={cols} getRowKey={getRowKey} paginate={false} />);
    expect(screen.getByText('Alpha (active)')).toBeInTheDocument();
  });

  it('renders edit and delete action buttons', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const { container } = render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} onEdit={onEdit} onDelete={onDelete} paginate={false} />,
    );
    const actionCells = container.querySelectorAll('.table-actions');
    expect(actionCells).toHaveLength(3);
    const firstRowButtons = actionCells[0].querySelectorAll('button');
    expect(firstRowButtons.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(firstRowButtons[0]); // edit button
    expect(onEdit).toHaveBeenCalledWith(sampleData[0]);
  });

  it('calls onDelete directly when no confirm message', () => {
    const onDelete = vi.fn();
    const { container } = render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} onDelete={onDelete} paginate={false} />,
    );
    const actionCells = container.querySelectorAll('.table-actions');
    const deleteBtn = actionCells[1].querySelector('button')!;
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith(sampleData[1]);
  });

  it('shows confirm dialog when delete with confirm message', async () => {
    const onDelete = vi.fn();
    const { container } = render(
      <Table
        data={sampleData}
        columns={columns}
        getRowKey={getRowKey}
        onDelete={onDelete}
        deleteConfirmMessage={(row) => `Delete ${row.name}?`}
        paginate={false}
      />,
    );
    const actionCells = container.querySelectorAll('.table-actions');
    const deleteBtn = actionCells[0].querySelector('button')!;
    fireEvent.click(deleteBtn);
    await waitFor(() => {
      expect(screen.getByText('Delete Alpha?')).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Delete'));
    });
    expect(onDelete).toHaveBeenCalledWith(sampleData[0]);
  });

  it('disables delete when deleteDisabled returns true', () => {
    const { container } = render(
      <Table
        data={sampleData}
        columns={columns}
        getRowKey={getRowKey}
        onDelete={() => {}}
        deleteDisabled={(row) => row.status === 'active'}
        paginate={false}
      />,
    );
    const actionCells = container.querySelectorAll('.table-actions');
    const deleteBtn = actionCells[0].querySelector('button')!;
    expect(deleteBtn).toBeDisabled();
    const deleteBtn2 = actionCells[1].querySelector('button')!;
    expect(deleteBtn2).not.toBeDisabled();
  });

  it('renders custom actions', () => {
    const onClick = vi.fn();
    render(
      <Table
        data={sampleData}
        columns={columns}
        getRowKey={getRowKey}
        actions={[{ icon: 'star', label: 'Star', onClick }]}
        paginate={false}
      />,
    );
    const buttons = screen.getAllByTitle('Star');
    expect(buttons).toHaveLength(3);
  });

  it('renders renderActions alternative', () => {
    render(
      <Table
        data={sampleData}
        columns={columns}
        getRowKey={getRowKey}
        renderActions={(row) => <button>Custom {row.name}</button>}
        paginate={false}
      />,
    );
    expect(screen.getByText('Custom Alpha')).toBeInTheDocument();
  });

  it('renders expandable rows', () => {
    render(
      <Table
        data={sampleData}
        columns={columns}
        getRowKey={getRowKey}
        renderExpandedRow={(row) => <div>Details for {row.name}</div>}
        paginate={false}
      />,
    );
    expect(screen.queryByText('Details for Alpha')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Alpha'));
    expect(screen.getByText('Details for Alpha')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Alpha'));
    expect(screen.queryByText('Details for Alpha')).not.toBeInTheDocument();
  });

  it('shows search bar when searchable and search toggle clicked', () => {
    render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} searchable onEdit={() => {}} paginate={false} />,
    );
    fireEvent.click(screen.getByTitle('Search'));
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('filters rows by search query', () => {
    render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} searchable onEdit={() => {}} paginate={false} />,
    );
    fireEvent.click(screen.getByTitle('Search'));
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'Beta' } });
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  });

  it('highlights search matches in text', () => {
    const { container } = render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} searchable onEdit={() => {}} paginate={false} />,
    );
    fireEvent.click(screen.getByTitle('Search'));
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'alph' } });
    expect(container.querySelector('mark.search-highlight')).toBeInTheDocument();
    expect(container.querySelector('mark.search-highlight')?.textContent).toBe('Alph');
  });

  it('shows no results message when search matches nothing', () => {
    render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} searchable onEdit={() => {}} paginate={false} />,
    );
    fireEvent.click(screen.getByTitle('Search'));
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'zzzzz' } });
    expect(screen.getByText('No results for "zzzzz"')).toBeInTheDocument();
  });

  it('shows search result count', () => {
    render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} searchable onEdit={() => {}} paginate={false} />,
    );
    fireEvent.click(screen.getByTitle('Search'));
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'Beta' } });
    expect(screen.getByText('1 of 3')).toBeInTheDocument();
  });

  it('clears search when clear button clicked', () => {
    render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} searchable onEdit={() => {}} paginate={false} />,
    );
    fireEvent.click(screen.getByTitle('Search'));
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'Beta' } });
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Clear search'));
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  it('closes search bar', () => {
    render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} searchable onEdit={() => {}} paginate={false} />,
    );
    fireEvent.click(screen.getByTitle('Search'));
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Close search'));
    expect(screen.queryByPlaceholderText('Search...')).not.toBeInTheDocument();
  });

  it('renders search toggle when no actions', () => {
    render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} searchable paginate={false} />,
    );
    expect(screen.getByTitle('Search')).toBeInTheDocument();
  });

  it('renders pagination controls', () => {
    const bigData = Array.from({ length: 30 }, (_, i) => ({ id: i, name: `Row ${i}`, status: 'active' }));
    render(<Table data={bigData} columns={columns} getRowKey={getRowKey} pageSize={10} />);
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    expect(screen.getByTitle('Next page')).toBeInTheDocument();
    expect(screen.getByTitle('Previous page')).toBeInTheDocument();
  });

  it('navigates pages', () => {
    const bigData = Array.from({ length: 30 }, (_, i) => ({ id: i, name: `Row ${i}`, status: 'active' }));
    render(<Table data={bigData} columns={columns} getRowKey={getRowKey} pageSize={10} />);
    expect(screen.getByText('Row 0')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Next page'));
    expect(screen.getByText('Row 10')).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });

  it('navigates to first and last page', () => {
    const bigData = Array.from({ length: 30 }, (_, i) => ({ id: i, name: `Row ${i}`, status: 'active' }));
    render(<Table data={bigData} columns={columns} getRowKey={getRowKey} pageSize={10} />);
    fireEvent.click(screen.getByTitle('Last page'));
    expect(screen.getByText('Page 3 of 3')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('First page'));
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
  });

  it('shows page size selector', () => {
    const bigData = Array.from({ length: 30 }, (_, i) => ({ id: i, name: `Row ${i}`, status: 'active' }));
    render(<Table data={bigData} columns={columns} getRowKey={getRowKey} pageSize={10} />);
    expect(screen.getByText('10 / page')).toBeInTheDocument();
  });

  it('shows row count info', () => {
    render(<Table data={sampleData} columns={columns} getRowKey={getRowKey} paginate={false} />);
    expect(screen.getByText('3 rows')).toBeInTheDocument();
  });

  it('shows singular row text', () => {
    render(<Table data={[sampleData[0]]} columns={columns} getRowKey={getRowKey} paginate={false} />);
    expect(screen.getByText('1 row')).toBeInTheDocument();
  });

  it('shows filtered count', () => {
    render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} searchable onEdit={() => {}} paginate={false} />,
    );
    fireEvent.click(screen.getByTitle('Search'));
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'Alpha' } });
    expect(screen.getByText(/filtered from 3/)).toBeInTheDocument();
  });

  it('hides action when show returns false', () => {
    render(
      <Table
        data={sampleData}
        columns={columns}
        getRowKey={getRowKey}
        actions={[{ icon: 'star', label: 'Star', onClick: () => {}, show: (row) => row.status === 'active' }]}
        paginate={false}
      />,
    );
    expect(screen.getAllByTitle('Star')).toHaveLength(2);
  });

  it('renders selection checkboxes', () => {
    render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} selectable selectedKeys={new Set()} onSelectionChange={() => {}} paginate={false} />,
    );
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
  });

  it('shows selection bar when items selected', () => {
    render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} selectable selectedKeys={new Set([1, 2])} onSelectionChange={() => {}} paginate={false} />,
    );
    expect(screen.getByText('2 selected')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('clears selection', () => {
    const onChange = vi.fn();
    render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} selectable selectedKeys={new Set([1])} onSelectionChange={onChange} paginate={false} />,
    );
    fireEvent.click(screen.getByText('Clear'));
    expect(onChange).toHaveBeenCalledWith(new Set());
  });

  it('shows Select All button', () => {
    render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} selectable selectedKeys={new Set([1])} onSelectionChange={() => {}} paginate={false} />,
    );
    expect(screen.getByText('Select All 3')).toBeInTheDocument();
  });

  it('toggles select all via header checkbox', () => {
    const onChange = vi.fn();
    render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} selectable selectedKeys={new Set<string | number>()} onSelectionChange={onChange} paginate={false} />,
    );
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(onChange).toHaveBeenCalledWith(new Set([1, 2, 3]));
  });

  it('deselects all via header checkbox', () => {
    const onChange = vi.fn();
    render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} selectable selectedKeys={new Set([1, 2, 3])} onSelectionChange={onChange} paginate={false} />,
    );
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(onChange).toHaveBeenCalledWith(new Set());
  });

  it('toggles individual row selection', () => {
    const onChange = vi.fn();
    render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} selectable selectedKeys={new Set<string | number>()} onSelectionChange={onChange} paginate={false} />,
    );
    fireEvent.click(screen.getAllByRole('checkbox')[1]);
    expect(onChange).toHaveBeenCalledWith(new Set([1]));
  });

  it('renders bulk actions in selection bar', () => {
    render(
      <Table
        data={sampleData}
        columns={columns}
        getRowKey={getRowKey}
        selectable
        selectedKeys={new Set([1, 2])}
        onSelectionChange={() => {}}
        actions={[{ icon: 'delete', label: 'Delete', onClick: () => {}, variant: 'danger', bulk: true }]}
        paginate={false}
      />,
    );
    const selectionBar = screen.getByText('2 selected').closest('.table-selection-bar')!;
    expect(within(selectionBar).getByRole('button', { name: /Delete/ })).toBeInTheDocument();
  });

  it('renders column filter toggles', () => {
    const cols: TableColumn<TestRow>[] = [
      { header: 'Name', accessor: 'name' },
      { header: 'Status', accessor: 'status', filterValue: (row) => row.status },
    ];
    const { container } = render(<Table data={sampleData} columns={cols} getRowKey={getRowKey} paginate={false} />);
    expect(container.querySelector('.column-filter-toggle')).toBeInTheDocument();
  });

  it('opens column filter dropdown', () => {
    const cols: TableColumn<TestRow>[] = [
      { header: 'Name', accessor: 'name' },
      { header: 'Status', accessor: 'status', filterValue: (row) => row.status },
    ];
    const { container } = render(<Table data={sampleData} columns={cols} getRowKey={getRowKey} paginate={false} />);
    fireEvent.click(container.querySelector('.column-filter-toggle')!);
    expect(container.querySelector('.column-filter-dropdown')).toBeInTheDocument();
  });

  it('applies custom row className', () => {
    const { container } = render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} rowClassName={(row) => row.status === 'active' ? 'row-active' : undefined} paginate={false} />,
    );
    expect(container.querySelectorAll('.row-active')).toHaveLength(2);
  });

  it('supports custom getSearchText', () => {
    render(
      <Table data={sampleData} columns={columns} getRowKey={getRowKey} searchable onEdit={() => {}} getSearchText={(row) => row.name} paginate={false} />,
    );
    fireEvent.click(screen.getByTitle('Search'));
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'Charlie' } });
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
  });

  it('renders loading action as disabled', () => {
    const { container } = render(
      <Table
        data={sampleData}
        columns={columns}
        getRowKey={getRowKey}
        actions={[{ icon: 'sync', label: 'Sync', onClick: () => {}, loading: () => true }]}
        paginate={false}
      />,
    );
    const buttons = container.querySelectorAll('.table-actions button');
    expect(buttons[0]).toBeDisabled();
  });
});

describe('SimpleTable', () => {
  it('renders headers and rows', () => {
    render(
      <SimpleTable headers={['Name', 'Value']} rows={[['Foo', 'Bar'], ['Baz', 'Qux']]} />,
    );
    expect(screen.getByText('Foo')).toBeInTheDocument();
    expect(screen.getByText('Qux')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SimpleTable headers={['A']} rows={[['B']]} className="my-table" />,
    );
    expect(container.querySelector('.my-table')).toBeInTheDocument();
  });
});

describe('Cell utilities', () => {
  it('Cell.code renders value in code tag', () => {
    const { container } = render(<>{Cell.code('hello')}</>);
    expect(container.querySelector('code')).toHaveTextContent('hello');
  });

  it('Cell.code renders dash for null', () => {
    const { container } = render(<>{Cell.code(null)}</>);
    expect(container.querySelector('code')).toHaveTextContent('—');
  });

  it('Cell.status renders status span', () => {
    render(<>{Cell.status('online', 'online')}</>);
    expect(screen.getByText('online')).toHaveClass('status', 'online');
  });

  it('Cell.status uses name as variant when no variant given', () => {
    render(<>{Cell.status('warning')}</>);
    expect(screen.getByText('warning')).toHaveClass('status', 'warning');
  });

  it('Cell.enabled renders Enabled/Disabled', () => {
    const { rerender } = render(<>{Cell.enabled(true)}</>);
    expect(screen.getByText('Enabled')).toHaveClass('status', 'online');
    rerender(<>{Cell.enabled(false)}</>);
    expect(screen.getByText('Disabled')).toHaveClass('status', 'offline');
  });

  it('Cell.count renders count with styling', () => {
    const { rerender } = render(<>{Cell.count(5)}</>);
    expect(screen.getByText('5')).toHaveClass('status', 'online');
    rerender(<>{Cell.count(0)}</>);
    expect(screen.getByText('0')).toHaveClass('status', 'offline');
  });

  it('Cell.count uses custom zero label', () => {
    render(<>{Cell.count(0, 'None')}</>);
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('Cell.badge renders a badge', () => {
    render(<>{Cell.badge('New', 'success')}</>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('Cell.badge uses default variant', () => {
    render(<>{Cell.badge('Tag')}</>);
    expect(screen.getByText('Tag')).toBeInTheDocument();
  });

  it('Cell.dash returns dash for falsy', () => {
    const { container } = render(<span>{Cell.dash('')}</span>);
    expect(container).toHaveTextContent('—');
  });

  it('Cell.dash returns value for truthy', () => {
    const { container } = render(<span>{Cell.dash('hello')}</span>);
    expect(container).toHaveTextContent('hello');
  });

  it('Cell.truncate returns full text when short', () => {
    render(<>{Cell.truncate('short', 30)}</>);
    expect(screen.getByText('short')).toBeInTheDocument();
  });

  it('Cell.truncate truncates long text', () => {
    render(<>{Cell.truncate('This is a very long text that should be truncated', 10)}</>);
    expect(screen.getByText('This is a ...')).toBeInTheDocument();
  });
});
