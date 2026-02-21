vi.mock('@core/services', () => ({
  getServices: vi.fn(() => mockServices),
}));

vi.mock('@core/hooks/useLocalStorage', () => ({
  useLocalStorage: vi.fn((_key: string, init: number) => {
    return [mockTimeRange, mockSetTimeRange];
  }),
}));

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTideWatch } from './useTideWatch';
import { OceanDeviceStatuses, OceanDeviceStates } from '@core/gen/ocean/api/ocean_pb';
import { OceanCircuitStatuses, OceanCircuitStates } from '@core/gen/ocean/api/ocean_pb';
import { ChassisModels } from '@core/gen/keel/api/chassis_pb';
import { ShipwrightJobStatuses, ShipwrightJobTypes } from '@core/gen/shipwright/api/shipwright_pb';
import { HarborJobStatuses, HarborJobTypes } from '@core/gen/harbor/api/harbor_pb';

let mockTimeRange = 0;
const mockSetTimeRange = vi.fn();

const mockDevices = [
  { oceanDeviceStatus: OceanDeviceStatuses.OCEAN_DEVICE_STATUS_IN_USE, oceanDeviceState: OceanDeviceStates.OCEAN_DEVICE_STATE_EMBARKED, chassisModel: ChassisModels.CHASSIS_MODEL_ARISTA_7808 },
  { oceanDeviceStatus: OceanDeviceStatuses.OCEAN_DEVICE_STATUS_IN_USE, oceanDeviceState: OceanDeviceStates.OCEAN_DEVICE_STATE_EMBARKED, chassisModel: ChassisModels.CHASSIS_MODEL_ARISTA_7808 },
  { oceanDeviceStatus: OceanDeviceStatuses.OCEAN_DEVICE_STATUS_PROVISIONING, oceanDeviceState: OceanDeviceStates.OCEAN_DEVICE_STATE_DISEMBARKED, chassisModel: ChassisModels.CHASSIS_MODEL_EDGECORE_AS9737_32DB_32X_400GBE_QSFP_DD },
];

const mockCircuits = [
  { oceanCircuitStatus: OceanCircuitStatuses.OCEAN_CIRCUIT_STATUS_IN_USE, oceanCircuitState: OceanCircuitStates.OCEAN_CIRCUIT_STATE_EMBARKED, speedMbps: 10000 },
  { oceanCircuitStatus: OceanCircuitStatuses.OCEAN_CIRCUIT_STATUS_IN_USE, oceanCircuitState: OceanCircuitStates.OCEAN_CIRCUIT_STATE_EMBARKED, speedMbps: 100000 },
  { oceanCircuitStatus: OceanCircuitStatuses.OCEAN_CIRCUIT_STATUS_BOOTSTRAPPED, oceanCircuitState: OceanCircuitStates.OCEAN_CIRCUIT_STATE_DISEMBARKED, speedMbps: 10000 },
];

const nowSeconds = BigInt(Math.floor(Date.now() / 1000));

const mockShipwrightJobs = [
  { shipwrightJobStatus: ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_RUNNING, shipwrightJobType: ShipwrightJobTypes.SHIPWRIGHT_JOB_TYPE_CONFIGURE, timestampJobCreated: { seconds: nowSeconds - 60n } },
  { shipwrightJobStatus: ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_DONE, shipwrightJobType: ShipwrightJobTypes.SHIPWRIGHT_JOB_TYPE_CONFIGURE, timestampJobCreated: { seconds: nowSeconds - 120n } },
  { shipwrightJobStatus: ShipwrightJobStatuses.SHIPWRIGHT_JOB_STATUS_FAILED, shipwrightJobType: ShipwrightJobTypes.SHIPWRIGHT_JOB_TYPE_RECONFIGURE, timestampJobCreated: { seconds: nowSeconds - 300n } },
];

const mockHarborJobs = [
  { harborJobStatus: HarborJobStatuses.HARBOR_JOB_STATUS_RUNNING, harborJobType: HarborJobTypes.HARBOR_JOB_TYPE_EMBARK },
  { harborJobStatus: HarborJobStatuses.HARBOR_JOB_STATUS_DONE, harborJobType: HarborJobTypes.HARBOR_JOB_TYPE_DISEMBARK },
];

const mockServices = {
  ocean: {
    listDevices: vi.fn(() => Promise.resolve({ oceanDevices: mockDevices })),
    listCircuits: vi.fn(() => Promise.resolve({ oceanCircuits: mockCircuits })),
  },
  shipwright: {
    listJobs: vi.fn(() => Promise.resolve({ shipwrightJobResponses: mockShipwrightJobs })),
  },
  harbor: {
    list: vi.fn(() => Promise.resolve({ harborResponses: mockHarborJobs })),
  },
};

beforeEach(() => {
  mockTimeRange = 0;
  mockServices.ocean.listDevices.mockClear();
  mockServices.ocean.listCircuits.mockClear();
  mockServices.shipwright.listJobs.mockClear();
  mockServices.harbor.list.mockClear();
  // Reset default implementations after mockClear
  mockServices.ocean.listDevices.mockImplementation(() => Promise.resolve({ oceanDevices: mockDevices }));
  mockServices.ocean.listCircuits.mockImplementation(() => Promise.resolve({ oceanCircuits: mockCircuits }));
  mockServices.shipwright.listJobs.mockImplementation(() => Promise.resolve({ shipwrightJobResponses: mockShipwrightJobs }));
  mockServices.harbor.list.mockImplementation(() => Promise.resolve({ harborResponses: mockHarborJobs }));
});

describe('useTideWatch', () => {
  it('returns loading state initially', () => {
    const { result } = renderHook(() => useTideWatch(60000));

    expect(result.current.devices.loading).toBe(true);
    expect(result.current.circuits.loading).toBe(true);
    expect(result.current.shipwrightJobs.loading).toBe(true);
    expect(result.current.harborJobs.loading).toBe(true);
  });

  it('computes device stats after fetch', async () => {
    const { result } = renderHook(() => useTideWatch(60000));

    await waitFor(() => {
      expect(result.current.devices.data).not.toBeNull();
    });

    const data = result.current.devices.data!;
    expect(data.total).toBe(3);
    expect(data.byStatus).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'In Use', count: 2 }),
        expect.objectContaining({ label: 'Provisioning', count: 1 }),
      ]),
    );
    expect(data.byState).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Embarked', count: 2 }),
        expect.objectContaining({ label: 'Disembarked', count: 1 }),
      ]),
    );
    expect(data.byModel.length).toBeGreaterThanOrEqual(2);
    expect(result.current.devices.loading).toBe(false);
    expect(result.current.devices.error).toBeNull();
  });

  it('computes circuit stats after fetch', async () => {
    const { result } = renderHook(() => useTideWatch(60000));

    await waitFor(() => {
      expect(result.current.circuits.data).not.toBeNull();
    });

    const data = result.current.circuits.data!;
    expect(data.total).toBe(3);
    expect(data.byStatus.find((s) => s.label === 'In Use')?.count).toBe(2);
    expect(data.bySpeed.length).toBeGreaterThanOrEqual(1);
    expect(data.byState.length).toBeGreaterThanOrEqual(1);
  });

  it('computes shipwright stats with running count and time series', async () => {
    const { result } = renderHook(() => useTideWatch(60000));

    await waitFor(() => {
      expect(result.current.shipwrightJobs.data).not.toBeNull();
    });

    const data = result.current.shipwrightJobs.data!;
    expect(data.total).toBe(3);
    expect(data.running).toBe(1);
    expect(data.byStatus.length).toBeGreaterThanOrEqual(1);
    expect(data.byType.length).toBeGreaterThanOrEqual(1);
    expect(data.timeSeries).toBeDefined();
    expect(data.timeSeriesStatuses.length).toBeGreaterThanOrEqual(1);
  });

  it('computes harbor stats with running count', async () => {
    const { result } = renderHook(() => useTideWatch(60000));

    await waitFor(() => {
      expect(result.current.harborJobs.data).not.toBeNull();
    });

    const data = result.current.harborJobs.data!;
    expect(data.total).toBe(2);
    expect(data.running).toBe(1);
    expect(data.byStatus.find((s) => s.label === 'In Port (Done)')?.count).toBe(1);
    expect(data.byType.find((t) => t.label === 'Embark')?.count).toBe(1);
  });

  it('computes anchor reference data from enums', () => {
    const { result } = renderHook(() => useTideWatch(60000));

    expect(result.current.anchor.total).toBeGreaterThan(0);
    expect(result.current.anchor.byCategory.length).toBeGreaterThanOrEqual(1);
    expect(result.current.anchor.byCategory.some((c) => c.label === 'Campuses')).toBe(true);
  });

  it('computes keel reference data from chassis models', () => {
    const { result } = renderHook(() => useTideWatch(60000));

    expect(result.current.keel.total).toBeGreaterThan(0);
    expect(result.current.keel.byCategory.length).toBeGreaterThanOrEqual(1);
  });

  it('computes quartermaster reference data from part categories', () => {
    const { result } = renderHook(() => useTideWatch(60000));

    expect(result.current.quartermaster.total).toBeGreaterThan(0);
    expect(result.current.quartermaster.byCategory.length).toBeGreaterThanOrEqual(1);
  });

  it('refresh triggers re-fetch', async () => {
    const { result } = renderHook(() => useTideWatch(60000));

    await waitFor(() => {
      expect(result.current.devices.data).not.toBeNull();
    });

    const callsBefore = mockServices.ocean.listDevices.mock.calls.length;

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(mockServices.ocean.listDevices.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  it('handles fetch errors gracefully', async () => {
    mockServices.ocean.listDevices.mockImplementation(() => Promise.reject(new Error('Network error')));

    const { result } = renderHook(() => useTideWatch(60000));

    await waitFor(() => {
      expect(result.current.devices.loading).toBe(false);
    });

    expect(result.current.devices.error).toBe('Network error');
    expect(result.current.devices.data).toBeNull();
  });

  it('exposes timeRange and setTimeRange', () => {
    const { result } = renderHook(() => useTideWatch(60000));

    expect(result.current.timeRange).toBe(0);
    expect(result.current.setTimeRange).toBe(mockSetTimeRange);
  });

  it('filters shipwright jobs by time range when set', async () => {
    mockTimeRange = 60; // 60 minutes — all mock jobs are well within range
    const { result } = renderHook(() => useTideWatch(60000));

    await waitFor(() => {
      expect(result.current.shipwrightJobs.data).not.toBeNull();
    });

    expect(result.current.shipwrightJobs.data!.total).toBe(3);
  });

  it('returns empty time series for empty jobs', async () => {
    mockServices.shipwright.listJobs.mockImplementation(() =>
      Promise.resolve({ shipwrightJobResponses: [] }),
    );

    const { result } = renderHook(() => useTideWatch(60000));

    await waitFor(() => {
      expect(result.current.shipwrightJobs.data).not.toBeNull();
    });

    expect(result.current.shipwrightJobs.data!.timeSeries).toEqual([]);
    expect(result.current.shipwrightJobs.data!.total).toBe(0);
  });
});
