import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import { useForm } from '@core/hooks/useForm';
import { createCaptainUser } from '../slices/captainUsersSlice';
import { Table, Cell, Card, InfoSection, FormField, FormDialog, Button, ErrorMessage } from '@components';
import type { CaptainUser } from '@core/gen/captain/api/captain_pb';

export function CaptainUsers() {
  const dispatch = useAppDispatch();
  const { items: users, loading, error } = useAppSelector((state) => state.captainUsers);

  const [showInfo, setShowInfo] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { formData, saving, handleChange, handleSubmit, resetForm } = useForm({
    initialData: { username: '', firstName: '', lastName: '' },
    onSubmit: async (data) => { await dispatch(createCaptainUser(data)).unwrap(); },
    onSuccess: () => setShowCreateDialog(false),
  });

  const onFieldChange = (e: { target: { name: string; value: string } }) => {
    handleChange(e.target.name as keyof typeof formData, e.target.value);
  };

  const columns = [
    {
      header: 'User ID',
      accessor: (u: CaptainUser) => Cell.truncate(u.userId, 12),
      width: '140px',
      searchValue: (u: CaptainUser) => u.userId,
    },
    {
      header: 'Username',
      accessor: 'username' as keyof CaptainUser,
      searchable: true,
    },
    {
      header: 'First Name',
      accessor: 'firstName' as keyof CaptainUser,
    },
    {
      header: 'Last Name',
      accessor: 'lastName' as keyof CaptainUser,
    },
  ];

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <Card
      title="Captain"
      titleAction={<InfoSection.Toggle open={showInfo} onToggle={setShowInfo} />}
      headerAction={
        <Button size="sm" icon="person_add" onClick={() => { resetForm(); setShowCreateDialog(true); }}>
          New User
        </Button>
      }
    >
      <InfoSection open={showInfo}>
        <p>Captain manages users and their permissions across Nautica services. Users created here can be assigned to groups for role-based access control.</p>
      </InfoSection>
      <Table
        data={users}
        columns={columns}
        getRowKey={(u: CaptainUser) => u.userId || u.username}
        emptyMessage={loading ? 'Loading users...' : 'No users yet. Create one to get started.'}
        searchable
        searchPlaceholder="Search users..."
        paginate
        pageSize={25}
        tableId="captain-users"
      />

      <FormDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        title="Create User"
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        saving={saving}
        submitText="Create User"
        submitDisabled={!formData.username}
      >
        <FormField
          label="Username"
          name="username"
          value={formData.username}
          onChange={onFieldChange}
          placeholder="e.g. jsmith"
          required
        />
        <FormField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={onFieldChange}
          placeholder="John"
        />
        <FormField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={onFieldChange}
          placeholder="Smith"
        />
      </FormDialog>
    </Card>
  );
}
