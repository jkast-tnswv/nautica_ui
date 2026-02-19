import React, { useMemo, useState, type FormEvent } from 'react';
import { useHarborJobs } from './useHarborJobs';
import { Table, Cell, FormField, FormDialog, ActionBar, Checkbox } from '@components';
import type { HarborResponse } from '@core/gen/harbor/api/harbor_pb';
import { HarborJobTypes } from '@core/gen/harbor/api/harbor_pb';
import {
  harborJobTypeLabel,
  harborJobStatusLabel,
  harborJobStatusVariant,
} from '@core/nautica-types';

export function HarborJobs() {
  const { jobs, loading, error, refresh, embark, disembark } = useHarborJobs();

  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'embark' | 'disembark'>('embark');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    hostname: '',
    owner: '',
    dryRun: false,
    force: false,
  });

  const handleChange = (e: { target: { name: string; value: string } }) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openDialog = (type: 'embark' | 'disembark') => {
    setDialogType(type);
    setFormData({ hostname: '', owner: '', dryRun: false, force: false });
    setShowDialog(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      hostname: formData.hostname,
      harborJobType: dialogType === 'embark'
        ? HarborJobTypes.HARBOR_JOB_TYPE_EMBARK
        : HarborJobTypes.HARBOR_JOB_TYPE_DISEMBARK,
      owner: formData.owner,
      dryRun: formData.dryRun,
      force: formData.force,
    };
    const fn = dialogType === 'embark' ? embark : disembark;
    const success = await fn(data);
    setSaving(false);
    if (success) {
      setShowDialog(false);
    }
  };

  const columns = useMemo(() => [
    {
      header: 'Job ID',
      accessor: (j: HarborResponse) => Cell.truncate(j.jobId, 12),
      width: '140px',
      searchValue: (j: HarborResponse) => j.jobId,
    },
    {
      header: 'Hostname',
      accessor: 'hostname' as keyof HarborResponse,
      searchable: true,
    },
    {
      header: 'Type',
      accessor: (j: HarborResponse) => Cell.badge(
        harborJobTypeLabel(j.harborJobType),
        j.harborJobType === HarborJobTypes.HARBOR_JOB_TYPE_EMBARK ? 'info' : 'warning',
      ),
    },
    {
      header: 'Owner',
      accessor: 'owner' as keyof HarborResponse,
    },
    {
      header: 'Status',
      accessor: (j: HarborResponse) => Cell.badge(
        harborJobStatusLabel(j.harborJobStatus),
        harborJobStatusVariant(j.harborJobStatus),
      ),
    },
    {
      header: 'Dry Run',
      accessor: (j: HarborResponse) => j.dryRun ? Cell.badge('Yes', 'warning') : '—',
      width: '80px',
    },
  ], []);

  if (error) {
    return <div className="error-message">Error loading harbor jobs: {error}</div>;
  }

  return (
    <div>
      <ActionBar>
        <button className="btn btn-primary" onClick={() => openDialog('embark')}>
          <span className="material-icons-outlined">login</span>
          Embark
        </button>
        <button className="btn btn-secondary" onClick={() => openDialog('disembark')}>
          <span className="material-icons-outlined">logout</span>
          Disembark
        </button>
        <button className="btn btn-secondary" onClick={refresh}>
          <span className="material-icons-outlined">refresh</span>
          Refresh
        </button>
      </ActionBar>

      <Table
        data={jobs}
        columns={columns}
        getRowKey={(j) => j.jobId}
        emptyMessage={loading ? 'Loading jobs...' : 'No harbor jobs found'}
        searchable
        searchPlaceholder="Search harbor jobs..."
        paginate
        pageSize={25}
        tableId="harbor-jobs"
      />

      <FormDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title={dialogType === 'embark' ? 'Embark Device' : 'Disembark Device'}
        onSubmit={handleSubmit}
        saving={saving}
        submitText={dialogType === 'embark' ? 'Embark' : 'Disembark'}
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
        <FormField
          label="Owner"
          name="owner"
          value={formData.owner}
          onChange={handleChange}
          placeholder="Your username"
          required
        />
        <Checkbox
          label="Dry Run"
          checked={formData.dryRun}
          onChange={(checked) => setFormData(prev => ({ ...prev, dryRun: checked }))}
        />
        <Checkbox
          label="Force"
          checked={formData.force}
          onChange={(checked) => setFormData(prev => ({ ...prev, force: checked }))}
        />
      </FormDialog>
    </div>
  );
}
