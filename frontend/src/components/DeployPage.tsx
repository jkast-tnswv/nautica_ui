import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { SkipperBuilds } from '@twcode/skipper-ui';

export function DeployPage() {
  return <ErrorBoundary><SkipperBuilds /></ErrorBoundary>;
}
