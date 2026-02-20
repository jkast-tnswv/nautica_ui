import { render, screen, fireEvent } from '@testing-library/react';
import { SideTabs } from './SideTabs';

const tabs = [
  { id: 'devices', label: 'Devices', icon: 'dns' },
  { id: 'circuits', label: 'Circuits', icon: 'cable', count: 42 },
];

describe('SideTabs', () => {
  it('renders tab labels', () => {
    render(<SideTabs tabs={tabs} activeTab="devices" onTabChange={() => {}}>Content</SideTabs>);
    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByText('Circuits')).toBeInTheDocument();
  });

  it('renders tab icons', () => {
    render(<SideTabs tabs={tabs} activeTab="devices" onTabChange={() => {}}>Content</SideTabs>);
    expect(screen.getByText('dns')).toBeInTheDocument();
    expect(screen.getByText('cable')).toBeInTheDocument();
  });

  it('renders count badge when provided', () => {
    render(<SideTabs tabs={tabs} activeTab="devices" onTabChange={() => {}}>Content</SideTabs>);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('marks active tab', () => {
    render(<SideTabs tabs={tabs} activeTab="devices" onTabChange={() => {}}>Content</SideTabs>);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveClass('active');
    expect(buttons[1]).not.toHaveClass('active');
  });

  it('calls onTabChange when tab clicked', () => {
    const onTabChange = vi.fn();
    render(<SideTabs tabs={tabs} activeTab="devices" onTabChange={onTabChange}>Content</SideTabs>);
    fireEvent.click(screen.getByText('Circuits'));
    expect(onTabChange).toHaveBeenCalledWith('circuits');
  });

  it('renders children in content area', () => {
    render(<SideTabs tabs={tabs} activeTab="devices" onTabChange={() => {}}>Tab content</SideTabs>);
    expect(screen.getByText('Tab content')).toBeInTheDocument();
  });
});
