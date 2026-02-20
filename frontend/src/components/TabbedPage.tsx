import { useState, type ComponentType } from 'react';
import { SideTabs } from './SideTabs';

export interface TabbedPageTab {
  id: string;
  label: string;
  icon: string;
  component: ComponentType;
}

export function TabbedPage({ tabs }: { tabs: TabbedPageTab[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component ?? tabs[0].component;

  return (
    <SideTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
      <ActiveComponent />
    </SideTabs>
  );
}
