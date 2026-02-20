import { render, screen, fireEvent } from '@testing-library/react';
import { LoginPage } from './LoginPage';

const mockLogin = vi.fn();

vi.mock('@core/hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    loading: false,
  }),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Nautica branding', () => {
    render(<LoginPage />);
    expect(screen.getByText('Nautica')).toBeInTheDocument();
    expect(screen.getByText('Network automation platform')).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    render(<LoginPage />);
    expect(screen.getByText('Sign in with Okta')).toBeInTheDocument();
  });

  it('calls login on button click', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText('Sign in with Okta'));
    expect(mockLogin).toHaveBeenCalledOnce();
  });
});
