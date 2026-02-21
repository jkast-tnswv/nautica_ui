import { useState } from 'react';
import { Badge, Card, IconButton, RefreshIcon, StatTile, TimeRangeSelector, TimeSeriesChart } from '@components';
import { useTideWatch } from '@core/hooks/useTideWatch';
import type { StatBreakdown } from '@core/hooks/useTideWatch';

function BreakdownSection({ title, items }: { title: string; items: StatBreakdown[] }) {
  if (items.length === 0) return null;
  return (
    <div className="tidewatch-breakdown">
      <div className="tidewatch-breakdown-title">{title}</div>
      <div className="tidewatch-breakdown-rows">
        {items.map((item) => (
          <div key={item.label} className="tidewatch-breakdown-row">
            <Badge variant={item.variant}>{item.label}</Badge>
            <span className="tidewatch-breakdown-count">{item.count.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TideWatch() {
  const { devices, circuits, shipwrightJobs, harborJobs, anchor, keel, quartermaster, timeRange, setTimeRange, refresh } = useTideWatch();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <Card
      title="TideWatch"
      headerAction={
        <div className="tidewatch-controls">
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          <IconButton variant="ghost" onClick={refresh} title="Refresh statistics">
            <RefreshIcon size={18} />
          </IconButton>
        </div>
      }
    >
      <div className="tidewatch-grid">
        <StatTile
          title="Ocean Devices"
          icon="dns"
          headline={
            devices.data
              ? <span className="stat-tile-number">{devices.data.total.toLocaleString()}</span>
              : null
          }
          loading={devices.loading}
          error={devices.error}
          expanded={expanded.has('devices')}
          onToggle={() => toggle('devices')}
        >
          {devices.data && (
            <>
              <BreakdownSection title="By Status" items={devices.data.byStatus} />
              <BreakdownSection title="By State" items={devices.data.byState} />
              <BreakdownSection title="By Chassis Model" items={devices.data.byModel} />
            </>
          )}
        </StatTile>

        <StatTile
          title="Ocean Circuits"
          icon="cable"
          headline={
            circuits.data
              ? <span className="stat-tile-number">{circuits.data.total.toLocaleString()}</span>
              : null
          }
          loading={circuits.loading}
          error={circuits.error}
          expanded={expanded.has('circuits')}
          onToggle={() => toggle('circuits')}
        >
          {circuits.data && (
            <>
              <BreakdownSection title="By Status" items={circuits.data.byStatus} />
              <BreakdownSection title="By State" items={circuits.data.byState} />
              <BreakdownSection title="By Speed" items={circuits.data.bySpeed} />
            </>
          )}
        </StatTile>

        <StatTile
          title="Shipwright Jobs"
          icon="build"
          headline={
            shipwrightJobs.data
              ? <span className="stat-tile-number">
                  {shipwrightJobs.data.total.toLocaleString()}
                  {shipwrightJobs.data.running > 0 && (
                    <span className="stat-tile-sub"> ({shipwrightJobs.data.running} under sail)</span>
                  )}
                </span>
              : null
          }
          loading={shipwrightJobs.loading}
          error={shipwrightJobs.error}
          expanded={expanded.has('shipwright')}
          onToggle={() => toggle('shipwright')}
        >
          {shipwrightJobs.data && (
            <>
              <BreakdownSection title="By Status" items={shipwrightJobs.data.byStatus} />
              <BreakdownSection title="By Type" items={shipwrightJobs.data.byType} />
            </>
          )}
        </StatTile>

        <StatTile
          title="Harbor Jobs"
          icon="directions_boat"
          headline={
            harborJobs.data
              ? <span className="stat-tile-number">
                  {harborJobs.data.total.toLocaleString()}
                  {harborJobs.data.running > 0 && (
                    <span className="stat-tile-sub"> ({harborJobs.data.running} under sail)</span>
                  )}
                </span>
              : null
          }
          loading={harborJobs.loading}
          error={harborJobs.error}
          expanded={expanded.has('harbor')}
          onToggle={() => toggle('harbor')}
        >
          {harborJobs.data && (
            <>
              <BreakdownSection title="By Status" items={harborJobs.data.byStatus} />
              <BreakdownSection title="By Type" items={harborJobs.data.byType} />
            </>
          )}
        </StatTile>

        <StatTile
          title="Anchor"
          icon="domain"
          headline={<span className="stat-tile-number">{anchor.total.toLocaleString()} <span className="stat-tile-sub">definitions</span></span>}
          loading={false}
          error={null}
          expanded={expanded.has('anchor')}
          onToggle={() => toggle('anchor')}
        >
          <BreakdownSection title="By Type" items={anchor.byCategory} />
        </StatTile>

        <StatTile
          title="Keel"
          icon="memory"
          headline={<span className="stat-tile-number">{keel.total.toLocaleString()} <span className="stat-tile-sub">chassis models</span></span>}
          loading={false}
          error={null}
          expanded={expanded.has('keel')}
          onToggle={() => toggle('keel')}
        >
          <BreakdownSection title="By Vendor" items={keel.byCategory} />
        </StatTile>

        <StatTile
          title="Quartermaster"
          icon="inventory_2"
          headline={<span className="stat-tile-number">{quartermaster.total.toLocaleString()} <span className="stat-tile-sub">part categories</span></span>}
          loading={false}
          error={null}
          expanded={expanded.has('quartermaster')}
          onToggle={() => toggle('quartermaster')}
        >
          <BreakdownSection title="By Group" items={quartermaster.byCategory} />
        </StatTile>
      </div>

      {shipwrightJobs.data && (
        <div className="tidewatch-chart-section">
          <h3 className="tidewatch-chart-title">Shipwright Jobs Timeline</h3>
          <TimeSeriesChart
            buckets={shipwrightJobs.data.timeSeries}
            statuses={shipwrightJobs.data.timeSeriesStatuses}
          />
        </div>
      )}
    </Card>
  );
}
