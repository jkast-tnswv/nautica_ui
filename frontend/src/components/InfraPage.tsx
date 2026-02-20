import React, { useState } from 'react';
import { SideTabs } from './index';
import { AnchorLocations } from './AnchorLocations';
import { KeelCatalog } from './KeelCatalog';
import { QuartermasterParts } from './QuartermasterParts';

const tabs = [
  { id: 'locations', label: 'Locations', icon: 'location_on' },
  { id: 'hardware', label: 'Hardware', icon: 'memory' },
  { id: 'parts', label: 'Parts', icon: 'category' },
];

export function InfraPage() {
  const [activeTab, setActiveTab] = useState('locations');

  return (
    <SideTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'locations' && <AnchorLocations />}
      {activeTab === 'hardware' && <KeelCatalog />}
      {activeTab === 'parts' && <QuartermasterParts />}
    </SideTabs>
  );
}
