import { createGrpcWebTransport } from "@connectrpc/connect-web";
import type { Interceptor, Transport } from "@connectrpc/connect";
import type { AccessToken } from "@okta/okta-auth-js";
import { getOktaAuth } from "./okta";

export interface GrpcConfig {
  baseUrl: string;
}

let globalConfig: GrpcConfig = {
  baseUrl: "http://localhost:8080",
};

let cachedTransport: Transport | null = null;

// Reads access token from Okta's token manager on every gRPC call
const authInterceptor: Interceptor = (next) => async (req) => {
  try {
    const token = await getOktaAuth().tokenManager.get('accessToken') as AccessToken | undefined;
    if (token?.accessToken) {
      req.header.set('authorization', `Bearer ${token.accessToken}`);
    }
  } catch { /* no token available */ }
  return next(req);
};

export function configureGrpc(config: Partial<GrpcConfig>): void {
  globalConfig = { ...globalConfig, ...config };
  cachedTransport = null;
}

export function getGrpcConfig(): GrpcConfig {
  return globalConfig;
}

export function getTransport(): Transport {
  if (!cachedTransport) {
    cachedTransport = createGrpcWebTransport({
      baseUrl: globalConfig.baseUrl,
      interceptors: [authInterceptor],
    });
  }
  return cachedTransport;
}
