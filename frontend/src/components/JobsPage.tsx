import React, { useState } from 'react';
import { SideTabs } from './index';
import { ShipwrightJobs } from '@twcode/shipwright-ui';
import { HarborJobs } from '@twcode/harbor-ui';

const tabs = [
  { id: 'shipwright', label: 'Shipwright', icon: 'build' },
  { id: 'harbor', label: 'Harbor', icon: 'anchor' },
];

export function JobsPage() {
  const [activeTab, setActiveTab] = useState('shipwright');

  return (
    <SideTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'shipwright' && <ShipwrightJobs />}
      {activeTab === 'harbor' && <HarborJobs />}
    </SideTabs>
  );
}
