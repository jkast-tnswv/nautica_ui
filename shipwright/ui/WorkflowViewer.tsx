import React from 'react';
import type { ShipwrightJobDetailsResponse } from '@core/gen/shipwright/api/shipwright_pb';
import {
  shipwrightStepStatusLabel,
  shipwrightStepStatusVariant,
  shipwrightJobStatusLabel,
  shipwrightJobStatusVariant,
} from '@core/nautica-types';
import { Cell } from '@components';

interface WorkflowViewerProps {
  details: ShipwrightJobDetailsResponse;
  loading: boolean;
  onClose?: () => void;
}

const variantColors: Record<string, string> = {
  success: 'var(--color-success, #22c55e)',
  warning: 'var(--color-warning, #f59e0b)',
  info: 'var(--color-accent-cyan, #06b6d4)',
  error: 'var(--color-error, #ef4444)',
  default: 'var(--color-text-muted, #6b7280)',
};

export function WorkflowViewer({ details, loading, onClose }: WorkflowViewerProps) {
  if (loading) {
    return <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>Loading workflow details...</div>;
  }

  const workflow = details.shipwrightWorkflow;
  if (!workflow) {
    return <div style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>No workflow data available.</div>;
  }

  // Sort step groups by their numeric key
  const sortedGroups = Object.entries(workflow.shipwrightStepGroups)
    .map(([key, group]) => ({ key: Number(key), group }))
    .sort((a, b) => a.key - b.key);

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <strong>Job:</strong> {details.jobId} &nbsp;
          {Cell.badge(
            shipwrightJobStatusLabel(details.jobStatus),
            shipwrightJobStatusVariant(details.jobStatus),
          )}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>
          <span className="material-icons-outlined" style={{ fontSize: '16px' }}>close</span>
          Close
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        paddingBottom: '8px',
      }}>
        {sortedGroups.map(({ key, group }) => (
          <div
            key={key}
            style={{
              minWidth: '180px',
              border: '1px solid var(--color-border, #374151)',
              borderRadius: '8px',
              padding: '12px',
              background: 'var(--color-bg-card, #1f2937)',
            }}
          >
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: '8px',
              letterSpacing: '0.05em',
            }}>
              Step Group {key}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {group.shipwrightSteps.map((step, idx) => {
                const variant = shipwrightStepStatusVariant(step.shipwrightStepStatus);
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      borderLeft: `3px solid ${variantColors[variant]}`,
                      background: 'var(--color-bg-secondary, #111827)',
                      fontSize: '13px',
                    }}
                  >
                    <div style={{ fontWeight: 500, marginBottom: '2px' }}>{step.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: variantColors[variant] }}>
                        {shipwrightStepStatusLabel(step.shipwrightStepStatus)}
                      </span>
                      {step.maxAttempts > 1 && (
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                          max: {step.maxAttempts}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
