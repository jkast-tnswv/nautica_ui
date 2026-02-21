import { useState, useCallback, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, getApiHistory, getTelemetryEvents, initTelemetry, trackEvent, useNotificationHistory, useModalRoute } from '@core';
import { useInflight, useWebTheme } from '@core/hooks';
import { useAuthState, AuthProvider, useAuth } from '@core/hooks/useAuth';
import {
  ApiHistory,
  CodeGeneratorDialog,
  DropdownSelect,
  ErrorBoundary,
  HelpDialog,
  Notifications,
  NotificationPopup,
  ScratchPad,
  SettingsDialog,
  Telemetry,
  ThemeSelector,
  Tooltip,
  Icon,
  SpinnerIcon,
} from './components';
import type { DropdownOption } from './components';
import { LoginPage } from './components/LoginPage';
import { DevicesPage } from './components/DevicesPage';
import { JobsPage } from './components/JobsPage';
import { DnsPage } from './components/DnsPage';
import { AccessPage } from './components/AccessPage';
import { DeployPage } from './components/DeployPage';
import { InfraPage } from './components/InfraPage';
import { TideWatchPage } from './components/TideWatchPage';
import { IslandPage } from './components/IslandPage';
import { Tensio } from './components/Tensio';
import { LayoutProvider } from './context';
function WaveLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 2200 2200" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M2000,1317.4V2000h-214.2C804,2000,1434.6,882.6,452.9,882.6v0.5H200V200h252.9
        c981.7,0,351.2,1117.4,1332.9,1117.4H2000z"/>
    </svg>
  );
}

declare const __COMMIT_HASH__: string;

const PAGES: DropdownOption[] = [
  { id: 'tidewatch', label: 'TideWatch', icon: 'analytics', description: 'Resource statistics dashboard' },
  { id: 'infra', label: 'Anchor & Keel', icon: 'domain', description: 'Anchor locations and Keel hardware catalog' },
  { id: 'access', label: 'Captain', icon: 'admin_panel_settings', description: 'Captain users and groups' },
  { id: 'dns', label: 'Ledger', icon: 'travel_explore', description: 'Ledger DNS record search' },
  { id: 'devices', label: 'Ocean', icon: 'dns', description: 'Ocean devices and circuits' },
  { id: 'jobs', label: 'Shipwright & Harbor', icon: 'build', description: 'Shipwright provisioning & Harbor maintenance' },
  { id: 'deploy', label: 'Skipper', icon: 'rocket_launch', description: 'Skipper package builds and deployments' },
  { id: 'island', label: 'Island', icon: 'system_update', description: 'Island firmware server' },
];

const LOADING_MESSAGES = [
  'Untangling cables...',
  'Herding packets...',
  'Asking the network nicely...',
  'Negotiating with gRPC...',
  'Polishing the routing tables...',
  'Pinging the mothership...',
];

function InflightIndicator({ count }: { count: number }) {
  const [message] = useState(() =>
    LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
  );

  return (
    <div className="inflight-indicator">
      <SpinnerIcon size={14} />
      <span className="inflight-text">{message}</span>
      {count > 1 && <span className="inflight-count">({count})</span>}
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="login-page">
        <SpinnerIcon size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function OktaCallbackHandler() {
  return (
    <div className="login-page">
      <SpinnerIcon size={32} />
    </div>
  );
}

function LoginRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="login-page">
        <SpinnerIcon size={32} />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/devices" replace />;
  }

  return <LoginPage />;
}

function AuthGate() {
  const auth = useAuthState();

  return (
    <AuthProvider value={auth}>
      <Routes>
        <Route path="/callback" element={<OktaCallbackHandler />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useWebTheme();
  const inflightCount = useInflight();
  const modalRoute = useModalRoute();
  const { unreadCount } = useNotificationHistory();

  const activePage = location.pathname.replace('/', '') || 'devices';

  // Modal states
  const [showApiHistory, setShowApiHistory] = useState(false);
  const [apiHistoryHighlight, setApiHistoryHighlight] = useState<number | null>(null);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showScratchPad, setShowScratchPad] = useState(false);
  const [showGame, setShowGame] = useState(false);

  // Easter egg trigger: click logo 5 times within 3 seconds
  const logoClicksRef = useRef<number[]>([]);
  const handleLogoClick = useCallback(() => {
    const now = Date.now();
    logoClicksRef.current = logoClicksRef.current.filter(t => now - t < 3000).concat(now);
    if (logoClicksRef.current.length >= 2) {
      logoClicksRef.current = [];
      setShowGame(true);
    }
  }, []);

  // Initialize telemetry on mount
  useEffect(() => { initTelemetry(); }, []);

  const handlePageChange = useCallback((pageId: string) => {
    navigate(`/${pageId}`);
    trackEvent('page_nav', pageId);
  }, [navigate]);

  const handleBugReport = useCallback(() => {
    const readStorage = (storage: Storage): Record<string, unknown> => {
      const out: Record<string, unknown> = {};
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i)!;
        const raw = storage.getItem(key);
        try { out[key] = JSON.parse(raw!); } catch { out[key] = raw; }
      }
      return out;
    };
    const report = {
      timestamp: new Date().toISOString(),
      apiHistory: getApiHistory(),
      telemetry: getTelemetryEvents(),
      reduxStore: store.getState(),
      localStorage: readStorage(localStorage),
      sessionStorage: readStorage(sessionStorage),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nautica-bugreport-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-logo" onClick={handleLogoClick} style={{ cursor: 'pointer', userSelect: 'none' }}>
              <WaveLogo className="header-logo-img" />
              <span className="header-title">Nautica</span>
            </div>
            <span className="header-meta" style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : ''}
            </span>
          </div>
          <div className="header-right">
            <Tooltip content="Notifications" position="bottom">
              <button
                className="header-control"
                aria-label="Notifications"
                onClick={() => { setShowNotifications(true); modalRoute.openModal('notifications'); }}
                style={{ position: 'relative', width: 40 }}
              >
                <Icon name="notifications" size={20} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
            </Tooltip>
            <Tooltip content="Notes" position="bottom">
              <button
                className="header-control"
                aria-label="Notes"
                onClick={() => setShowScratchPad((v) => !v)}
                style={{ width: 40 }}
              >
                <Icon name="sticky_note_2" size={20} />
              </button>
            </Tooltip>
            <Tooltip content={`Signed in as ${user?.email || user?.name || 'unknown'}`} position="bottom">
              <button className="header-control" aria-label="Log out" onClick={logout} style={{ width: 40 }}>
                <Icon name="logout" size={20} />
              </button>
            </Tooltip>
            <DropdownSelect
              options={PAGES}
              value={activePage}
              onChange={handlePageChange}
              placeholder="Select page..."
              icon="menu"
              className="header-nav"
              triggerClassName="header-control header-control-dropdown"
              columnRows={4}
              searchable
            />
          </div>
        </div>
      </header>

      <div className="container">
        <Routes>
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/dns" element={<DnsPage />} />
          <Route path="/access" element={<AccessPage />} />
          <Route path="/deploy" element={<DeployPage />} />
          <Route path="/infra" element={<InfraPage />} />
          <Route path="/tidewatch" element={<TideWatchPage />} />
          <Route path="/island" element={<IslandPage />} />
          <Route path="/" element={<Navigate to="/devices" replace />} />
          <Route path="*" element={<Navigate to="/devices" replace />} />
        </Routes>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            {inflightCount > 0 && <InflightIndicator count={inflightCount} />}
            <Tooltip content="QR / Barcode Generator">
              <button
                className="icon-button"
                aria-label="QR / Barcode Generator"
                onClick={() => setShowCodeGenerator(true)}
              >
                <Icon name="qr_code_2" size={20} />
              </button>
            </Tooltip>
            <Tooltip content="API call history">
              <button
                className="icon-button"
                aria-label="API call history"
                onClick={() => { setShowApiHistory(true); modalRoute.openModal('api-history'); }}
              >
                <Icon name="history" size={20} />
              </button>
            </Tooltip>
            <Tooltip content="Telemetry">
              <button
                className="icon-button"
                aria-label="Telemetry"
                onClick={() => { setShowTelemetry(true); modalRoute.openModal('telemetry'); }}
              >
                <Icon name="insights" size={20} />
              </button>
            </Tooltip>
            <Tooltip content="Download bug report">
              <button className="icon-button" aria-label="Download bug report" onClick={handleBugReport}>
                <Icon name="bug_report" size={20} />
              </button>
            </Tooltip>
          </div>
          <div className="footer-actions">
            <Tooltip content="Settings">
              <button
                className="icon-button"
                aria-label="Settings"
                onClick={() => { setShowSettings(true); modalRoute.openModal('settings'); }}
              >
                <Icon name="settings" size={20} />
              </button>
            </Tooltip>
            <ThemeSelector theme={theme} onThemeChange={setTheme} />
            <Tooltip content="Help">
              <button
                className="icon-button"
                aria-label="Help"
                onClick={() => { setShowHelp(true); modalRoute.openModal('help'); }}
              >
                <Icon name="help" size={20} />
              </button>
            </Tooltip>
          </div>
        </div>
      </footer>

      <ApiHistory
        isOpen={showApiHistory}
        onClose={() => { setShowApiHistory(false); setApiHistoryHighlight(null); modalRoute.closeModal(); }}
        highlightTimestamp={apiHistoryHighlight}
      />

      <Telemetry
        isOpen={showTelemetry}
        onClose={() => { setShowTelemetry(false); modalRoute.closeModal(); }}
      />

      <CodeGeneratorDialog
        isOpen={showCodeGenerator}
        onClose={() => setShowCodeGenerator(false)}
      />

      <SettingsDialog
        isOpen={showSettings}
        onClose={() => { setShowSettings(false); modalRoute.closeModal(); }}
      />

      <HelpDialog
        isOpen={showHelp}
        onClose={() => { setShowHelp(false); modalRoute.closeModal(); }}
        onNavigate={handlePageChange}
      />

      <Notifications
        isOpen={showNotifications}
        onClose={() => { setShowNotifications(false); modalRoute.closeModal(); }}
        onViewApiError={(timestamp) => {
          setShowNotifications(false);
          setApiHistoryHighlight(timestamp);
          setShowApiHistory(true);
          modalRoute.openModal('api-history');
        }}
      />

      <ScratchPad
        isOpen={showScratchPad}
        onClose={() => setShowScratchPad(false)}
      />

      <NotificationPopup />

      <Tensio isOpen={showGame} onClose={() => setShowGame(false)} />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <LayoutProvider>
          <AuthGate />
        </LayoutProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
