import { TabbedPage } from './TabbedPage';
import { ErrorBoundary } from './ErrorBoundary';
import { CaptainUsers, CaptainGroups } from '@twcode/captain-ui';

const tabs = [
  { id: 'users', label: 'Captain', icon: 'person', component: CaptainUsers },
  { id: 'groups', label: 'Groups', icon: 'group', component: CaptainGroups },
];

export function AccessPage() {
  return <ErrorBoundary><TabbedPage tabs={tabs} /></ErrorBoundary>;
}
