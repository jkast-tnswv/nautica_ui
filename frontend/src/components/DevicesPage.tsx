import { TabbedPage } from './TabbedPage';
import { ErrorBoundary } from './ErrorBoundary';
import { OceanDevices, OceanCircuits } from '@twcode/ocean-ui';

const tabs = [
  { id: 'devices', label: 'Devices', icon: 'dns', component: OceanDevices },
  { id: 'circuits', label: 'Circuits', icon: 'cable', component: OceanCircuits },
];

export function DevicesPage() {
  return <ErrorBoundary><TabbedPage tabs={tabs} /></ErrorBoundary>;
}
