import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getServices } from '@core/services';
import type { OceanDevice, OceanCircuit } from '@core/gen/ocean/api/ocean_pb';
import { OceanDeviceStatuses, OceanDeviceStates, OceanCircuitStatuses, OceanCircuitStates } from '@core/gen/ocean/api/ocean_pb';
import type { ShipwrightJobResponse } from '@core/gen/shipwright/api/shipwright_pb';
import { ShipwrightJobStatuses, ShipwrightJobTypes } from '@core/gen/shipwright/api/shipwright_pb';
import type { HarborResponse } from '@core/gen/harbor/api/harbor_pb';
import { HarborJobStatuses, HarborJobTypes } from '@core/gen/harbor/api/harbor_pb';
import { ChassisModels } from '@core/gen/keel/api/chassis_pb';
import { CampusCodes, BuildingCodes, RackModels } from '@core/gen/anchor/api/anchor_pb';
import { PartCategories } from '@core/gen/quartermaster/api/quartermaster_pb';
import {
  oceanDeviceStatusLabel,
  oceanDeviceStatusVariant,
  oceanDeviceStateLabel,
  oceanCircuitStatusLabel,
  oceanCircuitStateLabel,
  chassisModelLabel,
  shipwrightJobStatusLabel,
  shipwrightJobStatusVariant,
  shipwrightJobTypeLabel,
  harborJobStatusLabel,
  harborJobStatusVariant,
  harborJobTypeLabel,
  formatSpeed,
  partCategoryGroup,
} from '@core';

export interface StatBreakdown {
  label: string;
  count: number;
  variant: 'success' | 'warning' | 'info' | 'error' | 'default';
}

interface DeviceStats {
  total: number;
  byStatus: StatBreakdown[];
  byState: StatBreakdown[];
  byModel: StatBreakdown[];
}

interface CircuitStats {
  total: number;
  byStatus: StatBreakdown[];
  byState: StatBreakdown[];
  bySpeed: StatBreakdown[];
}

interface JobStats {
  total: number;
  running: number;
  byStatus: StatBreakdown[];
  byType: StatBreakdown[];
}

export interface TimeSeriesBucket {
  time: number;
  statusCounts: Record<string, number>;
}

export interface ShipwrightJobStats extends JobStats {
  timeSeries: TimeSeriesBucket[];
  timeSeriesStatuses: { label: string; variant: string }[];
}

export interface RefDataStats {
  total: number;
  byCategory: StatBreakdown[];
}

export interface TileState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface TimeRangeOption {
  label: string;
  minutes: number;
}

export const TIME_RANGES: TimeRangeOption[] = [
  { label: '5m', minutes: 5 },
  { label: '1h', minutes: 60 },
  { label: '1d', minutes: 1440 },
  { label: '5d', minutes: 7200 },
  { label: '7d', minutes: 10080 },
  { label: 'All', minutes: 0 },
];

export interface UseTideWatchReturn {
  devices: TileState<DeviceStats>;
  circuits: TileState<CircuitStats>;
  shipwrightJobs: TileState<ShipwrightJobStats>;
  harborJobs: TileState<JobStats>;
  anchor: RefDataStats;
  keel: RefDataStats;
  quartermaster: RefDataStats;
  timeRange: number;
  setTimeRange: (minutes: number) => void;
  refresh: () => void;
}

function countBy<T, K extends string | number>(items: T[], keyFn: (item: T) => K): Map<K, number> {
  const counts = new Map<K, number>();
  for (const item of items) {
    const key = keyFn(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function enumCount(enumObj: Record<string, number | string>, prefix: string): number {
  return Object.entries(enumObj)
    .filter(([key, val]) => typeof val === 'number' && val !== 0 && key !== `${prefix}_UNSPECIFIED`)
    .length;
}

function computeDeviceStats(devices: OceanDevice[]): DeviceStats {
  const byStatus = countBy(devices, (d) => d.oceanDeviceStatus);
  const byState = countBy(devices, (d) => d.oceanDeviceState);
  const byModel = countBy(devices, (d) => d.chassisModel);

  return {
    total: devices.length,
    byStatus: [
      OceanDeviceStatuses.OCEAN_DEVICE_STATUS_IN_USE,
      OceanDeviceStatuses.OCEAN_DEVICE_STATUS_PROVISIONING,
      OceanDeviceStatuses.OCEAN_DEVICE_STATUS_BOOTSTRAPPED,
      OceanDeviceStatuses.OCEAN_DEVICE_STATUS_DECOMMISSIONED,
    ]
      .map((s) => ({ label: oceanDeviceStatusLabel(s), count: byStatus.get(s) ?? 0, variant: oceanDeviceStatusVariant(s) }))
      .filter((r) => r.count > 0),
    byState: [
      OceanDeviceStates.OCEAN_DEVICE_STATE_EMBARKED,
      OceanDeviceStates.OCEAN_DEVICE_STATE_DISEMBARKED,
    ]
      .map((s) => ({ label: oceanDeviceStateLabel(s), count: byState.get(s) ?? 0, variant: 'default' as const }))
      .filter((r) => r.count > 0),
    byModel: Array.from(byModel.entries())
      .filter(([m]) => m !== ChassisModels.CHASSIS_MODEL_UNSPECIFIED)
      .sort((a, b) => b[1] - a[1])
      .map(([m, count]) => ({ label: chassisModelLabel(m), count, variant: 'default' as const })),
  };
}

function computeCircuitStats(circuits: OceanCircuit[]): CircuitStats {
  const byStatus = countBy(circuits, (c) => c.oceanCircuitStatus);
  const byState = countBy(circuits, (c) => c.oceanCircuitState);
  const bySpeed = countBy(circuits, (c) => c.speedMbps);

  return {
    total: circuits.length,
    byStatus: [
      OceanCircuitStatuses.OCEAN_CIRCUIT_STATUS_IN_USE,
      OceanCircuitStatuses.OCEAN_CIRCUIT_STATUS_PROVISIONING,
      OceanCircuitStatuses.OCEAN_CIRCUIT_STATUS_BOOTSTRAPPED,
      OceanCircuitStatuses.OCEAN_CIRCUIT_STATUS_DECOMMISSIONED,
    ]
      .map((s) => ({ label: oceanCircuitStatusLabel(s), count: byStatus.get(s) ?? 0, variant: 'default' as const }))
      .filter((r) => r.count > 0),
    byState: [
      OceanCircuitStates.OCEAN_CIRCUIT_STATE_EMBARKED,
      OceanCircuitStates.OCEAN_CIRCUIT_STATE_DISEMBARKED,
    ]
      .map((s) => ({ label: oceanCircuitStateLabel(s), count: byState.get(s) ?? 0, variant: 'default' as const }))
      .filter((r) => r.count > 0),
    bySpeed: Array.from(bySpeed.entries())
      .filter(([speed]) => speed > 0)
      .sort((a, b) => b[0] - a[0])
      .map(([speed, count]) => ({ label: formatSpeed(speed), count, variant: 'default' as const })),
  };
}

const SHIPWRIGHT_STATUS_ORDER = [
  ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_RUNNING,
  ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_INIT,
  ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_DONE,
  ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_FAILED,
  ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_STOPPED,
  ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_ARCHIVED,
];

function getBucketInterval(timeRangeMinutes: number): number {
  if (timeRangeMinutes <= 5) return 30 * 1000;
  if (timeRangeMinutes <= 60) return 5 * 60 * 1000;
  if (timeRangeMinutes <= 1440) return 60 * 60 * 1000;
  if (timeRangeMinutes <= 7200) return 6 * 60 * 60 * 1000;
  if (timeRangeMinutes <= 10080) return 12 * 60 * 60 * 1000;
  return 24 * 60 * 60 * 1000;
}

function computeTimeSeries(jobs: ShipwrightJobResponse[], timeRangeMinutes: number): TimeSeriesBucket[] {
  if (jobs.length === 0) return [];

  const now = Date.now();
  let rangeStart: number;
  let interval: number;

  if (timeRangeMinutes > 0) {
    rangeStart = now - timeRangeMinutes * 60 * 1000;
    interval = getBucketInterval(timeRangeMinutes);
  } else {
    // "All" mode — derive range from data
    let earliest = now;
    for (const j of jobs) {
      if (j.timestampJobCreated) {
        const ms = Number(j.timestampJobCreated.seconds) * 1000;
        if (ms < earliest) earliest = ms;
      }
    }
    const spanMs = now - earliest;
    const spanMinutes = spanMs / 60000;
    interval = getBucketInterval(spanMinutes);
    rangeStart = earliest;
  }

  // Align rangeStart to interval boundary
  rangeStart = Math.floor(rangeStart / interval) * interval;
  const bucketCount = Math.ceil((now - rangeStart) / interval) + 1;

  const buckets: TimeSeriesBucket[] = [];
  for (let i = 0; i < bucketCount; i++) {
    buckets.push({ time: rangeStart + i * interval, statusCounts: {} });
  }

  for (const job of jobs) {
    if (!job.timestampJobCreated) continue;
    const ms = Number(job.timestampJobCreated.seconds) * 1000;
    const idx = Math.floor((ms - rangeStart) / interval);
    if (idx >= 0 && idx < buckets.length) {
      const label = shipwrightJobStatusLabel(job.shipwrightJobStatus);
      buckets[idx].statusCounts[label] = (buckets[idx].statusCounts[label] ?? 0) + 1;
    }
  }

  return buckets;
}

function computeShipwrightStats(jobs: ShipwrightJobResponse[], timeRangeMinutes: number): ShipwrightJobStats {
  const byStatus = countBy(jobs, (j) => j.shipwrightJobStatus);
  const byType = countBy(jobs, (j) => j.shipwrightJobType);

  const timeSeriesStatuses = SHIPWRIGHT_STATUS_ORDER
    .filter((s) => (byStatus.get(s) ?? 0) > 0)
    .map((s) => ({ label: shipwrightJobStatusLabel(s), variant: shipwrightJobStatusVariant(s) }));

  return {
    total: jobs.length,
    running: byStatus.get(ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_RUNNING) ?? 0,
    byStatus: SHIPWRIGHT_STATUS_ORDER
      .map((s) => ({ label: shipwrightJobStatusLabel(s), count: byStatus.get(s) ?? 0, variant: shipwrightJobStatusVariant(s) }))
      .filter((r) => r.count > 0),
    byType: [
      ShipwrightJobTypes.SHIPWRIGHT_JOB_TYPE_CONFIGURE,
      ShipwrightJobTypes.SHIPWRIGHT_JOB_TYPE_RECONFIGURE,
      ShipwrightJobTypes.SHIPWRIGHT_JOB_TYPE_UNCONFIGURE,
    ]
      .map((t) => ({ label: shipwrightJobTypeLabel(t), count: byType.get(t) ?? 0, variant: 'default' as const }))
      .filter((r) => r.count > 0),
    timeSeries: computeTimeSeries(jobs, timeRangeMinutes),
    timeSeriesStatuses,
  };
}

function computeHarborStats(jobs: HarborResponse[]): JobStats {
  const byStatus = countBy(jobs, (j) => j.harborJobStatus);
  const byType = countBy(jobs, (j) => j.harborJobType);

  return {
    total: jobs.length,
    running: byStatus.get(HarborJobStatuses.HARBOR_JOB_STATUS_RUNNING) ?? 0,
    byStatus: [
      HarborJobStatuses.HARBOR_JOB_STATUS_RUNNING,
      HarborJobStatuses.HARBOR_JOB_STATUS_INIT,
      HarborJobStatuses.HARBOR_JOB_STATUS_DONE,
      HarborJobStatuses.HARBOR_JOB_STATUS_FAILED,
    ]
      .map((s) => ({ label: harborJobStatusLabel(s), count: byStatus.get(s) ?? 0, variant: harborJobStatusVariant(s) }))
      .filter((r) => r.count > 0),
    byType: [
      HarborJobTypes.HARBOR_JOB_TYPE_EMBARK,
      HarborJobTypes.HARBOR_JOB_TYPE_DISEMBARK,
    ]
      .map((t) => ({ label: harborJobTypeLabel(t), count: byType.get(t) ?? 0, variant: 'default' as const }))
      .filter((r) => r.count > 0),
  };
}

// --- Static reference data (computed once from protobuf enums) ---

function computeAnchorStats(): RefDataStats {
  const campuses = enumCount(CampusCodes, 'CAMPUS_CODE');
  const buildings = enumCount(BuildingCodes, 'BUILDING_CODE');
  const rackModels = enumCount(RackModels, 'RACK_MODEL');
  const total = campuses + buildings + rackModels;

  return {
    total,
    byCategory: [
      { label: 'Campuses', count: campuses, variant: 'info' },
      { label: 'Buildings', count: buildings, variant: 'info' },
      { label: 'Rack Models', count: rackModels, variant: 'default' },
    ],
  };
}

function computeKeelStats(): RefDataStats {
  const models = Object.entries(ChassisModels)
    .filter(([key, val]) => typeof val === 'number' && val !== 0 && key !== 'CHASSIS_MODEL_UNSPECIFIED')
    .map(([, val]) => val as number);

  const byVendor = new Map<string, number>();
  for (const m of models) {
    const label = chassisModelLabel(m as ChassisModels);
    const vendor = label.split(' ')[0];
    byVendor.set(vendor, (byVendor.get(vendor) ?? 0) + 1);
  }

  return {
    total: models.length,
    byCategory: Array.from(byVendor.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([vendor, count]) => ({ label: vendor, count, variant: 'default' as const })),
  };
}

function computeQuartermasterStats(): RefDataStats {
  const parts = Object.entries(PartCategories)
    .filter(([key, val]) => typeof val === 'number' && val !== 0 && key !== 'PART_CATEGORY_UNSPECIFIED')
    .map(([, val]) => val as number);

  const groupCounts = new Map<string, number>();
  for (const p of parts) {
    const group = partCategoryGroup(p as PartCategories);
    groupCounts.set(group, (groupCounts.get(group) ?? 0) + 1);
  }

  return {
    total: parts.length,
    byCategory: Array.from(groupCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([group, count]) => ({ label: group, count, variant: 'default' as const })),
  };
}

function useTileFetch<TRaw, TStats>(
  fetchFn: () => Promise<TRaw>,
  computeFn: (raw: TRaw) => TStats,
  refreshInterval: number,
  trigger: number,
): TileState<TStats> {
  const [data, setData] = useState<TStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rawRef = useRef<TRaw | null>(null);

  useEffect(() => {
    let cancelled = false;
    const doFetch = async () => {
      if (rawRef.current === null) setLoading(true);
      try {
        const raw = await fetchFn();
        if (!cancelled) {
          rawRef.current = raw;
          setData(computeFn(raw));
          setError(null);
        }
      } catch (err) {
        if (!cancelled && rawRef.current === null) {
          setError(err instanceof Error ? err.message : 'Failed to load');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    doFetch();
    const interval = setInterval(doFetch, refreshInterval);
    return () => { cancelled = true; clearInterval(interval); };
  }, [trigger]);

  // Recompute from cached data when computeFn changes (e.g. time filter)
  useEffect(() => {
    if (rawRef.current !== null) {
      setData(computeFn(rawRef.current));
    }
  }, [computeFn]);

  return { data, loading, error };
}

function filterByTime<T>(items: T[], timeRangeMinutes: number, getSeconds: (item: T) => bigint | undefined): T[] {
  if (timeRangeMinutes === 0) return items;
  const cutoff = BigInt(Math.floor((Date.now() - timeRangeMinutes * 60 * 1000) / 1000));
  return items.filter((item) => {
    const seconds = getSeconds(item);
    return seconds !== undefined && seconds >= cutoff;
  });
}

export function useTideWatch(refreshInterval = 30000): UseTideWatchReturn {
  const [trigger, setTrigger] = useState(0);
  const [timeRange, setTimeRange] = useState(0);
  const refresh = useCallback(() => setTrigger((t) => t + 1), []);

  const services = useMemo(() => getServices(), []);

  const devices = useTileFetch(
    () => services.ocean.listDevices().then((r) => r.oceanDevices),
    computeDeviceStats,
    refreshInterval,
    trigger,
  );

  const circuits = useTileFetch(
    () => services.ocean.listCircuits().then((r) => r.oceanCircuits),
    computeCircuitStats,
    refreshInterval,
    trigger,
  );

  const computeFilteredShipwright = useCallback(
    (jobs: ShipwrightJobResponse[]) => computeShipwrightStats(
      filterByTime(jobs, timeRange, (j) => j.timestampJobCreated?.seconds),
      timeRange,
    ),
    [timeRange],
  );

  const shipwrightJobs = useTileFetch(
    () => services.shipwright.listJobs().then((r) => r.shipwrightJobResponses),
    computeFilteredShipwright,
    refreshInterval,
    trigger,
  );

  const harborJobs = useTileFetch(
    () => services.harbor.list().then((r) => r.harborResponses),
    computeHarborStats,
    refreshInterval,
    trigger,
  );

  // Static reference data — computed once, no API calls
  const anchor = useMemo(computeAnchorStats, []);
  const keel = useMemo(computeKeelStats, []);
  const quartermaster = useMemo(computeQuartermasterStats, []);

  return { devices, circuits, shipwrightJobs, harborJobs, anchor, keel, quartermaster, timeRange, setTimeRange, refresh };
}
