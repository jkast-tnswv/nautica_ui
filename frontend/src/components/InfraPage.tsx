import { TabbedPage } from './TabbedPage';
import { AnchorLocations } from './AnchorLocations';
import { KeelCatalog } from './KeelCatalog';
import { QuartermasterParts } from './QuartermasterParts';

const tabs = [
  { id: 'locations', label: 'Anchor', icon: 'location_on', component: AnchorLocations },
  { id: 'hardware', label: 'Keel', icon: 'memory', component: KeelCatalog },
  { id: 'parts', label: 'Quartermaster', icon: 'category', component: QuartermasterParts },
];

export function InfraPage() {
  return <TabbedPage tabs={tabs} />;
}
