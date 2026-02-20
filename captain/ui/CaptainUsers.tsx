import React, { useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@core/store/hooks';
import { createCaptainUser } from './captainUsersSlice';
import { Table, Cell, Card, InfoSection, FormField, FormDialog } from '@components';
import type { CaptainUser } from '@core/gen/captain/api/captain_pb';

export function CaptainUsers() {
  const dispatch = useAppDispatch();
  const { items: users, loading, error } = useAppSelector((state) => state.captainUsers);

  const [showInfo, setShowInfo] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ username: '', firstName: '', lastName: '' });

  const handleChange = (e: { target: { name: string; value: string } }) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatch(createCaptainUser(formData)).unwrap();
      setShowCreateDialog(false);
      setFormData({ username: '', firstName: '', lastName: '' });
    } catch { /* error handled by slice */ }
    setSaving(false);
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
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <Card
      title="Users"
      titleAction={<InfoSection.Toggle open={showInfo} onToggle={setShowInfo} />}
      headerAction={
        <button className="btn btn-sm btn-primary" onClick={() => setShowCreateDialog(true)}>
          <span className="material-icons-outlined">person_add</span>
          New User
        </button>
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
        onSubmit={handleSubmit}
        saving={saving}
        submitText="Create User"
        submitDisabled={!formData.username}
      >
        <FormField
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="e.g. jsmith"
          required
        />
        <FormField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="John"
        />
        <FormField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Smith"
        />
      </FormDialog>
    </Card>
  );
}
