import React, { useMemo, useState } from 'react';
import { useOceanCircuits } from './useOceanCircuits';
import { Table, Cell, Card, InfoSection } from '@components';
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
      width: '100px',
    },
    {
      header: 'Status',
      accessor: (c: OceanCircuit) => Cell.badge(
        oceanCircuitStatusLabel(c.oceanCircuitStatus),
        'info',
      ),
    },
    {
      header: 'State',
      accessor: (c: OceanCircuit) => Cell.badge(
        oceanCircuitStateLabel(c.oceanCircuitState),
        c.oceanCircuitState === OceanCircuitStates.OCEAN_CIRCUIT_STATE_EMBARKED ? 'success' : 'default',
      ),
    },
  ], []);

  if (error) {
    return <div className="error-message">Error loading circuits: {error}</div>;
  }

  return (
    <Card
      title="Circuits"
      titleAction={<InfoSection.Toggle open={showInfo} onToggle={setShowInfo} />}
      headerAction={
        <button className="btn btn-sm btn-secondary" onClick={refresh}>
          <span className="material-icons-outlined">refresh</span>
          Refresh
        </button>
      }
    >
      <InfoSection open={showInfo}>
        <p>Circuits represent physical connections between ocean devices, including interface endpoints and link speed.</p>
      </InfoSection>
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
