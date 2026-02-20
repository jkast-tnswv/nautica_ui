import { GrpcBaseService } from '@core/services/base';
import { Skipper } from '@core/gen/skipper/api/skipper_connect';
import type { SkipperBuildResponse, SkipperPushResponse } from '@core/gen/skipper/api/skipper_pb';
import { SkipperBuildRequest, SkipperPushRequest } from '@core/gen/skipper/api/skipper_pb';
import type { PartialMessage } from '@bufbuild/protobuf';

export class SkipperService extends GrpcBaseService {
  private client = this.createGrpcClient(Skipper);

  async buildPackage(data: PartialMessage<SkipperBuildRequest>): Promise<SkipperBuildResponse> {
    const req = new SkipperBuildRequest(data);
    return this.call(
      'BuildSkipperPackage',
      'skipper.Skipper',
      () => this.client.buildSkipperPackage(req),
      req,
    );
  }

  async pushPackage(data: PartialMessage<SkipperPushRequest>): Promise<SkipperPushResponse> {
    const req = new SkipperPushRequest(data);
    return this.call(
      'PushSkipperPackage',
      'skipper.Skipper',
      () => this.client.pushSkipperPackage(req),
      req,
    );
  }
}
