import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Icon } from './Icon';

interface Slide {
  title: string;
  icon: string;
  page?: string;
  content: React.ReactNode;
}

const SLIDES: Slide[] = [
  {
    title: 'Welcome to Nautica',
    icon: 'waving_hand',
    content: (
      <>
        <p>
          Nautica is a datacenter infrastructure management UI built on gRPC microservices.
          It provides device management, provisioning, maintenance, access control, and more.
        </p>
        <div className="help-tour-tips">
          <h4>Quick Tips</h4>
          <ul>
            <li>Use the <strong>page selector</strong> in the header to switch between all 7 pages</li>
            <li>Pages with <strong>side tabs</strong> have multiple views — click tabs to switch</li>
            <li>The <strong>footer toolbar</strong> has settings, API history, and this help guide</li>
            <li>Press <kbd>Escape</kbd> to close any dialog</li>
            <li>Tables support <strong>search</strong>, <strong>sorting</strong>, and <strong>click-to-expand</strong></li>
          </ul>
        </div>
      </>
    ),
  },
  {
    title: 'TideWatch — Dashboard',
    icon: 'analytics',
    page: 'tidewatch',
    content: (
      <>
        <p>
          TideWatch provides a real-time statistics dashboard across all Nautica services.
        </p>
        <div className="help-tour-tips">
          <h4>Features</h4>
          <ul>
            <li>View <strong>resource statistics</strong> for devices, circuits, jobs, and infrastructure</li>
            <li>Click tiles to <strong>expand</strong> breakdowns by status, type, and model</li>
            <li>Use the <strong>time range selector</strong> to adjust the monitoring window</li>
            <li>Monitor <strong>Shipwright job trends</strong> with the timeline chart</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    title: 'Anchor & Keel — Infrastructure',
    icon: 'domain',
    page: 'infra',
    content: (
      <>
        <p>
          The Infrastructure page covers physical locations, hardware catalog, and parts inventory.
        </p>
        <div className="help-tour-tips">
          <h4><Icon name="location_on" size={16} /> Anchor Tab</h4>
          <ul>
            <li>Browse datacenter <strong>locations</strong> managed by Anchor</li>
          </ul>
          <h4><Icon name="memory" size={16} /> Keel Tab</h4>
          <ul>
            <li>View the <strong>hardware catalog</strong> with device models and specs</li>
          </ul>
          <h4><Icon name="category" size={16} /> Quartermaster Tab</h4>
          <ul>
            <li>Track <strong>parts inventory</strong> and availability</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    title: 'Captain — Users & Groups',
    icon: 'admin_panel_settings',
    page: 'access',
    content: (
      <>
        <p>
          The Captain page manages user access control with users and hierarchical groups.
        </p>
        <div className="help-tour-tips">
          <h4><Icon name="person" size={16} /> Users Tab</h4>
          <ul>
            <li>Create and manage <strong>users</strong> with role-based access</li>
            <li>View user details including roles and group memberships</li>
          </ul>
          <h4><Icon name="group" size={16} /> Groups Tab</h4>
          <ul>
            <li>Organize users into <strong>groups</strong> for hierarchical permissions</li>
            <li>Groups can contain users and <strong>nested sub-groups</strong></li>
          </ul>
        </div>
      </>
    ),
  },
  {
    title: 'Ledger — DNS Search',
    icon: 'travel_explore',
    page: 'dns',
    content: (
      <>
        <p>
          Ledger provides DNS record lookup and search across your infrastructure.
        </p>
        <div className="help-tour-tips">
          <h4>Features</h4>
          <ul>
            <li>Search DNS records by <strong>hostname</strong>, <strong>record type</strong>, or <strong>value</strong></li>
            <li>View record details including TTL and metadata</li>
            <li>Filter results with <strong>per-column filters</strong> on type and other fields</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    title: 'Ocean — Devices & Circuits',
    icon: 'dns',
    page: 'devices',
    content: (
      <>
        <p>
          The Ocean page manages network devices and the circuits connecting them.
        </p>
        <div className="help-tour-tips">
          <h4><Icon name="dns" size={16} /> Devices Tab</h4>
          <ul>
            <li>View all devices managed by the <strong>Ocean</strong> service</li>
            <li>Filter by <strong>status</strong>, <strong>state</strong>, and <strong>chassis model</strong></li>
          </ul>
          <h4><Icon name="cable" size={16} /> Circuits Tab</h4>
          <ul>
            <li>View network <strong>circuits</strong> connecting devices</li>
            <li>Circuits show A/Z endpoints, status, state, and link speed</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    title: 'Shipwright & Harbor — Jobs',
    icon: 'build',
    page: 'jobs',
    content: (
      <>
        <p>
          The Jobs page combines Shipwright provisioning workflows and Harbor maintenance operations.
        </p>
        <div className="help-tour-tips">
          <h4><Icon name="build" size={16} /> Shipwright Tab</h4>
          <ul>
            <li>Create and monitor <strong>provisioning workflows</strong></li>
            <li>Click a job to see the <strong>workflow viewer</strong> with step-by-step details</li>
          </ul>
          <h4><Icon name="anchor" size={16} /> Harbor Tab</h4>
          <ul>
            <li>Manage <strong>embark/disembark</strong> operations with dry run and force options</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    title: 'Skipper — Deployments',
    icon: 'rocket_launch',
    page: 'deploy',
    content: (
      <>
        <p>
          The Skipper page manages package builds and deployments across your infrastructure.
        </p>
        <div className="help-tour-tips">
          <h4>Builds</h4>
          <ul>
            <li>Create new <strong>package builds</strong> with name, version, and owner</li>
            <li>Track build <strong>status</strong> from pending through completion</li>
          </ul>
          <h4>Deployment Strategies</h4>
          <ul>
            <li>Supports <strong>rolling update</strong>, <strong>blue/green</strong>, <strong>canary</strong>, and <strong>immediate</strong> strategies</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    title: 'Toolbar & Tips',
    icon: 'tips_and_updates',
    content: (
      <>
        <div className="help-tour-tips">
          <h4>Footer Toolbar</h4>
          <ul>
            <li><Icon name="history" size={16} /> <strong>API History</strong> — browse all gRPC/API calls with request/response details</li>
            <li><Icon name="bug_report" size={16} /> <strong>Bug Report</strong> — download a diagnostic snapshot</li>
            <li><Icon name="settings" size={16} /> <strong>Settings</strong> — configure API URL, table page size, and layout</li>
            <li><Icon name="palette" size={16} /> <strong>Theme</strong> — choose from 12 themes</li>
          </ul>
          <h4>Keyboard & UI</h4>
          <ul>
            <li><kbd>Escape</kbd> — close any open dialog or modal</li>
            <li>The <strong>page selector</strong> is searchable — type to filter pages</li>
            <li>Click the <strong>bell icon</strong> for notifications, <strong>sticky note</strong> for quick notes</li>
            <li>Open <strong>Settings</strong> to adjust page width and dialog size</li>
          </ul>
        </div>
      </>
    ),
  },
];

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string) => void;
}

export function HelpDialog({ isOpen, onClose, onNavigate }: HelpDialogProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = SLIDES[currentSlide];
  const isFirst = currentSlide === 0;
  const isLast = currentSlide === SLIDES.length - 1;

  useEffect(() => {
    if (isOpen && slide.page && onNavigate) {
      onNavigate(slide.page);
    }
  }, [currentSlide, isOpen]);

  const goNext = () => { if (!isLast) setCurrentSlide(currentSlide + 1); };
  const goPrev = () => { if (!isFirst) setCurrentSlide(currentSlide - 1); };
  const goTo = (index: number) => { setCurrentSlide(index); };

  const handleClose = () => {
    setCurrentSlide(0);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={slide.title}
      variant="wide"
      footer={
        <div className="help-tour-footer">
          <div className="help-tour-dots">
            {SLIDES.map((s, i) => (
              <button
                key={i}
                className={`help-tour-dot${i === currentSlide ? ' active' : ''}`}
                onClick={() => goTo(i)}
                title={s.title}
              >
                <Icon name={s.icon} size={14} />
              </button>
            ))}
          </div>
          <div className="help-tour-nav">
            <Button variant="secondary" onClick={goPrev} disabled={isFirst}>
              <Icon name="chevron_left" size={16} />
              Previous
            </Button>
            {isLast ? (
              <Button onClick={handleClose}>
                Done
              </Button>
            ) : (
              <Button onClick={goNext}>
                Next
                <Icon name="chevron_right" size={16} />
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="help-tour-slide">
        <div className="help-tour-slide-icon">
          <Icon name={slide.icon} size={36} />
        </div>
        <div className="help-tour-slide-content">
          {slide.content}
        </div>
      </div>
    </Modal>
  );
}
