import React, { useMemo, useState, useRef } from 'react';
import { useIslandFirmware } from '../hooks/useIslandFirmware';
import { useForm } from '@core/hooks/useForm';
import { getServices } from '@core/services';
import { Table, Cell, Card, InfoSection, RefreshButton, ErrorMessage, Button, FormDialog, FormField } from '@components';
import type { IslandFirmware as IslandFirmwareType } from '@core/gen/island/api/island_pb';
import { IslandFirmwareVendors, IslandFirmwareStatuses } from '@core/gen/island/api/island_pb';
import { formatFileSize } from '@core/utils/format';

function vendorLabel(v: IslandFirmwareVendors): string {
  switch (v) {
    case IslandFirmwareVendors.ISLAND_FIRMWARE_VENDOR_ARISTA: return 'Arista';
    case IslandFirmwareVendors.ISLAND_FIRMWARE_VENDOR_EDGECORE: return 'Edgecore';
    case IslandFirmwareVendors.ISLAND_FIRMWARE_VENDOR_OPENGEAR: return 'Opengear';
    default: return 'Unknown';
  }
}

function statusLabel(s: IslandFirmwareStatuses): string {
  switch (s) {
    case IslandFirmwareStatuses.ISLAND_FIRMWARE_STATUS_UPLOADING: return 'Uploading';
    case IslandFirmwareStatuses.ISLAND_FIRMWARE_STATUS_AVAILABLE: return 'Available';
    case IslandFirmwareStatuses.ISLAND_FIRMWARE_STATUS_DEPRECATED: return 'Deprecated';
    case IslandFirmwareStatuses.ISLAND_FIRMWARE_STATUS_DELETED: return 'Deleted';
    default: return 'Unknown';
  }
}

interface UploadFormData {
  platform: string;
  version: string;
  vendor: string;
}

export function IslandFirmware() {
  const { firmware, loading, error, refresh } = useIslandFirmware();
  const [showInfo, setShowInfo] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { formData, saving, handleChange, handleSubmit, resetForm } = useForm<UploadFormData>({
    initialData: { platform: '', version: '', vendor: '' },
    onSubmit: async (data) => {
      if (!file) return;
      const content = new Uint8Array(await file.arrayBuffer());
      const vendorMap: Record<string, IslandFirmwareVendors> = {
        arista: IslandFirmwareVendors.ISLAND_FIRMWARE_VENDOR_ARISTA,
        edgecore: IslandFirmwareVendors.ISLAND_FIRMWARE_VENDOR_EDGECORE,
        opengear: IslandFirmwareVendors.ISLAND_FIRMWARE_VENDOR_OPENGEAR,
      };
      await getServices().island.uploadFirmware({
        vendor: vendorMap[data.vendor.toLowerCase()] ?? IslandFirmwareVendors.ISLAND_FIRMWARE_VENDOR_UNSPECIFIED,
        platform: data.platform,
        version: data.version,
        filename: file.name,
        content,
      });
      refresh();
    },
    onSuccess: () => {
      setShowUploadDialog(false);
      setFile(null);
    },
  });

  const onFieldChange = (e: { target: { name: string; value: string } }) => {
    handleChange(e.target.name as keyof UploadFormData, e.target.value);
  };

  const openUploadDialog = () => {
    resetForm();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowUploadDialog(true);
  };

  const columns = useMemo(() => [
    {
      header: 'Filename',
      accessor: (f: IslandFirmwareType) => Cell.truncate(f.filename, 30),
      searchValue: (f: IslandFirmwareType) => f.filename,
      searchable: true,
    },
    {
      header: 'Version',
      accessor: 'version' as keyof IslandFirmwareType,
      width: '100px',
    },
    {
      header: 'Vendor',
      accessor: (f: IslandFirmwareType) => vendorLabel(f.vendor),
      searchable: true,
      filterValue: (f: IslandFirmwareType) => vendorLabel(f.vendor),
    },
    {
      header: 'Platform',
      accessor: 'platform' as keyof IslandFirmwareType,
      searchable: true,
      filterValue: (f: IslandFirmwareType) => f.platform,
    },
    {
      header: 'Status',
      accessor: (f: IslandFirmwareType) => statusLabel(f.status),
      filterValue: (f: IslandFirmwareType) => statusLabel(f.status),
      width: '110px',
    },
    {
      header: 'Size',
      accessor: (f: IslandFirmwareType) => formatFileSize(Number(f.sizeBytes)),
      width: '90px',
    },
    {
      header: 'Owner',
      accessor: 'owner' as keyof IslandFirmwareType,
      width: '120px',
    },
  ], []);

  return (
    <Card
      title="Firmware"
      titleAction={<InfoSection.Toggle open={showInfo} onToggle={setShowInfo} />}
      headerAction={
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button size="sm" icon="upload" onClick={openUploadDialog}>
            Upload Firmware
          </Button>
          <RefreshButton size="sm" onClick={refresh} />
        </div>
      }
    >
      <InfoSection open={showInfo}>
        <p>Island firmware images available for network devices. Each firmware is associated with a vendor and platform.</p>
      </InfoSection>
      {error && <ErrorMessage error={error} prefix="Error loading firmware" />}
      <Table
        data={firmware}
        columns={columns}
        getRowKey={(f: IslandFirmwareType) => f.firmwareId}
        emptyMessage={loading ? 'Loading firmware...' : 'No firmware found'}
        searchable
        searchPlaceholder="Search firmware..."
        paginate
        pageSize={25}
        tableId="island-firmware"
      />

      <FormDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        title="Upload Firmware"
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        saving={saving}
        submitText="Upload"
        submitDisabled={!formData.platform || !file}
      >
        <FormField
          label="Platform"
          name="platform"
          value={formData.platform}
          onChange={onFieldChange}
          placeholder="e.g. DCS-7050"
          required
        />
        <FormField
          label="Version"
          name="version"
          value={formData.version}
          onChange={onFieldChange}
          placeholder="e.g. 4.2.1"
        />
        <FormField
          label="Vendor"
          name="vendor"
          value={formData.vendor}
          onChange={onFieldChange}
          placeholder="e.g. Arista"
        />
        <div className="form-group">
          <label htmlFor="firmware-file">Firmware File</label>
          <input
            ref={fileInputRef}
            id="firmware-file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </FormDialog>
    </Card>
  );
}
