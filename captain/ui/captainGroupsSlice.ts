import { createEntitySlice } from '@core/store/createEntitySlice';
import type { CaptainGroup } from '@core/gen/captain/api/captain_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { CaptainCreateGroupRequest } from '@core/gen/captain/api/captain_pb';
import { getServices } from '@core/services';

const slice = createEntitySlice<CaptainGroup, void, PartialMessage<CaptainCreateGroupRequest>>({
  name: 'captainGroups',
  create: {
    type: 'captainGroups/create',
    fn: (data) => getServices().captain.createGroup(data),
  },
});

export const createCaptainGroup = slice.createThunk;
export default slice.reducer;
