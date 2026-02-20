import { TabbedPage } from './TabbedPage';
import { OceanDevices, OceanCircuits } from '@twcode/ocean-ui';

const tabs = [
  { id: 'devices', label: 'Devices', icon: 'dns', component: OceanDevices },
  { id: 'circuits', label: 'Circuits', icon: 'cable', component: OceanCircuits },
];

export function DevicesPage() {
  return <TabbedPage tabs={tabs} />;
}
