// Core module — Nautica UI
// Platform-agnostic shared code

// Types (kept subset)
export type { Theme } from './types';

// Nautica-specific type utilities
export * from './nautica-types';

// Services
export {
  addNotification,
  markAllRead,
  clearNotifications,
  getNotifications,
  getUnreadCount,
  onNotificationsChange,
  type Notification,
  type NotificationAction,
  type NotificationLevel,
} from './services/notifications';

export {
  configureGrpc,
  getGrpcConfig,
  getTransport,
  type GrpcConfig,
} from './services/grpc-transport';

export {
  getServices,
  type Services,
} from './services';

export {
  getInflightCount,
  onInflightChange,
  getApiHistory,
  clearApiHistory,
  onApiHistoryChange,
  type ApiHistoryEntry,
} from './services/base';

export {
  initTelemetry,
  trackEvent,
  getTelemetryEvents,
  clearTelemetryEvents,
  onTelemetryChange,
  type TelemetryEvent,
  type TelemetryEventType,
} from './services/telemetry';

// Hooks
export {
  useTheme,
  useWebTheme,
  THEME_OPTIONS,
  type ThemeConfig,
  type UseThemeOptions,
  type UseThemeReturn,
  useForm,
  type UseFormOptions,
  type UseFormReturn,
  useModalForm,
  type UseModalFormOptions,
  type UseModalFormReturn,
  useInflight,
  useApiHistory,
  useModalRoute,
  type UseModalRouteReturn,
  useLocalStorage,
  usePersistedSet,
  useTableFeatures,
  type ColumnFilterDef,
  type UseTableFeaturesOptions,
  type UseTableFeaturesReturn,
  useListFiltering,
  type UseListFilteringOptions,
  type UseListFilteringReturn,
  type GroupedItems,
  useAsyncModal,
  useSimpleModal,
  type UseAsyncModalOptions,
  type UseAsyncModalReturn,
  useLocalSettings,
  getLocalApiUrl,
  setLocalApiUrl,
  getDefaultPageSize,
  getTablePageSize,
  setTablePageSize,
  clearTablePageSizeOverrides,
  type LocalSettings,
  type UseLocalSettingsReturn,
  useNotification,
  createWebNotificationHandler,
  type NotificationType,
  type NotificationMessage,
  type ConfirmOptions,
  type NotificationHandler,
  type UseNotificationOptions,
  type UseNotificationReturn,
  useNotificationHistory,
  type UseNotificationsReturn,
  useTelemetry,
  useAuth,
  useAuthState,
  AuthProvider,
  type UseAuthReturn,
  type AuthUser,
  useEntityData,
  type UseEntityDataOptions,
  type UseEntityDataReturn,
} from './hooks';

// Store
export { store, type RootState, type AppDispatch, useAppDispatch, useAppSelector, createEntitySlice, type EntityState } from './store';

// Theme
export {
  darkTheme,
  lightTheme,
  plainTheme,
  solarizedTheme,
  evergreenDarkTheme,
  evergreenLightTheme,
  oceanDarkTheme,
  oceanLightTheme,
  themes,
  getThemeColors,
  MONOSPACE_FONT,
  FONT_SIZES,
  type ThemeColors,
  type FontSize,
} from './theme';
