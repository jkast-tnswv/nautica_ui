// Service layer - aggregates all gRPC services for Nautica UI

import { OceanService } from '@twcode/ocean-ui';
import { ShipwrightService } from '@twcode/shipwright-ui';
import { HarborService } from '@twcode/harbor-ui';

export { GrpcBaseService, getInflightCount, onInflightChange, getApiHistory, clearApiHistory, onApiHistoryChange, type ApiHistoryEntry } from './base';
export { configureGrpc, getGrpcConfig, getTransport, type GrpcConfig } from './grpc-transport';
export { OceanService } from '@twcode/ocean-ui';
export { ShipwrightService } from '@twcode/shipwright-ui';
export { HarborService } from '@twcode/harbor-ui';
export { addNotification, markAllRead, clearNotifications, getNotifications, getUnreadCount, onNotificationsChange, type Notification, type NotificationAction, type NotificationLevel } from './notifications';
export { getOktaAuth, isOktaCallback } from './okta';

export interface Services {
  ocean: OceanService;
  shipwright: ShipwrightService;
  harbor: HarborService;
}

let services: Services | null = null;

export function getServices(): Services {
  if (!services) {
    services = {
      ocean: new OceanService(),
      shipwright: new ShipwrightService(),
      harbor: new HarborService(),
    };
  }
  return services;
}
