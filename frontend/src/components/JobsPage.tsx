import { TabbedPage } from './TabbedPage';
import { ErrorBoundary } from './ErrorBoundary';
import { ShipwrightJobs } from '@twcode/shipwright-ui';
import { HarborJobs } from '@twcode/harbor-ui';

const tabs = [
  { id: 'shipwright', label: 'Shipwright', icon: 'build', component: ShipwrightJobs },
  { id: 'harbor', label: 'Harbor', icon: 'anchor', component: HarborJobs },
];

export function JobsPage() {
  return <ErrorBoundary><TabbedPage tabs={tabs} /></ErrorBoundary>;
}
