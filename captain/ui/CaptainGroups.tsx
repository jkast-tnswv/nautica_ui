import React, { useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import { createCaptainGroup } from './captainGroupsSlice';
import { Table, Card, InfoSection, FormField, FormDialog } from '@components';
import type { CaptainGroup } from '@core/gen/captain/api/captain_pb';

export function CaptainGroups() {
  const dispatch = useAppDispatch();
  const { items: groups, loading, error } = useAppSelector((state) => state.captainGroups);

  const [showInfo, setShowInfo] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ groupName: '' });

  const handleChange = (e: { target: { name: string; value: string } }) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatch(createCaptainGroup(formData)).unwrap();
      setShowCreateDialog(false);
      setFormData({ groupName: '' });
    } catch { /* error handled by slice */ }
    setSaving(false);
  };

  const columns = [
    {
      header: 'Group ID',
      accessor: (g: CaptainGroup) => g.groupId || '—',
      width: '140px',
    },
    {
      header: 'Group Name',
      accessor: 'groupName' as keyof CaptainGroup,
      searchable: true,
    },
    {
      header: 'Captain',
      accessor: (g: CaptainGroup) => g.captainUsers.length,
      width: '80px',
    },
    {
      header: 'Sub-groups',
      accessor: (g: CaptainGroup) => g.captainGroups.length,
      width: '100px',
    },
  ];

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <Card
      title="Groups"
      titleAction={<InfoSection.Toggle open={showInfo} onToggle={setShowInfo} />}
      headerAction={
        <button className="btn btn-sm btn-primary" onClick={() => setShowCreateDialog(true)}>
          <span className="material-icons-outlined">group_add</span>
          New Group
        </button>
      }
    >
      <InfoSection open={showInfo}>
        <p>Groups organize users for role-based access control. Groups can contain users and nested sub-groups for hierarchical permissions.</p>
      </InfoSection>
      <Table
        data={groups}
        columns={columns}
        getRowKey={(g: CaptainGroup) => g.groupId || g.groupName}
        emptyMessage={loading ? 'Loading groups...' : 'No groups yet. Create one to get started.'}
        searchable
        searchPlaceholder="Search groups..."
        paginate
        pageSize={25}
        tableId="captain-groups"
      />

      <FormDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        title="Create Group"
        onSubmit={handleSubmit}
        saving={saving}
        submitText="Create Group"
        submitDisabled={!formData.groupName}
      >
        <FormField
          label="Group Name"
          name="groupName"
          value={formData.groupName}
          onChange={handleChange}
          placeholder="e.g. network-admins"
          required
        />
      </FormDialog>
    </Card>
  );
}
