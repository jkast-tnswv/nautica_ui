import { useState, useEffect } from 'react';
import { useLocalSettings, clearTablePageSizeOverrides } from '@core';
import { configureServices } from '@core/services/base';
import { FormDialog } from './FormDialog';
import { FormField } from './FormField';
import { LayoutSettings } from './LayoutSettings';
import { SelectField } from './SelectField';
import { Icon } from './Icon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: Props) {
  const { settings: localSettings, updateSettings: updateLocalSettings } = useLocalSettings();
  const [localFormData, setLocalFormData] = useState({ apiUrl: '', defaultPageSize: 25 });

  useEffect(() => {
    if (isOpen) {
      setLocalFormData({ apiUrl: localSettings.apiUrl, defaultPageSize: localSettings.defaultPageSize });
    }
  }, [isOpen, localSettings.apiUrl, localSettings.defaultPageSize]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const localUpdates: Partial<typeof localSettings> = {};
    if (localFormData.apiUrl !== localSettings.apiUrl) {
      localUpdates.apiUrl = localFormData.apiUrl;
      configureServices({ baseUrl: localFormData.apiUrl });
    }
    if (localFormData.defaultPageSize !== localSettings.defaultPageSize) {
      localUpdates.defaultPageSize = localFormData.defaultPageSize;
      clearTablePageSizeOverrides();
    }
    if (Object.keys(localUpdates).length > 0) {
      updateLocalSettings(localUpdates);
    }

    onClose();
  };

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      onSubmit={handleSubmit}
      submitText="Save Settings"
      variant="wide"
    >
      <div className="settings-section">
        <h3>
          <Icon name="cloud" size={18} />
          Connection
        </h3>
        <div className="form-row">
          <FormField
            label="API URL"
            name="apiUrl"
            type="text"
            value={localFormData.apiUrl}
            onChange={(e) => setLocalFormData(prev => ({ ...prev, apiUrl: (e.target as HTMLInputElement).value }))}
            placeholder="/api or http://server:8080/api"
          />
        </div>
        <p className="settings-hint">
          Base URL for API requests. Use "/api" for same-origin or full URL for remote server.
        </p>
      </div>

      <div className="settings-section">
        <h3>
          <Icon name="table_rows" size={18} />
          Tables
        </h3>
        <div className="form-row">
          <SelectField
            label="Rows per page"
            name="defaultPageSize"
            value={String(localFormData.defaultPageSize)}
            onChange={(e) => setLocalFormData(prev => ({ ...prev, defaultPageSize: Number(e.target.value) }))}
            options={[
              { value: '10', label: '10' },
              { value: '25', label: '25' },
              { value: '50', label: '50' },
              { value: '100', label: '100' },
            ]}
          />
        </div>
        <p className="settings-hint">
          Default number of rows shown per page in tables. Per-table overrides are cleared when this changes.
        </p>
      </div>

      <div className="settings-section">
        <h3>
          <Icon name="view_quilt" size={18} />
          Layout
        </h3>
        <LayoutSettings />
      </div>
    </FormDialog>
  );
}
