import { ReactNode, useRef, useEffect, useState } from 'react';
import { Icon, SpinnerIcon } from './Icon';

interface StatTileProps {
  title: string;
  icon: string;
  headline: ReactNode;
  loading: boolean;
  error: string | null;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function StatTile({ title, icon, headline, loading, error, expanded, onToggle, children }: StatTileProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expanded, children]);

  return (
    <div className={`stat-tile ${expanded ? 'stat-tile-expanded' : ''}`} onClick={onToggle}>
      <div className="stat-tile-header">
        <div className="stat-tile-icon">
          <Icon name={icon} size={24} />
        </div>
        <div className="stat-tile-info">
          <div className="stat-tile-title">{title}</div>
          <div className="stat-tile-headline">
            {loading ? <SpinnerIcon size={20} /> : error ? <span className="stat-tile-error">Error</span> : headline}
          </div>
        </div>
        <Icon
          name={expanded ? 'expand_less' : 'expand_more'}
          size={20}
          className="stat-tile-chevron"
        />
      </div>
      <div
        className="stat-tile-content"
        style={{ maxHeight: expanded ? contentHeight : 0 }}
      >
        <div ref={contentRef} onClick={(e) => e.stopPropagation()}>
          {error ? (
            <div className="message error" style={{ margin: '8px 0 0' }}>{error}</div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}
