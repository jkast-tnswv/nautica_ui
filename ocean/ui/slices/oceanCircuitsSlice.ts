import { createEntitySlice } from '@core/store/createEntitySlice';
import type { OceanCircuit } from '@core/gen/ocean/api/ocean_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { OceanCircuitListRequest } from '@core/gen/ocean/api/ocean_pb';
import { getServices } from '@core/services';

const slice = createEntitySlice<OceanCircuit, PartialMessage<OceanCircuitListRequest> | undefined>({
  name: 'oceanCircuits',
  fetch: {
    type: 'oceanCircuits/fetch',
    fn: async (filters) => {
      const response = await getServices().ocean.listCircuits(filters);
      return response.oceanCircuits;
    },
  },
});

export const { reducer: oceanCircuitsReducer } = slice;
export const fetchOceanCircuits = slice.fetchThunk;
export default oceanCircuitsReducer;
