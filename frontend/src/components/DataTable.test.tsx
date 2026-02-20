import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable, CellRenderers } from './DataTable';

interface TestItem {
  id: number;
  name: string;
  active: boolean;
}

const data: TestItem[] = [
  { id: 1, name: 'Foo', active: true },
  { id: 2, name: 'Bar', active: false },
];

const columns = [
  { header: 'Name', accessor: 'name' as const },
  { header: 'Active', accessor: (row: TestItem) => (row.active ? 'Yes' : 'No') },
];

describe('DataTable', () => {
  it('renders headers and data', () => {
    render(<DataTable data={data} columns={columns} getRowKey={(r) => r.id} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Foo')).toBeInTheDocument();
    expect(screen.getByText('Bar')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('renders empty message when no data', () => {
    render(<DataTable data={[]} columns={columns} getRowKey={(r) => r.id} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders custom empty message', () => {
    render(<DataTable data={[]} columns={columns} getRowKey={(r) => r.id} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders edit action buttons', () => {
    const onEdit = vi.fn();
    render(<DataTable data={data} columns={columns} getRowKey={(r) => r.id} onEdit={onEdit} />);
    const editButtons = screen.getAllByTitle('Edit');
    expect(editButtons).toHaveLength(2);
    fireEvent.click(editButtons[0]);
    expect(onEdit).toHaveBeenCalledWith(data[0]);
  });

  it('renders delete action buttons', () => {
    const onDelete = vi.fn();
    render(<DataTable data={data} columns={columns} getRowKey={(r) => r.id} onDelete={onDelete} />);
    const deleteButtons = screen.getAllByTitle('Delete');
    expect(deleteButtons).toHaveLength(2);
    fireEvent.click(deleteButtons[1]);
    expect(onDelete).toHaveBeenCalledWith(data[1]);
  });

  it('disables delete when deleteDisabled returns true', () => {
    render(
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        onDelete={() => {}}
        deleteDisabled={(r) => r.active}
      />,
    );
    const deleteButtons = screen.getAllByTitle('Delete');
    expect(deleteButtons[0]).toBeDisabled(); // Foo is active
    expect(deleteButtons[1]).not.toBeDisabled(); // Bar is not active
  });

  it('applies rowClassName', () => {
    const { container } = render(
      <DataTable
        data={data}
        columns={columns}
        getRowKey={(r) => r.id}
        rowClassName={(r) => r.active ? 'active-row' : 'inactive-row'}
      />,
    );
    expect(container.querySelector('.active-row')).toBeInTheDocument();
    expect(container.querySelector('.inactive-row')).toBeInTheDocument();
  });
});

describe('CellRenderers', () => {
  it('code renders accessor value in code tag', () => {
    const renderer = CellRenderers.code<TestItem>('name');
    const { container } = render(<>{renderer(data[0])}</>);
    expect(container.querySelector('code')).toHaveTextContent('Foo');
  });

  it('status renders online/offline', () => {
    const { rerender } = render(<>{CellRenderers.status(true)}</>);
    expect(screen.getByText('Online')).toHaveClass('online');
    rerender(<>{CellRenderers.status(false, 'Down')}</>);
    expect(screen.getByText('Down')).toHaveClass('offline');
  });

  it('enabled renders Enabled/Disabled', () => {
    const { rerender } = render(<>{CellRenderers.enabled(true)}</>);
    expect(screen.getByText('Enabled')).toBeInTheDocument();
    rerender(<>{CellRenderers.enabled(false)}</>);
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('count renders count value', () => {
    const { rerender } = render(<>{CellRenderers.count(5)}</>);
    expect(screen.getByText('5')).toHaveClass('online');
    rerender(<>{CellRenderers.count(0, 'None')}</>);
    expect(screen.getByText('None')).toHaveClass('offline');
  });

  it('emptyDash renders value or dash', () => {
    const renderer = CellRenderers.emptyDash<TestItem>('name');
    expect(renderer(data[0])).toBe('Foo');
    expect(renderer({ id: 3, name: '', active: false })).toBe('—');
  });
});
