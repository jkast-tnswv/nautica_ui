// Nautica UI display utilities for twcode protobuf enums

import { OceanDeviceStatuses, OceanDeviceStates, OceanCircuitStatuses, OceanCircuitStates } from './gen/ocean/api/ocean_pb';
import { ChassisModels } from './gen/keel/api/chassis_pb';
import { ShipwrightJobTypes, ShipwrightJobStatuses, ShipwrightStepStatuses } from './gen/shipwright/api/shipwright_pb';
import { HarborJobTypes, HarborJobStatuses, HarborStepStatuses } from './gen/harbor/api/harbor_pb';
import { LedgerDnsRecordTypes } from './gen/ledger/api/ledger_pb';
import { SkipperDeploymentStrategies } from './gen/skipper/api/skipper_pb';
import { PartCategories } from './gen/quartermaster/api/quartermaster_pb';
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
    case ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_INIT: return 'Rigging (Init)';
    case ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_RUNNING: return 'Under Sail (Running)';
    case ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_STOPPED: return 'Anchor Down (Stopped)';
    case ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_DONE: return 'Docked (Done)';
    case ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_FAILED: return 'Shipwrecked (Failed)';
    case ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_ARCHIVED: return 'Dry Dock (Archived)';
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
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_INIT: return 'Rigging (Init)';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_RUNNING: return 'Under Sail (Running)';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_RESTARTING: return 'Tacking (Restarting)';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_FAILED: return 'Shipwrecked (Failed)';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_REVIVED: return 'Salvaged (Revived)';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_RESCUED: return 'Rescued (Rescued)';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_ABORTED: return 'Scuttled (Aborted)';
    case ShipwrightStepStatuses.SHIPWRIGHT_STEP_STATUS_COMPLETED: return 'Docked (Completed)';
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
    case HarborJobStatuses.HARBOR_JOB_STATUS_INIT: return 'Rigging (Init)';
    case HarborJobStatuses.HARBOR_JOB_STATUS_RUNNING: return 'Under Sail (Running)';
    case HarborJobStatuses.HARBOR_JOB_STATUS_FAILED: return 'Shipwrecked (Failed)';
    case HarborJobStatuses.HARBOR_JOB_STATUS_DONE: return 'Docked (Done)';
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
    case HarborStepStatuses.HARBOR_STEP_STATUS_INIT: return 'Rigging (Init)';
    case HarborStepStatuses.HARBOR_STEP_STATUS_RUNNING: return 'Under Sail (Running)';
    case HarborStepStatuses.HARBOR_STEP_STATUS_FAILED: return 'Shipwrecked (Failed)';
    case HarborStepStatuses.HARBOR_STEP_STATUS_COMPLETED: return 'Docked (Completed)';
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

// --- Ledger ---

const dnsRecordTypeLabels: Record<number, string> = {
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_A]: 'A',
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_AAAA]: 'AAAA',
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_CNAME]: 'CNAME',
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_MX]: 'MX',
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_TXT]: 'TXT',
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_NS]: 'NS',
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_SOA]: 'SOA',
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_SRV]: 'SRV',
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_PTR]: 'PTR',
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_CAA]: 'CAA',
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_HTTPS]: 'HTTPS',
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_SVCB]: 'SVCB',
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_DNSKEY]: 'DNSKEY',
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_DS]: 'DS',
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_TLSA]: 'TLSA',
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_SSHFP]: 'SSHFP',
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_HINFO]: 'HINFO',
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_LOC]: 'LOC',
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_NAPTR]: 'NAPTR',
  [LedgerDnsRecordTypes.LEDGER_DNS_RECORD_TYPE_URI]: 'URI',
};

export function ledgerDnsRecordTypeLabel(t: LedgerDnsRecordTypes): string {
  return dnsRecordTypeLabels[t] ?? `Type(${t})`;
}

// --- Quartermaster ---

const partCategoryLabels: Record<number, string> = {
  [PartCategories.PART_CATEGORY_RACK]: 'Rack',
  [PartCategories.PART_CATEGORY_RACK_DOOR]: 'Rack Door',
  [PartCategories.PART_CATEGORY_RACK_DOOR_CONTROLLER]: 'Rack Door Controller',
  [PartCategories.PART_CATEGORY_LADDER_RACK]: 'Ladder Rack',
  [PartCategories.PART_CATEGORY_CABLE_TRAY]: 'Cable Tray',
  [PartCategories.PART_CATEGORY_CDU]: 'CDU',
  [PartCategories.PART_CATEGORY_CDU_CONTROLLER]: 'CDU Controller',
  [PartCategories.PART_CATEGORY_CDU_PUMP]: 'CDU Pump',
  [PartCategories.PART_CATEGORY_CDU_MANIFOLD]: 'CDU Manifold',
  [PartCategories.PART_CATEGORY_CDU_HOSE]: 'CDU Hose',
  [PartCategories.PART_CATEGORY_PDU]: 'PDU',
  [PartCategories.PART_CATEGORY_PDU_CONTROLLER]: 'PDU Controller',
  [PartCategories.PART_CATEGORY_MOUNTING_BRACKET]: 'Mounting Bracket',
  [PartCategories.PART_CATEGORY_POWER_CORD]: 'Power Cord',
  [PartCategories.PART_CATEGORY_UPS]: 'UPS',
  [PartCategories.PART_CATEGORY_GENERATOR]: 'Generator',
  [PartCategories.PART_CATEGORY_CHASSIS]: 'Chassis',
  [PartCategories.PART_CATEGORY_BLADE]: 'Blade',
  [PartCategories.PART_CATEGORY_MOTHERBOARD]: 'Motherboard',
  [PartCategories.PART_CATEGORY_CPU]: 'CPU',
  [PartCategories.PART_CATEGORY_RAM]: 'RAM',
  [PartCategories.PART_CATEGORY_HDD]: 'HDD',
  [PartCategories.PART_CATEGORY_SSD]: 'SSD',
  [PartCategories.PART_CATEGORY_GPU]: 'GPU',
  [PartCategories.PART_CATEGORY_NIC]: 'NIC',
  [PartCategories.PART_CAEGORY_PSU]: 'PSU',
  [PartCategories.PART_CATEGORY_FAN]: 'Fan',
  [PartCategories.PART_CATEGORY_FAN_TRAY]: 'Fan Tray',
  [PartCategories.PART_CATEGORY_WATER_BLOCK]: 'Water Block',
  [PartCategories.PART_CATEGORY_NETWORK_SWITCH]: 'Network Switch',
  [PartCategories.PART_CATEGORY_NETWORK_ROUTER]: 'Network Router',
  [PartCategories.PART_CATEGORY_NETWORK_GATEWAY]: 'Network Gateway',
  [PartCategories.PART_CATEGORY_SUPERVISOR]: 'Supervisor',
  [PartCategories.PART_CATEGORY_LINECARD]: 'Linecard',
  [PartCategories.PART_CATEGORY_FABRIC_MODULE]: 'Fabric Module',
  [PartCategories.PART_CATEGORY_OPTICAL_TRANSCEIVER]: 'Optical Transceiver',
  [PartCategories.PART_CATEGORY_RAIL_KIT]: 'Rail Kit',
  [PartCategories.PART_CATEGORY_COPPER_JUMPER_CABLE]: 'Copper Jumper Cable',
  [PartCategories.PART_CATEGORY_COPPER_PATCH_PANEL]: 'Copper Patch Panel',
  [PartCategories.PART_CATEGORY_FIBER_JUMPER_CABLE]: 'Fiber Jumper Cable',
  [PartCategories.PART_CATEGORY_FIBER_BREAKOUT_CABLE]: 'Fiber Breakout Cable',
  [PartCategories.PART_CATEGORY_FIBER_TRUNK]: 'Fiber Trunk',
  [PartCategories.PART_CATEGORY_FIBER_CASSETTE]: 'Fiber Cassette',
  [PartCategories.PART_CATEGORY_FIBER_PATCH_PANEL]: 'Fiber Patch Panel',
};

export function partCategoryLabel(c: PartCategories): string {
  return partCategoryLabels[c] ?? 'Unknown';
}

const partCategoryGroups: Record<number, string> = {
  [PartCategories.PART_CATEGORY_RACK]: 'Infrastructure',
  [PartCategories.PART_CATEGORY_RACK_DOOR]: 'Infrastructure',
  [PartCategories.PART_CATEGORY_RACK_DOOR_CONTROLLER]: 'Infrastructure',
  [PartCategories.PART_CATEGORY_LADDER_RACK]: 'Infrastructure',
  [PartCategories.PART_CATEGORY_CABLE_TRAY]: 'Infrastructure',
  [PartCategories.PART_CATEGORY_RAIL_KIT]: 'Infrastructure',
  [PartCategories.PART_CATEGORY_MOUNTING_BRACKET]: 'Infrastructure',
  [PartCategories.PART_CATEGORY_CDU]: 'Cooling',
  [PartCategories.PART_CATEGORY_CDU_CONTROLLER]: 'Cooling',
  [PartCategories.PART_CATEGORY_CDU_PUMP]: 'Cooling',
  [PartCategories.PART_CATEGORY_CDU_MANIFOLD]: 'Cooling',
  [PartCategories.PART_CATEGORY_CDU_HOSE]: 'Cooling',
  [PartCategories.PART_CATEGORY_WATER_BLOCK]: 'Cooling',
  [PartCategories.PART_CATEGORY_FAN]: 'Cooling',
  [PartCategories.PART_CATEGORY_FAN_TRAY]: 'Cooling',
  [PartCategories.PART_CATEGORY_PDU]: 'Power',
  [PartCategories.PART_CATEGORY_PDU_CONTROLLER]: 'Power',
  [PartCategories.PART_CATEGORY_POWER_CORD]: 'Power',
  [PartCategories.PART_CATEGORY_UPS]: 'Power',
  [PartCategories.PART_CATEGORY_GENERATOR]: 'Power',
  [PartCategories.PART_CAEGORY_PSU]: 'Power',
  [PartCategories.PART_CATEGORY_CHASSIS]: 'Compute',
  [PartCategories.PART_CATEGORY_BLADE]: 'Compute',
  [PartCategories.PART_CATEGORY_MOTHERBOARD]: 'Compute',
  [PartCategories.PART_CATEGORY_CPU]: 'Compute',
  [PartCategories.PART_CATEGORY_RAM]: 'Compute',
  [PartCategories.PART_CATEGORY_HDD]: 'Compute',
  [PartCategories.PART_CATEGORY_SSD]: 'Compute',
  [PartCategories.PART_CATEGORY_GPU]: 'Compute',
  [PartCategories.PART_CATEGORY_NIC]: 'Compute',
  [PartCategories.PART_CATEGORY_NETWORK_SWITCH]: 'Networking',
  [PartCategories.PART_CATEGORY_NETWORK_ROUTER]: 'Networking',
  [PartCategories.PART_CATEGORY_NETWORK_GATEWAY]: 'Networking',
  [PartCategories.PART_CATEGORY_SUPERVISOR]: 'Networking',
  [PartCategories.PART_CATEGORY_LINECARD]: 'Networking',
  [PartCategories.PART_CATEGORY_FABRIC_MODULE]: 'Networking',
  [PartCategories.PART_CATEGORY_OPTICAL_TRANSCEIVER]: 'Networking',
  [PartCategories.PART_CATEGORY_COPPER_JUMPER_CABLE]: 'Cabling',
  [PartCategories.PART_CATEGORY_COPPER_PATCH_PANEL]: 'Cabling',
  [PartCategories.PART_CATEGORY_FIBER_JUMPER_CABLE]: 'Cabling',
  [PartCategories.PART_CATEGORY_FIBER_BREAKOUT_CABLE]: 'Cabling',
  [PartCategories.PART_CATEGORY_FIBER_TRUNK]: 'Cabling',
  [PartCategories.PART_CATEGORY_FIBER_CASSETTE]: 'Cabling',
  [PartCategories.PART_CATEGORY_FIBER_PATCH_PANEL]: 'Cabling',
};

export function partCategoryGroup(c: PartCategories): string {
  return partCategoryGroups[c] ?? 'Other';
}

// --- Skipper ---

export function skipperDeploymentStrategyLabel(s: SkipperDeploymentStrategies): string {
  switch (s) {
    case SkipperDeploymentStrategies.SKIPPER_DEPLOYMENT_STRATEGY_ROLLING_UPDATE: return 'Rolling Update';
    case SkipperDeploymentStrategies.SKIPPER_DEPLOYMENT_STRATEGY_BLUE_GREEN: return 'Blue/Green';
    case SkipperDeploymentStrategies.SKIPPER_DEPLOYMENT_STRATEGY_CANARY: return 'Canary';
    case SkipperDeploymentStrategies.SKIPPER_DEPLOYMENT_STRATEGY_IMMEDIATE: return 'Immediate';
    default: return 'Unknown';
  }
}
