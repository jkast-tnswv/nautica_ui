import { render, screen, fireEvent } from '@testing-library/react';
import { TabbedPage } from './TabbedPage';

function TabA() { return <div>Tab A Content</div>; }
function TabB() { return <div>Tab B Content</div>; }

const tabs = [
  { id: 'a', label: 'Tab A', icon: 'home', component: TabA },
  { id: 'b', label: 'Tab B', icon: 'settings', component: TabB },
];

describe('TabbedPage', () => {
  it('renders first tab by default', () => {
    render(<TabbedPage tabs={tabs} />);
    expect(screen.getByText('Tab A Content')).toBeInTheDocument();
  });

  it('switches tab on click', () => {
    render(<TabbedPage tabs={tabs} />);
    fireEvent.click(screen.getByText('Tab B'));
    expect(screen.getByText('Tab B Content')).toBeInTheDocument();
  });

  it('renders tab labels in nav', () => {
    render(<TabbedPage tabs={tabs} />);
    expect(screen.getByText('Tab A')).toBeInTheDocument();
    expect(screen.getByText('Tab B')).toBeInTheDocument();
  });
});
