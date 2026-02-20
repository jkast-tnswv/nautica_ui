import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import { useForm } from '@core/hooks/useForm';
import { createCaptainGroup } from '../slices/captainGroupsSlice';
import { Table, Card, InfoSection, FormField, FormDialog, Button, ErrorMessage } from '@components';
import type { CaptainGroup } from '@core/gen/captain/api/captain_pb';

export function CaptainGroups() {
  const dispatch = useAppDispatch();
  const { items: groups, loading, error } = useAppSelector((state) => state.captainGroups);

  const [showInfo, setShowInfo] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { formData, saving, handleChange, handleSubmit, resetForm } = useForm({
    initialData: { groupName: '' },
    onSubmit: async (data) => { await dispatch(createCaptainGroup(data)).unwrap(); },
    onSuccess: () => setShowCreateDialog(false),
  });

  const onFieldChange = (e: { target: { name: string; value: string } }) => {
    handleChange(e.target.name as keyof typeof formData, e.target.value);
  };

  const columns = [
    {
      header: 'Group ID',
      accessor: (g: CaptainGroup) => g.groupId || '—',
      searchValue: (g: CaptainGroup) => g.groupId,
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
      filterValue: (g: CaptainGroup) => String(g.captainUsers.length),
      width: '80px',
    },
    {
      header: 'Sub-groups',
      accessor: (g: CaptainGroup) => g.captainGroups.length,
      filterValue: (g: CaptainGroup) => String(g.captainGroups.length),
      width: '100px',
    },
  ];

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <Card
      title="Groups"
      titleAction={<InfoSection.Toggle open={showInfo} onToggle={setShowInfo} />}
      headerAction={
        <Button size="sm" icon="group_add" onClick={() => { resetForm(); setShowCreateDialog(true); }}>
          New Group
        </Button>
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
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        saving={saving}
        submitText="Create Group"
        submitDisabled={!formData.groupName}
      >
        <FormField
          label="Group Name"
          name="groupName"
          value={formData.groupName}
          onChange={onFieldChange}
          placeholder="e.g. network-admins"
          required
        />
      </FormDialog>
    </Card>
  );
}
