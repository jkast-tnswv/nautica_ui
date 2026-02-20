import React, { useMemo, useState } from 'react';
import { useIslandAssignments } from '../hooks/useIslandModels';
import { Table, Card, InfoSection, RefreshButton, ErrorMessage } from '@components';
import type { IslandAssignment } from '@core/gen/island/api/island_pb';
import { IslandFirmwareVendors, IslandFirmwareStatuses } from '@core/gen/island/api/island_pb';
import { ChassisModels } from '@core/gen/keel/api/chassis_pb';

function chassisModelLabel(m: ChassisModels): string {
  const name = ChassisModels[m];
  if (!name || name === 'CHASSIS_MODEL_UNSPECIFIED') return 'Unknown';
  return name.replace('CHASSIS_MODEL_', '').replace(/_/g, ' ');
}

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

export function IslandModels() {
  const { assignments, loading, error, refresh } = useIslandAssignments();
  const [showInfo, setShowInfo] = useState(false);

  const columns = useMemo(() => [
    {
      header: 'Chassis Model',
      accessor: (a: IslandAssignment) => chassisModelLabel(a.chassisModel),
      searchable: true,
      searchValue: (a: IslandAssignment) => chassisModelLabel(a.chassisModel),
    },
    {
      header: 'Firmware',
      accessor: (a: IslandAssignment) =>
        a.islandFirmware
          ? `${a.islandFirmware.filename} v${a.islandFirmware.version}`
          : '—',
      searchValue: (a: IslandAssignment) =>
        a.islandFirmware ? `${a.islandFirmware.filename} ${a.islandFirmware.version}` : '',
    },
    {
      header: 'Vendor',
      accessor: (a: IslandAssignment) =>
        a.islandFirmware ? vendorLabel(a.islandFirmware.vendor) : '—',
      filterValue: (a: IslandAssignment) =>
        a.islandFirmware ? vendorLabel(a.islandFirmware.vendor) : '',
      width: '120px',
    },
    {
      header: 'Platform',
      accessor: (a: IslandAssignment) => a.islandFirmware?.platform || '—',
      width: '140px',
    },
    {
      header: 'Status',
      accessor: (a: IslandAssignment) =>
        a.islandFirmware ? statusLabel(a.islandFirmware.status) : '—',
      width: '110px',
    },
  ], []);

  return (
    <Card
      title="Assignments"
      titleAction={<InfoSection.Toggle open={showInfo} onToggle={setShowInfo} />}
      headerAction={<RefreshButton size="sm" onClick={refresh} />}
    >
      <InfoSection open={showInfo}>
        <p>Firmware assignments to chassis models. Each chassis model can have a firmware image assigned for deployment.</p>
      </InfoSection>
      {error && <ErrorMessage error={error} prefix="Error loading assignments" />}
      <Table
        data={assignments}
        columns={columns}
        getRowKey={(a: IslandAssignment) => `${a.firmwareId}-${a.chassisModel}`}
        emptyMessage={loading ? 'Loading assignments...' : 'No assignments found'}
        searchable
        searchPlaceholder="Search assignments..."
        paginate
        pageSize={25}
        tableId="island-assignments"
      />
    </Card>
  );
}
