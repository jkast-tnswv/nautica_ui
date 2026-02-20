import React, { useState } from 'react';
import { SideTabs } from './index';
import { CaptainUsers, CaptainGroups } from '@twcode/captain-ui';

const tabs = [
  { id: 'users', label: 'Users', icon: 'person' },
  { id: 'groups', label: 'Groups', icon: 'group' },
];

export function AccessPage() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <SideTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'users' && <CaptainUsers />}
      {activeTab === 'groups' && <CaptainGroups />}
    </SideTabs>
  );
}
