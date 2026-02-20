import { GrpcBaseService } from '@core/services/base';
import { Captain } from '@core/gen/captain/api/captain_connect';
import type { CaptainUser, CaptainGroup } from '@core/gen/captain/api/captain_pb';
import { CaptainCreateUserRequest, CaptainCreateGroupRequest } from '@core/gen/captain/api/captain_pb';
import type { PartialMessage } from '@bufbuild/protobuf';

export class CaptainService extends GrpcBaseService {
  private client = this.createGrpcClient(Captain);

  async createUser(data: PartialMessage<CaptainCreateUserRequest>): Promise<CaptainUser> {
    const req = new CaptainCreateUserRequest(data);
    return this.call(
      'CreateCaptainUser',
      'captain.Captain',
      () => this.client.createCaptainUser(req),
      req,
    );
  }

  async createGroup(data: PartialMessage<CaptainCreateGroupRequest>): Promise<CaptainGroup> {
    const req = new CaptainCreateGroupRequest(data);
    return this.call(
      'CreateCaptainGroup',
      'captain.Captain',
      () => this.client.createCaptainGroup(req),
      req,
    );
  }
}
