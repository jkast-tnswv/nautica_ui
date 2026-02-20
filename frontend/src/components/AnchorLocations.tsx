import React, { useState, useMemo } from 'react';
import { Table, Cell, Card, InfoSection } from './index';
import {
  CampusCodes,
  BuildingCodes,
  RackModels,
  RackPosts,
  RackWidths,
  RackFaces,
} from '@core/gen/anchor/api/anchor_pb';

function enumEntries(enumObj: Record<string, number | string>, prefix: string): { name: string; value: number }[] {
  return Object.entries(enumObj)
    .filter(([key, val]) => typeof val === 'number' && val !== 0 && key !== `${prefix}_UNSPECIFIED`)
    .map(([key, val]) => ({
      name: key.replace(`${prefix}_`, '').replace(/_/g, ' '),
      value: val as number,
    }));
}

const campuses = enumEntries(CampusCodes, 'CAMPUS_CODE');
const buildings = enumEntries(BuildingCodes, 'BUILDING_CODE');
const rackModels = enumEntries(RackModels, 'RACK_MODEL');
const rackPosts = enumEntries(RackPosts, 'RACK_POST');
const rackWidths = enumEntries(RackWidths, 'RACK_WIDTH');
const rackFaces = enumEntries(RackFaces, 'RACK_FACE');

interface RefEntry { name: string; value: number }

export function AnchorLocations() {
  const [showInfo, setShowInfo] = useState(false);

  const locationData = useMemo(() => {
    const rows: { category: string; name: string; code: number }[] = [];
    campuses.forEach(c => rows.push({ category: 'Campus', name: c.name, code: c.value }));
    buildings.forEach(b => rows.push({ category: 'Building', name: b.name, code: b.value }));
    rackModels.forEach(r => rows.push({ category: 'Rack Model', name: r.name, code: r.value }));
    rackPosts.forEach(r => rows.push({ category: 'Rack Posts', name: r.name, code: r.value }));
    rackWidths.forEach(r => rows.push({ category: 'Rack Width', name: r.name, code: r.value }));
    rackFaces.forEach(r => rows.push({ category: 'Rack Face', name: r.name, code: r.value }));
    return rows;
  }, []);

  const columns = useMemo(() => [
    {
      header: 'Category',
      accessor: (r: typeof locationData[0]) => Cell.badge(r.category, 'info'),
      width: '140px',
      filterValue: (r: typeof locationData[0]) => r.category,
    },
    {
      header: 'Name',
      accessor: (r: typeof locationData[0]) => r.name,
      searchable: true,
    },
    {
      header: 'Code',
      accessor: (r: typeof locationData[0]) => r.code,
      width: '80px',
    },
  ], []);

  return (
    <Card
      title="Anchor"
      titleAction={<InfoSection.Toggle open={showInfo} onToggle={setShowInfo} />}
    >
      <InfoSection open={showInfo}>
        <p>Anchor defines the physical location hierarchy: Country &rarr; State &rarr; Campus &rarr; Building &rarr; Floor &rarr; Room &rarr; Row &rarr; Rack. This reference shows all registered campuses, buildings, and rack specifications.</p>
        <p style={{ marginTop: 4, fontFamily: 'monospace', fontSize: '0.8rem' }}>
          Format: USA.FL.MIA.MIA1.01.DHA.02.03.F.45RU.00
        </p>
      </InfoSection>
      <Table
        data={locationData}
        columns={columns}
        getRowKey={(r) => `${r.category}-${r.name}-${r.code}`}
        searchable
        searchPlaceholder="Search locations..."
        paginate
        pageSize={25}
        tableId="anchor-locations"
      />
    </Card>
  );
}
