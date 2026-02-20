import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import { useForm } from '@core/hooks/useForm';
import { buildSkipperPackage } from '../slices/skipperSlice';
import { Table, Cell, Card, InfoSection, FormField, FormDialog, Button, ErrorMessage } from '@components';
import { skipperDeploymentStrategyLabel } from '@core/nautica-types';
import { SkipperDeploymentStrategies } from '@core/gen/skipper/api/skipper_pb';

const strategyOptions = [
  { value: String(SkipperDeploymentStrategies.SKIPPER_DEPLOYMENT_STRATEGY_ROLLING_UPDATE), label: 'Rolling Update' },
  { value: String(SkipperDeploymentStrategies.SKIPPER_DEPLOYMENT_STRATEGY_BLUE_GREEN), label: 'Blue/Green' },
  { value: String(SkipperDeploymentStrategies.SKIPPER_DEPLOYMENT_STRATEGY_CANARY), label: 'Canary' },
  { value: String(SkipperDeploymentStrategies.SKIPPER_DEPLOYMENT_STRATEGY_IMMEDIATE), label: 'Immediate' },
];

interface BuildRow {
  packageName: string;
  packageVersion: string;
  owner: string;
  status: string;
  timestamp: number;
}

export function SkipperBuilds() {
  const dispatch = useAppDispatch();
  const { builds, loading, error } = useAppSelector((state) => state.skipper);

  const [showInfo, setShowInfo] = useState(false);
  const [showBuildDialog, setShowBuildDialog] = useState(false);

  const { formData, saving, handleChange, handleSubmit, resetForm } = useForm({
    initialData: { packageName: '', packageVersion: '', owner: '' },
    onSubmit: async (data) => { await dispatch(buildSkipperPackage(data)).unwrap(); },
    onSuccess: () => setShowBuildDialog(false),
  });

  const onFieldChange = (e: { target: { name: string; value: string } }) => {
    handleChange(e.target.name as keyof typeof formData, e.target.value);
  };

  const statusVariant = (s: string): 'success' | 'warning' | 'info' | 'error' | 'default' => {
    switch (s) {
      case 'done': return 'success';
      case 'building': return 'warning';
      case 'pending': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    {
      header: 'Package',
      accessor: (b: BuildRow) => b.packageName,
      filterValue: (b: BuildRow) => b.packageName,
      searchable: true,
    },
    {
      header: 'Version',
      accessor: (b: BuildRow) => b.packageVersion || '—',
      filterValue: (b: BuildRow) => b.packageVersion || '',
      width: '120px',
    },
    {
      header: 'Owner',
      accessor: (b: BuildRow) => b.owner,
      filterValue: (b: BuildRow) => b.owner,
    },
    {
      header: 'Status',
      accessor: (b: BuildRow) => Cell.badge(b.status, statusVariant(b.status)),
      filterValue: (b: BuildRow) => b.status,
      width: '100px',
    },
    {
      header: 'Time',
      accessor: (b: BuildRow) => new Date(b.timestamp).toLocaleString(),
      filterValue: (b: BuildRow) => new Date(b.timestamp).toLocaleString(),
      width: '180px',
    },
  ];

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <Card
      title="Builds"
      titleAction={<InfoSection.Toggle open={showInfo} onToggle={setShowInfo} />}
      headerAction={
        <Button size="sm" icon="build" onClick={() => { resetForm(); setShowBuildDialog(true); }}>
          New Build
        </Button>
      }
    >
      <InfoSection open={showInfo}>
        <p>Skipper manages package builds and deployments. Build packages here, then push them to targets using rolling update, blue/green, canary, or immediate deployment strategies.</p>
      </InfoSection>
      <Table
        data={builds}
        columns={columns}
        getRowKey={(b: BuildRow) => `${b.packageName}-${b.packageVersion}-${b.timestamp}`}
        emptyMessage={loading ? 'Building...' : 'No builds yet. Start a build to get started.'}
        searchable
        searchPlaceholder="Search builds..."
        paginate
        pageSize={25}
        tableId="skipper-builds"
      />

      <FormDialog
        isOpen={showBuildDialog}
        onClose={() => setShowBuildDialog(false)}
        title="Build Package"
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        saving={saving}
        submitText="Build"
        submitDisabled={!formData.packageName || !formData.owner}
      >
        <FormField
          label="Package Name"
          name="packageName"
          value={formData.packageName}
          onChange={onFieldChange}
          placeholder="e.g. ocean-server"
          required
        />
        <FormField
          label="Version"
          name="packageVersion"
          value={formData.packageVersion}
          onChange={onFieldChange}
          placeholder="e.g. 1.2.3"
        />
        <FormField
          label="Owner"
          name="owner"
          value={formData.owner}
          onChange={onFieldChange}
          placeholder="Your username"
          required
        />
      </FormDialog>
    </Card>
  );
}
