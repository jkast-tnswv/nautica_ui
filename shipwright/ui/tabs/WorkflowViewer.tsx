import React from 'react';
import type { ShipwrightJobDetailsResponse, ShipwrightStep } from '@core/gen/shipwright/api/shipwright_pb';
import { ShipwrightStepStatuses } from '@core/gen/shipwright/api/shipwright_pb';
import {
  shipwrightStepStatusLabel,
  shipwrightStepStatusVariant,
  shipwrightJobStatusLabel,
  shipwrightJobStatusVariant,
} from '@core/nautica-types';
import { Badge, Button, Icon, ProgressBar } from '@components';
import type { ProgressSegment } from '@components';
import './WorkflowViewer.css';

interface WorkflowViewerProps {
  details: ShipwrightJobDetailsResponse;
  loading: boolean;
  onClose?: () => void;
}

const statusIcon: Record<number, string> = {
  [ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_COMPLETED]: 'check_circle',
  [ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_RUNNING]: 'play_circle',
  [ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_RESTARTING]: 'restart_alt',
  [ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_INIT]: 'hourglass_empty',
  [ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_FAILED]: 'error',
  [ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_ABORTED]: 'cancel',
  [ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_REVIVED]: 'restore',
  [ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_RESCUED]: 'shield',
  [ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_UNSPECIFIED]: 'help_outline',
};

function countByVariant(steps: ShipwrightStep[]) {
  const counts = { success: 0, warning: 0, error: 0, info: 0, default: 0 };
  for (const s of steps) {
    const v = shipwrightStepStatusVariant(s.shipwrightStepStatus);
    counts[v]++;
  }
  return counts;
}

export function WorkflowViewer({ details, loading, onClose }: WorkflowViewerProps) {
  if (loading) {
    return <div className="wf-viewer" style={{ color: 'var(--color-text-secondary)' }}>Loading workflow details...</div>;
  }

  const workflow = details.shipwrightWorkflow;
  if (!workflow) {
    return <div className="wf-viewer" style={{ color: 'var(--color-text-secondary)' }}>No workflow data available.</div>;
  }

  const sortedGroups = Object.entries(workflow.shipwrightStepGroups)
    .map(([key, group]) => ({ key: Number(key), group }))
    .sort((a, b) => a.key - b.key);

  // Collect all steps for summary
  const allSteps = sortedGroups.flatMap(({ group }) => group.shipwrightSteps);
  const totals = countByVariant(allSteps);

  const progressSegments: ProgressSegment[] = [
    { count: totals.success, variant: 'success' },
    { count: totals.warning, variant: 'warning' },
    { count: totals.info, variant: 'info' },
    { count: totals.error, variant: 'error' },
    { count: totals.default, variant: 'default' },
  ];

  return (
    <div className="wf-viewer">
      {/* Header */}
      <div className="wf-header">
        <div className="wf-header-left">
          <strong>Job:</strong> {details.jobId}
          <Badge variant={shipwrightJobStatusVariant(details.jobStatus)} dot>
            {shipwrightJobStatusLabel(details.jobStatus)}
          </Badge>
        </div>
        <Button size="sm" variant="secondary" icon="close" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Progress summary */}
      <div className="wf-summary">
        {totals.success > 0 && (
          <span className="wf-summary-item is-success">
            <Icon name="check_circle" size={14} />
            <span className="wf-summary-count">{totals.success}</span> complete
          </span>
        )}
        {totals.warning > 0 && (
          <span className="wf-summary-item is-warning">
            <Icon name="play_circle" size={14} />
            <span className="wf-summary-count">{totals.warning}</span> running
          </span>
        )}
        {totals.info > 0 && (
          <span className="wf-summary-item is-info">
            <Icon name="hourglass_empty" size={14} />
            <span className="wf-summary-count">{totals.info}</span> waiting
          </span>
        )}
        {totals.error > 0 && (
          <span className="wf-summary-item is-error">
            <Icon name="error" size={14} />
            <span className="wf-summary-count">{totals.error}</span> failed
          </span>
        )}
        {totals.default > 0 && (
          <span className="wf-summary-item">
            <Icon name="help_outline" size={14} />
            <span className="wf-summary-count">{totals.default}</span> unknown
          </span>
        )}
      </div>

      {/* Overall progress bar */}
      <ProgressBar segments={progressSegments} className="wf-progress" />

      {/* Step groups */}
      <div className="wf-groups">
        {sortedGroups.map(({ key, group }) => {
          const steps = group.shipwrightSteps;
          const doneCount = steps.filter(
            (s) => s.shipwrightStepStatus === ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_COMPLETED
          ).length;
          const allDone = doneCount === steps.length && steps.length > 0;

          return (
            <div key={key} className="wf-group">
              <div className="wf-group-header">
                <span className="wf-group-title">Step Group {key}</span>
                <span className={`wf-group-progress${allDone ? ' all-done' : ''}`}>
                  {doneCount}/{steps.length}
                </span>
              </div>
              <div className="wf-group-steps">
                {steps.map((step, idx) => {
                  const variant = shipwrightStepStatusVariant(step.shipwrightStepStatus);
                  const icon = statusIcon[step.shipwrightStepStatus] || 'help_outline';
                  return (
                    <div key={idx} className={`wf-step is-${variant}`}>
                      <div className="wf-step-name">{step.name}</div>
                      <div className="wf-step-footer">
                        <span className="wf-step-status">
                          <Icon name={icon} size={13} />
                          <Badge variant={variant} size="sm" dot>
                            {shipwrightStepStatusLabel(step.shipwrightStepStatus)}
                          </Badge>
                        </span>
                        {step.maxAttempts > 1 && (
                          <span className="wf-step-meta">
                            max: {step.maxAttempts}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
