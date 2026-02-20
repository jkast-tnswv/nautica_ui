import React, { useMemo, useState, type FormEvent } from 'react';
import { useShipwrightJobs } from './useShipwrightJobs';
import { Table, Cell, SelectField, FormField, FormDialog, Card, InfoSection } from '@components';
import type { ShipwrightJobResponse } from '@core/gen/shipwright/api/shipwright_pb';
import { ShipwrightJobTypes } from '@core/gen/shipwright/api/shipwright_pb';
import {
  shipwrightJobTypeLabel,
  shipwrightJobStatusLabel,
  shipwrightJobStatusVariant,
  formatTimestamp,
} from '@core/nautica-types';
import { WorkflowViewer } from './WorkflowViewer';

const jobTypeOptions = [
  { value: String(ShipwrightJobTypes.SHIPWRIGHT_JOB_TYPE_CONFIGURE), label: 'Configure' },
  { value: String(ShipwrightJobTypes.SHIPWRIGHT_JOB_TYPE_RECONFIGURE), label: 'Reconfigure' },
  { value: String(ShipwrightJobTypes.SHIPWRIGHT_JOB_TYPE_UNCONFIGURE), label: 'Unconfigure' },
];

export function ShipwrightJobs() {
  const {
    jobs, loading, error, refresh,
    createJob, selectedJobDetails, detailsLoading, detailsError, loadJobDetails, clearDetails,
  } = useShipwrightJobs();

  const [showInfo, setShowInfo] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    hostname: '',
    jobType: String(ShipwrightJobTypes.SHIPWRIGHT_JOB_TYPE_CONFIGURE),
    owner: '',
  });

  const handleChange = (e: { target: { name: string; value: string } }) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = await createJob({
      hostname: formData.hostname,
      shipwrightJobType: Number(formData.jobType),
      owner: formData.owner,
    });
    setSaving(false);
    if (success) {
      setShowCreateDialog(false);
      setFormData({ hostname: '', jobType: String(ShipwrightJobTypes.SHIPWRIGHT_JOB_TYPE_CONFIGURE), owner: '' });
    }
  };

  const columns = useMemo(() => [
    {
      header: 'Job ID',
      accessor: (j: ShipwrightJobResponse) => Cell.truncate(j.jobId, 12),
      width: '140px',
      searchValue: (j: ShipwrightJobResponse) => j.jobId,
    },
    {
      header: 'Hostname',
      accessor: 'hostname' as keyof ShipwrightJobResponse,
      searchable: true,
    },
    {
      header: 'Type',
      accessor: (j: ShipwrightJobResponse) => Cell.badge(
        shipwrightJobTypeLabel(j.shipwrightJobType),
        'info',
      ),
    },
    {
      header: 'Owner',
      accessor: 'owner' as keyof ShipwrightJobResponse,
    },
    {
      header: 'Status',
      accessor: (j: ShipwrightJobResponse) => Cell.badge(
        shipwrightJobStatusLabel(j.shipwrightJobStatus),
        shipwrightJobStatusVariant(j.shipwrightJobStatus),
      ),
    },
    {
      header: 'Created',
      accessor: (j: ShipwrightJobResponse) => formatTimestamp(j.timestampJobCreated),
      width: '180px',
    },
    {
      header: 'Ended',
      accessor: (j: ShipwrightJobResponse) => formatTimestamp(j.timestampJobEnded),
      width: '180px',
    },
  ], []);

  if (error && jobs.length === 0) {
    return <div className="error-message">Error loading jobs: {error}</div>;
  }

  return (
    <Card
      title="Shipwright"
      titleAction={<InfoSection.Toggle open={showInfo} onToggle={setShowInfo} />}
      headerAction={
        <>
          <button className="btn btn-sm btn-primary" onClick={() => setShowCreateDialog(true)}>
            <span className="material-icons-outlined">add</span>
            New Job
          </button>
          <button className="btn btn-sm btn-secondary" onClick={refresh}>
            <span className="material-icons-outlined">refresh</span>
            Refresh
          </button>
        </>
      }
    >
      <InfoSection open={showInfo}>
        <p>Shipwright manages device configuration workflows. Create jobs to configure, reconfigure, or unconfigure network devices. Click a row to view workflow details.</p>
      </InfoSection>

      <Table
        data={jobs}
        columns={columns}
        getRowKey={(j) => j.jobId}
        emptyMessage={loading ? 'Loading jobs...' : 'No jobs found'}
        searchable
        searchPlaceholder="Search jobs..."
        paginate
        pageSize={25}
        tableId="shipwright-jobs"
        onRowClick={(j) => loadJobDetails(j.jobId)}
        renderExpandedRow={(j) => {
          if (detailsError) {
            return <div style={{ padding: '16px', color: 'var(--color-error)' }}>Failed to load details: {detailsError}</div>;
          }
          if (detailsLoading || !selectedJobDetails || selectedJobDetails.jobId !== j.jobId) {
            return <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>Loading workflow details...</div>;
          }
          return <WorkflowViewer details={selectedJobDetails} loading={false} />;
        }}
      />

      <FormDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        title="Create Shipwright Job"
        onSubmit={handleSubmit}
        saving={saving}
        submitText="Create Job"
        submitDisabled={!formData.hostname || !formData.owner}
      >
        <FormField
          label="Hostname"
          name="hostname"
          value={formData.hostname}
          onChange={handleChange}
          placeholder="e.g. switch-01.dc1"
          required
        />
        <SelectField
          label="Job Type"
          name="jobType"
          value={formData.jobType}
          options={jobTypeOptions}
          onChange={handleChange}
        />
        <FormField
          label="Owner"
          name="owner"
          value={formData.owner}
          onChange={handleChange}
          placeholder="Your username"
          required
        />
      </FormDialog>
    </Card>
  );
}
