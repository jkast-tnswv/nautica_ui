// Hooks barrel export — Nautica UI

// Reusable UI hooks (kept from forge_config)
export {
  useTheme,
  useWebTheme,
  THEME_OPTIONS,
  type ThemeConfig,
  type UseThemeOptions,
  type UseThemeReturn
} from './useTheme';
export { useForm, type UseFormOptions, type UseFormReturn } from './useForm';
export { useModalForm, type UseModalFormOptions, type UseModalFormReturn } from './useModalForm';
export { useInflight } from './useInflight';
export { useApiHistory } from './useApiHistory';
export { useModalRoute, type UseModalRouteReturn } from './useModalRoute';
export { useLocalStorage } from './useLocalStorage';
export { usePersistedSet } from './usePersistedSet';
export {
  useTableFeatures,
  type ColumnFilterDef,
  type UseTableFeaturesOptions,
  type UseTableFeaturesReturn,
} from './useTableFeatures';
export {
  useListFiltering,
  type UseListFilteringOptions,
  type UseListFilteringReturn,
  type GroupedItems,
} from './useListFiltering';
export {
  useAsyncModal,
  useSimpleModal,
  type UseAsyncModalOptions,
  type UseAsyncModalReturn,
} from './useAsyncModal';
export {
  useLocalSettings,
  getLocalApiUrl,
  setLocalApiUrl,
  getDefaultPageSize,
  getTablePageSize,
  setTablePageSize,
  clearTablePageSizeOverrides,
  type LocalSettings,
  type UseLocalSettingsReturn,
} from './useLocalSettings';
export {
  useNotification,
  createWebNotificationHandler,
  type ConfirmOptions,
  type NotificationType,
  type NotificationMessage,
  type NotificationHandler,
  type UseNotificationOptions,
  type UseNotificationReturn,
} from './useNotification';
export { useNotificationHistory, type UseNotificationsReturn } from './useNotifications';
export { useTelemetry } from './useTelemetry';

// Auth
export { useAuth, useAuthState, AuthProvider, type UseAuthReturn, type AuthUser } from './useAuth';

export {
  useEntityData,
  type UseEntityDataOptions,
  type UseEntityDataReturn,
} from './useEntityData';

// Service-specific hooks are now in @twcode/{service}-ui packages
