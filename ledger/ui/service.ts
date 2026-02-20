import { GrpcBaseService } from '@core/services/base';
import { Ledger } from '@core/gen/ledger/api/ledger_connect';
import type { LedgerSearchResponse } from '@core/gen/ledger/api/ledger_pb';
import { LedgerSearchRequest } from '@core/gen/ledger/api/ledger_pb';
import type { PartialMessage } from '@bufbuild/protobuf';

export class LedgerService extends GrpcBaseService {
  private client = this.createGrpcClient(Ledger);

  async search(filters?: PartialMessage<LedgerSearchRequest>): Promise<LedgerSearchResponse> {
    const req = new LedgerSearchRequest(filters);
    return this.call(
      'Search',
      'ledger.Ledger',
      () => this.client.search(req),
      req,
    );
  }
}
