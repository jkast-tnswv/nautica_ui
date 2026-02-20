import { TabbedPage } from './TabbedPage';
import { ShipwrightJobs } from '@twcode/shipwright-ui';
import { HarborJobs } from '@twcode/harbor-ui';

const tabs = [
  { id: 'shipwright', label: 'Shipwright', icon: 'build', component: ShipwrightJobs },
  { id: 'harbor', label: 'Harbor', icon: 'anchor', component: HarborJobs },
];

export function JobsPage() {
  return <TabbedPage tabs={tabs} />;
}
