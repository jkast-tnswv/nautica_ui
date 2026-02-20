import React, { useState, useMemo } from 'react';
import { Table, Cell, Card, InfoSection } from './index';
import { ChassisModels } from '@core/gen/keel/api/chassis_pb';
import { chassisModelLabel } from '@core/nautica-types';

function enumEntries(enumObj: Record<string, number | string>, prefix: string): { name: string; value: number }[] {
  return Object.entries(enumObj)
    .filter(([key, val]) => typeof val === 'number' && val !== 0 && key !== `${prefix}_UNSPECIFIED`)
    .map(([key, val]) => ({
      name: key,
      value: val as number,
    }));
}

const chassisModels = enumEntries(ChassisModels, 'CHASSIS_MODEL');

interface CatalogEntry {
  category: string;
  name: string;
  protoEnum: string;
  code: number;
}

export function KeelCatalog() {
  const [showInfo, setShowInfo] = useState(false);

  const catalogData = useMemo((): CatalogEntry[] => {
    const rows: CatalogEntry[] = [];
    chassisModels.forEach(c => {
      rows.push({
        category: 'Chassis',
        name: chassisModelLabel(c.value as ChassisModels),
        protoEnum: c.name,
        code: c.value,
      });
    });
    return rows;
  }, []);

  const columns = useMemo(() => [
    {
      header: 'Category',
      accessor: (r: CatalogEntry) => Cell.badge(r.category, 'info'),
      width: '120px',
      filterValue: (r: CatalogEntry) => r.category,
    },
    {
      header: 'Name',
      accessor: (r: CatalogEntry) => r.name,
      searchable: true,
    },
    {
      header: 'Proto Enum',
      accessor: (r: CatalogEntry) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.protoEnum}</span>
      ),
      searchValue: (r: CatalogEntry) => r.protoEnum,
    },
    {
      header: 'Code',
      accessor: (r: CatalogEntry) => r.code,
      width: '80px',
    },
  ], []);

  return (
    <Card
      title="Hardware Catalog"
      titleAction={<InfoSection.Toggle open={showInfo} onToggle={setShowInfo} />}
    >
      <InfoSection open={showInfo}>
        <p>Keel defines the physical hardware taxonomy: chassis models, linecard modules, supervisor modules, power supplies, pluggable transceivers, copper/fiber cables, connectors, and cooling systems. This catalog shows all registered hardware definitions.</p>
        <ul>
          <li><strong>Chassis</strong> &mdash; Arista, Edgecore, Opengear, Supermicro, nVent models</li>
          <li><strong>Pluggables</strong> &mdash; SFP, QSFP, OSFP, CFP form factors</li>
          <li><strong>Cables</strong> &mdash; Cat5-8 copper, OS1/OS2 single-mode, OM1-5 multi-mode fiber</li>
          <li><strong>Connectors</strong> &mdash; RJ45, LC, SC, MPO, IEC/NEMA power</li>
        </ul>
      </InfoSection>
      <Table
        data={catalogData}
        columns={columns}
        getRowKey={(r) => `${r.category}-${r.code}-${r.protoEnum}`}
        searchable
        searchPlaceholder="Search hardware..."
        paginate
        pageSize={25}
        tableId="keel-catalog"
      />
    </Card>
  );
}
