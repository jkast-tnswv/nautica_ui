import { TabbedPage } from './TabbedPage';
import { IslandFirmware, IslandModels } from '@twcode/island-ui';

const tabs = [
  { id: 'firmware', label: 'Firmware', icon: 'memory', component: IslandFirmware },
  { id: 'models', label: 'Models', icon: 'devices', component: IslandModels },
];

export function IslandPage() {
  return <TabbedPage tabs={tabs} />;
}
