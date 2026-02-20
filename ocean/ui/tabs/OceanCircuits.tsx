import React, { useMemo, useState } from 'react';
import { useOceanCircuits } from '../hooks/useOceanCircuits';
import { Table, Cell, Card, InfoSection, RefreshButton, ErrorMessage } from '@components';
import type { OceanCircuit } from '@core/gen/ocean/api/ocean_pb';
import {
  oceanCircuitStatusLabel,
  oceanCircuitStateLabel,
  formatSpeed,
} from '@core/nautica-types';
import { OceanCircuitStates } from '@core/gen/ocean/api/ocean_pb';

export function OceanCircuits() {
  const { circuits, loading, error, refresh } = useOceanCircuits();
  const [showInfo, setShowInfo] = useState(false);

  const columns = useMemo(() => [
    {
      header: 'Circuit ID',
      accessor: (c: OceanCircuit) => Cell.truncate(c.circuitId, 12),
      width: '140px',
      searchValue: (c: OceanCircuit) => c.circuitId,
    },
    {
      header: 'A-Device',
      accessor: (c: OceanCircuit) => c.aDevice?.hostname ?? '—',
      searchValue: (c: OceanCircuit) => c.aDevice?.hostname ?? '',
    },
    {
      header: 'A-Interface',
      accessor: 'aInterface' as keyof OceanCircuit,
    },
    {
      header: 'Z-Device',
      accessor: (c: OceanCircuit) => c.zDevice?.hostname ?? '—',
      searchValue: (c: OceanCircuit) => c.zDevice?.hostname ?? '',
    },
    {
      header: 'Z-Interface',
      accessor: 'zInterface' as keyof OceanCircuit,
    },
    {
      header: 'Speed',
      accessor: (c: OceanCircuit) => formatSpeed(c.speedMbps),
      filterValue: (c: OceanCircuit) => formatSpeed(c.speedMbps),
      width: '100px',
    },
    {
      header: 'Status',
      accessor: (c: OceanCircuit) => Cell.badge(
        oceanCircuitStatusLabel(c.oceanCircuitStatus),
        'info',
      ),
      filterValue: (c: OceanCircuit) => oceanCircuitStatusLabel(c.oceanCircuitStatus),
    },
    {
      header: 'State',
      accessor: (c: OceanCircuit) => Cell.badge(
        oceanCircuitStateLabel(c.oceanCircuitState),
        c.oceanCircuitState === OceanCircuitStates.OCEAN_CIRCUIT_STATE_EMBARKED ? 'success' : 'default',
      ),
      filterValue: (c: OceanCircuit) => oceanCircuitStateLabel(c.oceanCircuitState),
    },
  ], []);

  return (
    <Card
      title="Circuits"
      titleAction={<InfoSection.Toggle open={showInfo} onToggle={setShowInfo} />}
      headerAction={
        <RefreshButton size="sm" onClick={refresh} />
      }
    >
      <InfoSection open={showInfo}>
        <p>Circuits represent physical connections between ocean devices, including interface endpoints and link speed.</p>
      </InfoSection>
      {error && <ErrorMessage error={error} prefix="Error loading circuits" />}
      <Table
        data={circuits}
        columns={columns}
        getRowKey={(c) => c.circuitId}
        emptyMessage={loading ? 'Loading circuits...' : 'No circuits found'}
        searchable
        searchPlaceholder="Search circuits..."
        paginate
        pageSize={25}
        tableId="ocean-circuits"
      />
    </Card>
  );
}
