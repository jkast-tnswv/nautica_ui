import { render, screen } from '@testing-library/react';
import { LoadingState, InlineLoading, ModalLoading } from './LoadingState';

describe('LoadingState', () => {
  it('shows loading spinner when loading', () => {
    render(<LoadingState loading={true}>Content</LoadingState>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('shows custom loading message', () => {
    render(<LoadingState loading={true} loadingMessage="Fetching devices...">Content</LoadingState>);
    expect(screen.getByText('Fetching devices...')).toBeInTheDocument();
  });

  it('shows error when error is set', () => {
    render(<LoadingState loading={false} error="Network error">Content</LoadingState>);
    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('shows children when not loading and no error', () => {
    render(<LoadingState loading={false}>Content here</LoadingState>);
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });

  it('wraps in Card by default when loading', () => {
    const { container } = render(<LoadingState loading={true}>X</LoadingState>);
    expect(container.querySelector('.card')).toBeInTheDocument();
  });

  it('does not wrap in Card when wrapInCard=false', () => {
    const { container } = render(<LoadingState loading={true} wrapInCard={false}>X</LoadingState>);
    expect(container.querySelector('.card')).not.toBeInTheDocument();
    expect(container.querySelector('.loading-state')).toBeInTheDocument();
  });
});

describe('InlineLoading', () => {
  it('renders default loading message', () => {
    render(<InlineLoading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<InlineLoading message="Please wait" />);
    expect(screen.getByText('Please wait')).toBeInTheDocument();
  });
});

describe('ModalLoading', () => {
  it('renders message', () => {
    render(<ModalLoading message="Connecting..." />);
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });
});
