import { useAuth } from '@core/hooks/useAuth';
import { Icon } from './Icon';
import { Button } from './Button';

export function LoginPage() {
  const { login, loading } = useAuth();

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <Icon name="sailing" size={48} />
          <h2>Nautica</h2>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
            Network automation platform
          </p>
        </div>
        <Button onClick={login} isLoading={loading} size="lg">
          Sign in with Okta
        </Button>
      </div>
    </div>
  );
}
