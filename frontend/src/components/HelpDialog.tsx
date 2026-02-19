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
          It provides device management, provisioning workflows, and maintenance operations.
        </p>
        <div className="help-tour-tips">
          <h4>Quick Tips</h4>
          <ul>
            <li>Use the <strong>page selector</strong> in the header to switch between Devices and Jobs</li>
            <li>The <strong>footer toolbar</strong> has settings, API history, and this help guide</li>
            <li>Press <kbd>Escape</kbd> to close any dialog</li>
            <li>Tables support <strong>search</strong>, <strong>sorting</strong>, and <strong>click-to-expand</strong></li>
            <li>Theme, layout, and page preferences are saved automatically</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    title: 'Devices',
    icon: 'dns',
    page: 'devices',
    content: (
      <>
        <p>
          The Devices page shows Ocean-managed devices and circuits.
        </p>
        <div className="help-tour-tips">
          <h4>Ocean Devices</h4>
          <ul>
            <li>View all devices managed by the <strong>Ocean</strong> service</li>
            <li>Click a row to <strong>expand</strong> and see full device details</li>
            <li>Use the <strong>action bar</strong> to filter, search, and manage devices</li>
          </ul>
          <h4>Ocean Circuits</h4>
          <ul>
            <li>View network <strong>circuits</strong> connecting devices</li>
            <li>Circuits show endpoints, status, and bandwidth information</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    title: 'Jobs',
    icon: 'build',
    page: 'jobs',
    content: (
      <>
        <p>
          The Jobs page combines Shipwright provisioning workflows and Harbor maintenance operations.
        </p>
        <div className="help-tour-tips">
          <h4>Shipwright Jobs</h4>
          <ul>
            <li>Create and monitor <strong>provisioning workflows</strong></li>
            <li>View job <strong>status</strong>, logs, and timing</li>
            <li>Click a job to see the <strong>workflow viewer</strong> with step-by-step details</li>
          </ul>
          <h4>Harbor Jobs</h4>
          <ul>
            <li>Manage <strong>maintenance operations</strong> (embark/disembark)</li>
            <li>Track maintenance windows and device status changes</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    title: 'Footer Toolbar',
    icon: 'toolbar',
    content: (
      <>
        <p>
          The footer toolbar provides quick access to utility features from any page.
        </p>
        <div className="help-tour-tips">
          <h4>Left Side</h4>
          <ul>
            <li><Icon name="history" size={16} /> <strong>API History</strong> — browse all gRPC/API calls with request/response details</li>
            <li><Icon name="bug_report" size={16} /> <strong>Bug Report</strong> — download a diagnostic snapshot (API history, store state, local storage)</li>
          </ul>
          <h4>Right Side</h4>
          <ul>
            <li><Icon name="settings" size={16} /> <strong>Settings</strong> — configure API URL, table page size, and layout</li>
            <li><Icon name="palette" size={16} /> <strong>Theme</strong> — choose from 12 themes</li>
            <li><Icon name="help" size={16} /> <strong>Help</strong> — this guide</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    title: 'Keyboard & UI Tips',
    icon: 'keyboard',
    content: (
      <>
        <div className="help-tour-tips">
          <h4>Keyboard Shortcuts</h4>
          <ul>
            <li><kbd>Escape</kbd> — close any open dialog or modal</li>
          </ul>
          <h4>Header Controls</h4>
          <ul>
            <li>Click the <strong>bell icon</strong> to view notification history</li>
            <li>Click the <strong>sticky note icon</strong> for quick notes (persists across sessions)</li>
            <li>The <strong>page selector</strong> is searchable — type to filter pages</li>
          </ul>
          <h4>Layout Settings</h4>
          <ul>
            <li>Open <strong>Settings</strong> to adjust page width and dialog size</li>
            <li>Layout preferences persist across sessions</li>
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
