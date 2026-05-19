import { Client } from "@opensearch-project/opensearch";

import type { Config } from "../config.js";

export type OpenSearchClient = Client;

let client: Client | undefined;

export function getOpenSearch(config: Config): Client {
  if (!client) {
    client = new Client({
      node: config.opensearchUrl,
      ssl: { rejectUnauthorized: false },
    });
  }
  return client;
}

export async function disconnectOpenSearch(): Promise<void> {
  if (client) {
    await client.close();
    client = undefined;
  }
}
