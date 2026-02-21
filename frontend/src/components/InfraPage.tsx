import { TabbedPage } from './TabbedPage';
import { ErrorBoundary } from './ErrorBoundary';
import { AnchorLocations } from '@twcode/anchor-ui';
import { KeelCatalog } from '@twcode/keel-ui';
import { QuartermasterParts } from '@twcode/quartermaster-ui';

const tabs = [
  { id: 'locations', label: 'Anchor', icon: 'location_on', component: AnchorLocations },
  { id: 'hardware', label: 'Keel', icon: 'memory', component: KeelCatalog },
  { id: 'parts', label: 'Quartermaster', icon: 'category', component: QuartermasterParts },
];

export function InfraPage() {
  return <ErrorBoundary><TabbedPage tabs={tabs} /></ErrorBoundary>;
}
