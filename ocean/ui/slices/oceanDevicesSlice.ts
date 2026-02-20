import { createEntitySlice } from '@core/store/createEntitySlice';
import type { OceanDevice } from '@core/gen/ocean/api/ocean_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { OceanDeviceListRequest } from '@core/gen/ocean/api/ocean_pb';
import { getServices } from '@core/services';

const slice = createEntitySlice<OceanDevice, PartialMessage<OceanDeviceListRequest> | undefined>({
  name: 'oceanDevices',
  fetch: {
    type: 'oceanDevices/fetch',
    fn: async (filters) => {
      const response = await getServices().ocean.listDevices(filters);
      return response.oceanDevices;
    },
  },
});

export const fetchOceanDevices = slice.fetchThunk;
export default slice.reducer;
