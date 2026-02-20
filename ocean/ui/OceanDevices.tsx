import React, { useMemo, useState } from 'react';
import { useOceanDevices } from './useOceanDevices';
import { Table, Cell, SelectField, Card, InfoSection } from '@components';
import type { OceanDevice } from '@core/gen/ocean/api/ocean_pb';
import { OceanDeviceStatuses, OceanDeviceStates } from '@core/gen/ocean/api/ocean_pb';
import {
  oceanDeviceStatusLabel,
  oceanDeviceStatusVariant,
  oceanDeviceStateLabel,
  chassisModelLabel,
  chassisModelOptions,
} from '@core/nautica-types';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: String(OceanDeviceStatuses.OCEAN_DEVICE_STATUS_BOOTSTRAPPED), label: 'Bootstrapped' },
  { value: String(OceanDeviceStatuses.OCEAN_DEVICE_STATUS_PROVISIONING), label: 'Provisioning' },
  { value: String(OceanDeviceStatuses.OCEAN_DEVICE_STATUS_IN_USE), label: 'In Use' },
  { value: String(OceanDeviceStatuses.OCEAN_DEVICE_STATUS_DECOMMISSIONED), label: 'Decommissioned' },
];

const stateOptions = [
  { value: '', label: 'All States' },
  { value: String(OceanDeviceStates.OCEAN_DEVICE_STATE_EMBARKED), label: 'Embarked' },
  { value: String(OceanDeviceStates.OCEAN_DEVICE_STATE_DISEMBARKED), label: 'Disembarked' },
];

export function OceanDevices() {
  const { devices, loading, error, refresh } = useOceanDevices();
  const [showInfo, setShowInfo] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('');

  const modelOptions = useMemo(() => [
    { value: '', label: 'All Models' },
    ...chassisModelOptions(),
  ], []);

  const filteredDevices = useMemo(() => {
    let result = devices;
    if (statusFilter) {
      result = result.filter(d => d.oceanDeviceStatus === Number(statusFilter));
    }
    if (stateFilter) {
      result = result.filter(d => d.oceanDeviceState === Number(stateFilter));
    }
    if (modelFilter) {
      result = result.filter(d => d.chassisModel === Number(modelFilter));
    }
    return result;
  }, [devices, statusFilter, stateFilter, modelFilter]);

  const columns = useMemo(() => [
    {
      header: 'Device ID',
      accessor: (d: OceanDevice) => Cell.truncate(d.deviceId, 12),
      width: '140px',
      searchValue: (d: OceanDevice) => d.deviceId,
    },
    {
      header: 'Hostname',
      accessor: 'hostname' as keyof OceanDevice,
      searchable: true,
    },
    {
      header: 'Chassis Model',
      accessor: (d: OceanDevice) => chassisModelLabel(d.chassisModel),
      searchValue: (d: OceanDevice) => chassisModelLabel(d.chassisModel),
    },
    {
      header: 'Status',
      accessor: (d: OceanDevice) => Cell.badge(
        oceanDeviceStatusLabel(d.oceanDeviceStatus),
        oceanDeviceStatusVariant(d.oceanDeviceStatus),
      ),
      filterValue: (d: OceanDevice) => oceanDeviceStatusLabel(d.oceanDeviceStatus),
    },
    {
      header: 'State',
      accessor: (d: OceanDevice) => Cell.badge(
        oceanDeviceStateLabel(d.oceanDeviceState),
        d.oceanDeviceState === OceanDeviceStates.OCEAN_DEVICE_STATE_EMBARKED ? 'success' : 'default',
      ),
      filterValue: (d: OceanDevice) => oceanDeviceStateLabel(d.oceanDeviceState),
    },
  ], []);

  if (error) {
    return <div className="error-message">Error loading devices: {error}</div>;
  }

  return (
    <Card
      title="Devices"
      titleAction={<InfoSection.Toggle open={showInfo} onToggle={setShowInfo} />}
      headerAction={
        <>
          <SelectField
            name="status"
            value={statusFilter}
            options={statusOptions}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <SelectField
            name="state"
            value={stateFilter}
            options={stateOptions}
            onChange={(e) => setStateFilter(e.target.value)}
          />
          <SelectField
            name="model"
            value={modelFilter}
            options={modelOptions}
            onChange={(e) => setModelFilter(e.target.value)}
          />
          <button className="btn btn-sm btn-secondary" onClick={refresh}>
            <span className="material-icons-outlined">refresh</span>
            Refresh
          </button>
        </>
      }
    >
      <InfoSection open={showInfo}>
        <p>Ocean devices represent network switches, routers, and other infrastructure managed by Ocean. Filter by status, state, or chassis model to find specific devices.</p>
      </InfoSection>
      <Table
        data={filteredDevices}
        columns={columns}
        getRowKey={(d: OceanDevice) => d.deviceId}
        emptyMessage={loading ? 'Loading devices...' : 'No devices found'}
        searchable
        searchPlaceholder="Search devices..."
        paginate
        pageSize={25}
        tableId="ocean-devices"
      />
    </Card>
  );
}
