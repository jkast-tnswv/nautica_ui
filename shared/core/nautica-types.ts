// Nautica UI display utilities for twcode protobuf enums

import { OceanDeviceStatuses, OceanDeviceStates, OceanCircuitStatuses, OceanCircuitStates } from './gen/ocean/api/ocean_pb';
import { ChassisModels } from './gen/keel/api/chassis_pb';
import { ShipwrightJobTypes, ShipwrightJobStatuses, ShipwrightStepStatuses } from './gen/shipwright/api/shipwright_pb';
import { HarborJobTypes, HarborJobStatuses, HarborStepStatuses } from './gen/harbor/api/harbor_pb';
import type { Timestamp } from './gen/common/api/timestamp_pb';

// --- Ocean ---

export function oceanDeviceStatusLabel(s: OceanDeviceStatuses): string {
  switch (s) {
    case OceanDeviceStatuses.OCEAN_DEVICE_STATUS_BOOTSTRAPPED: return 'Bootstrapped';
    case OceanDeviceStatuses.OCEAN_DEVICE_STATUS_PROVISIONING: return 'Provisioning';
    case OceanDeviceStatuses.OCEAN_DEVICE_STATUS_IN_USE: return 'In Use';
    case OceanDeviceStatuses.OCEAN_DEVICE_STATUS_DECOMMISSIONED: return 'Decommissioned';
    default: return 'Unknown';
  }
}

export function oceanDeviceStatusVariant(s: OceanDeviceStatuses): 'success' | 'warning' | 'info' | 'error' | 'default' {
  switch (s) {
    case OceanDeviceStatuses.OCEAN_DEVICE_STATUS_IN_USE: return 'success';
    case OceanDeviceStatuses.OCEAN_DEVICE_STATUS_PROVISIONING: return 'warning';
    case OceanDeviceStatuses.OCEAN_DEVICE_STATUS_BOOTSTRAPPED: return 'info';
    case OceanDeviceStatuses.OCEAN_DEVICE_STATUS_DECOMMISSIONED: return 'error';
    default: return 'default';
  }
}

export function oceanDeviceStateLabel(s: OceanDeviceStates): string {
  switch (s) {
    case OceanDeviceStates.OCEAN_DEVICE_STATE_EMBARKED: return 'Embarked';
    case OceanDeviceStates.OCEAN_DEVICE_STATE_DISEMBARKED: return 'Disembarked';
    default: return 'Unknown';
  }
}

export function oceanCircuitStatusLabel(s: OceanCircuitStatuses): string {
  switch (s) {
    case OceanCircuitStatuses.OCEAN_CIRCUIT_STATUS_BOOTSTRAPPED: return 'Bootstrapped';
    case OceanCircuitStatuses.OCEAN_CIRCUIT_STATUS_PROVISIONING: return 'Provisioning';
    case OceanCircuitStatuses.OCEAN_CIRCUIT_STATUS_IN_USE: return 'In Use';
    case OceanCircuitStatuses.OCEAN_CIRCUIT_STATUS_DECOMMISSIONED: return 'Decommissioned';
    default: return 'Unknown';
  }
}

export function oceanCircuitStateLabel(s: OceanCircuitStates): string {
  switch (s) {
    case OceanCircuitStates.OCEAN_CIRCUIT_STATE_EMBARKED: return 'Embarked';
    case OceanCircuitStates.OCEAN_CIRCUIT_STATE_DISEMBARKED: return 'Disembarked';
    default: return 'Unknown';
  }
}

// --- Chassis ---

const chassisLabels: Record<number, string> = {
  [ChassisModels.CHASSIS_MODEL_GENERIC]: 'Generic',
  [ChassisModels.CHASSIS_MODEL_ARISTA_7808]: 'Arista 7808',
  [ChassisModels.CHASSIS_MODEL_ARISTA_7060X6_64PE_F]: 'Arista 7060X6-64PE',
  [ChassisModels.CHASSIS_MODEL_ARISTA_7050DX4_32S_F]: 'Arista 7050DX4-32S',
  [ChassisModels.CHASSIS_MODEL_EDGECORE_AS9737_32DB_32X_400GBE_QSFP_DD]: 'EdgeCore AS9737-32DB',
  [ChassisModels.CHASSIS_MODEL_EDGECORE_ACCTON_AS4630_54TE]: 'EdgeCore AS4630-54TE',
  [ChassisModels.CHASSIS_MODEL_EDGECORE_ACCTON_AS9817_640]: 'EdgeCore AS9817-640',
  [ChassisModels.CHASSIS_MODEL_OPENGEAR_IM7248_2_DAC]: 'OpenGear IM7248-2-DAC',
  [ChassisModels.CHASSIS_MODEL_SUPERMICRO_AS_1115CS_TNR]: 'Supermicro AS-1115CS-TNR',
  [ChassisModels.CHASSIS_MODEL_SUPERMICRO_AS_4126GS_NMR_LCC]: 'Supermicro AS-4126GS-NMR-LCC',
  [ChassisModels.CHASSIS_MODEL_SUPERMICRO_LCS_SCDU_250L_4002]: 'Supermicro LCS-SCDU-250L-4002',
  [ChassisModels.CHASSIS_MODEL_NVENT_ENLOGIC_EN6950_0B00]: 'nVent eLogic EN6950-0B00',
  [ChassisModels.CHASSIS_MODEL_NVENT_ENLOGIC_EN6950_0R00]: 'nVent eLogic EN6950-0R00',
};

export function chassisModelLabel(m: ChassisModels): string {
  return chassisLabels[m] ?? 'Unknown';
}

export function chassisModelOptions(): { value: string; label: string }[] {
  return Object.entries(chassisLabels).map(([value, label]) => ({ value, label }));
}

// --- Shipwright ---

export function shipwrightJobTypeLabel(t: ShipwrightJobTypes): string {
  switch (t) {
    case ShipwrightJobTypes.SHIPWRIGHT_JOB_TYPE_CONFIGURE: return 'Configure';
    case ShipwrightJobTypes.SHIPWRIGHT_JOB_TYPE_RECONFIGURE: return 'Reconfigure';
    case ShipwrightJobTypes.SHIPWRIGHT_JOB_TYPE_UNCONFIGURE: return 'Unconfigure';
    default: return 'Unknown';
  }
}

export function shipwrightJobStatusLabel(s: ShipwrightJobStatuses): string {
  switch (s) {
    case ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_INIT: return 'Init';
    case ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_RUNNING: return 'Running';
    case ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_STOPPED: return 'Stopped';
    case ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_DONE: return 'Done';
    case ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_FAILED: return 'Failed';
    case ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_ARCHIVED: return 'Archived';
    default: return 'Unknown';
  }
}

export function shipwrightJobStatusVariant(s: ShipwrightJobStatuses): 'success' | 'warning' | 'info' | 'error' | 'default' {
  switch (s) {
    case ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_DONE: return 'success';
    case ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_RUNNING: return 'warning';
    case ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_INIT: return 'info';
    case ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_FAILED: return 'error';
    case ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_STOPPED: return 'error';
    default: return 'default';
  }
}

export function shipwrightStepStatusLabel(s: ShipwrightStepStatuses): string {
  switch (s) {
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_INIT: return 'Init';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_RUNNING: return 'Running';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_RESTARTING: return 'Restarting';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_FAILED: return 'Failed';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_REVIVED: return 'Revived';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_RESCUED: return 'Rescued';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_ABORTED: return 'Aborted';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_COMPLETED: return 'Completed';
    default: return 'Unknown';
  }
}

export function shipwrightStepStatusVariant(s: ShipwrightStepStatuses): 'success' | 'warning' | 'info' | 'error' | 'default' {
  switch (s) {
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_COMPLETED: return 'success';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_RUNNING: return 'warning';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_RESTARTING: return 'warning';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_INIT: return 'info';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_FAILED: return 'error';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_ABORTED: return 'error';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_REVIVED: return 'info';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_RESCUED: return 'info';
    default: return 'default';
  }
}

// --- Harbor ---

export function harborJobTypeLabel(t: HarborJobTypes): string {
  switch (t) {
    case HarborJobTypes.HARBOR_JOB_TYPE_EMBARK: return 'Embark';
    case HarborJobTypes.HARBOR_JOB_TYPE_DISEMBARK: return 'Disembark';
    default: return 'Unknown';
  }
}

export function harborJobStatusLabel(s: HarborJobStatuses): string {
  switch (s) {
    case HarborJobStatuses.HARBOR_JOB_STATUS_INIT: return 'Init';
    case HarborJobStatuses.HARBOR_JOB_STATUS_RUNNING: return 'Running';
    case HarborJobStatuses.HARBOR_JOB_STATUS_FAILED: return 'Failed';
    case HarborJobStatuses.HARBOR_JOB_STATUS_DONE: return 'Done';
    default: return 'Unknown';
  }
}

export function harborJobStatusVariant(s: HarborJobStatuses): 'success' | 'warning' | 'info' | 'error' | 'default' {
  switch (s) {
    case HarborJobStatuses.HARBOR_JOB_STATUS_DONE: return 'success';
    case HarborJobStatuses.HARBOR_JOB_STATUS_RUNNING: return 'warning';
    case HarborJobStatuses.HARBOR_JOB_STATUS_INIT: return 'info';
    case HarborJobStatuses.HARBOR_JOB_STATUS_FAILED: return 'error';
    default: return 'default';
  }
}

export function harborStepStatusLabel(s: HarborStepStatuses): string {
  switch (s) {
    case HarborStepStatuses.HARBOR_STEP_STATUS_INIT: return 'Init';
    case HarborStepStatuses.HARBOR_STEP_STATUS_RUNNING: return 'Running';
    case HarborStepStatuses.HARBOR_STEP_STATUS_FAILED: return 'Failed';
    case HarborStepStatuses.HARBOR_STEP_STATUS_COMPLETED: return 'Completed';
    default: return 'Unknown';
  }
}

// --- Timestamp ---

export function timestampToDate(ts: Timestamp | undefined): Date | null {
  if (!ts) return null;
  return new Date(Number(ts.seconds) * 1000 + Math.floor(ts.nanoseconds / 1_000_000));
}

export function formatTimestamp(ts: Timestamp | undefined): string {
  const date = timestampToDate(ts);
  if (!date) return '—';
  return date.toLocaleString();
}

// --- Speed ---

export function formatSpeed(mbps: number): string {
  if (mbps >= 1_000_000) return `${mbps / 1_000_000} Tbps`;
  if (mbps >= 1_000) return `${mbps / 1_000} Gbps`;
  return `${mbps} Mbps`;
}
