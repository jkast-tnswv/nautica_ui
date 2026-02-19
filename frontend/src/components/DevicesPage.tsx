import React, { useState } from 'react';
import { SideTabs } from './index';
import { OceanDevices } from '@twcode/ocean-ui';
import { OceanCircuits } from '@twcode/ocean-ui';

const tabs = [
  { id: 'devices', label: 'Devices', icon: 'dns' },
  { id: 'circuits', label: 'Circuits', icon: 'cable' },
];

export function DevicesPage() {
  const [activeTab, setActiveTab] = useState('devices');

  return (
    <SideTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'devices' && <OceanDevices />}
      {activeTab === 'circuits' && <OceanCircuits />}
    </SideTabs>
  );
}
