import { render, screen, fireEvent } from '@testing-library/react';
import { FormDialog } from './FormDialog';

describe('FormDialog', () => {
  it('renders nothing when closed', () => {
    render(
      <FormDialog isOpen={false} onClose={() => {}} title="Add Item" onSubmit={() => {}}>
        Fields
      </FormDialog>,
    );
    expect(screen.queryByText('Add Item')).not.toBeInTheDocument();
  });

  it('renders title and children when open', () => {
    render(
      <FormDialog isOpen={true} onClose={() => {}} title="Add Item" onSubmit={() => {}}>
        <input placeholder="Name" />
      </FormDialog>,
    );
    expect(screen.getByText('Add Item')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
  });

  it('renders default Save and Cancel buttons', () => {
    render(
      <FormDialog isOpen={true} onClose={() => {}} title="Test" onSubmit={() => {}}>
        Body
      </FormDialog>,
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders custom submit and cancel text', () => {
    render(
      <FormDialog isOpen={true} onClose={() => {}} title="Test" onSubmit={() => {}} submitText="Create" cancelText="Discard">
        Body
      </FormDialog>,
    );
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Discard')).toBeInTheDocument();
  });

  it('shows Saving... when saving', () => {
    render(
      <FormDialog isOpen={true} onClose={() => {}} title="Test" onSubmit={() => {}} saving>
        Body
      </FormDialog>,
    );
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('calls onClose when Cancel clicked', () => {
    const onClose = vi.fn();
    render(
      <FormDialog isOpen={true} onClose={onClose} title="Test" onSubmit={() => {}}>
        Body
      </FormDialog>,
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('disables submit when submitDisabled', () => {
    render(
      <FormDialog isOpen={true} onClose={() => {}} title="Test" onSubmit={() => {}} submitDisabled>
        Body
      </FormDialog>,
    );
    expect(screen.getByText('Save')).toBeDisabled();
  });
});
