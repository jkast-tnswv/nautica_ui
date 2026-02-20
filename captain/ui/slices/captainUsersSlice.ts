import { createEntitySlice } from '@core/store/createEntitySlice';
import type { CaptainUser } from '@core/gen/captain/api/captain_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import type { CaptainCreateUserRequest } from '@core/gen/captain/api/captain_pb';
import { getServices } from '@core/services';

const slice = createEntitySlice<CaptainUser, void, PartialMessage<CaptainCreateUserRequest>>({
  name: 'captainUsers',
  create: {
    type: 'captainUsers/create',
    fn: (data) => getServices().captain.createUser(data),
  },
});

export const createCaptainUser = slice.createThunk;
export default slice.reducer;
