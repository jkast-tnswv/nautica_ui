import React, { useState, useMemo } from 'react';
import { Table, Cell, Card, InfoSection } from './index';
import { PartCategories } from '@core/gen/quartermaster/api/quartermaster_pb';
import { partCategoryLabel, partCategoryGroup } from '@core/nautica-types';

function enumEntries(enumObj: Record<string, number | string>, prefix: string): { name: string; value: number }[] {
  return Object.entries(enumObj)
    .filter(([key, val]) => typeof val === 'number' && val !== 0 && key !== `${prefix}_UNSPECIFIED`)
    .map(([key, val]) => ({
      name: key,
      value: val as number,
    }));
}

const partCategories = enumEntries(PartCategories, 'PART_CATEGORY');

interface PartEntry {
  group: string;
  name: string;
  protoEnum: string;
  code: number;
}

export function QuartermasterParts() {
  const [showInfo, setShowInfo] = useState(false);

  const partsData = useMemo((): PartEntry[] => {
    return partCategories.map(c => ({
      group: partCategoryGroup(c.value as PartCategories),
      name: partCategoryLabel(c.value as PartCategories),
      protoEnum: c.name,
      code: c.value,
    }));
  }, []);

  const columns = useMemo(() => [
    {
      header: 'Group',
      accessor: (r: PartEntry) => Cell.badge(r.group, 'info'),
      width: '130px',
      filterValue: (r: PartEntry) => r.group,
    },
    {
      header: 'Part Category',
      accessor: (r: PartEntry) => r.name,
      searchable: true,
    },
    {
      header: 'Proto Enum',
      accessor: (r: PartEntry) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.protoEnum}</span>
      ),
      searchValue: (r: PartEntry) => r.protoEnum,
    },
    {
      header: 'Code',
      accessor: (r: PartEntry) => r.code,
      width: '80px',
    },
  ], []);

  return (
    <Card
      title="Part Categories"
      titleAction={<InfoSection.Toggle open={showInfo} onToggle={setShowInfo} />}
    >
      <InfoSection open={showInfo}>
        <p>Quartermaster defines the taxonomy of trackable parts across the data center: racks, cooling, power distribution, compute components, networking equipment, and cabling. Each part category maps to a TensorWave Part Number (TWPN) prefix.</p>
        <ul>
          <li><strong>Infrastructure</strong> &mdash; Racks, doors, ladder racks, cable trays, rail kits</li>
          <li><strong>Cooling</strong> &mdash; CDUs, pumps, manifolds, fans, water blocks</li>
          <li><strong>Power</strong> &mdash; PDUs, UPS, generators, PSUs, power cords</li>
          <li><strong>Compute</strong> &mdash; Chassis, blades, CPUs, GPUs, memory, storage, NICs</li>
          <li><strong>Networking</strong> &mdash; Switches, routers, supervisors, linecards, optics</li>
          <li><strong>Cabling</strong> &mdash; Copper/fiber cables, patch panels, cassettes, trunks</li>
        </ul>
      </InfoSection>
      <Table
        data={partsData}
        columns={columns}
        getRowKey={(r) => `${r.group}-${r.code}`}
        searchable
        searchPlaceholder="Search parts..."
        paginate
        pageSize={50}
        tableId="quartermaster-parts"
      />
    </Card>
  );
}
