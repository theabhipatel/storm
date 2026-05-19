import {
  StormError,
  ErrorCodes,
  type AutocompleteResponse,
  type FacetsResponse,
  type SearchResponse,
} from "@storm/contracts";

import type { Config } from "../config.js";

export function searchClient(config: Config) {
  async function search(query: Record<string, string | string[] | undefined>): Promise<SearchResponse> {
    const url = `${config.searchBaseUrl}/api/search?${toQs(query)}`;
    const res = await fetch(url);
    if (!res.ok) throw unavailable("search", res.status);
    return (await res.json()) as SearchResponse;
  }

  async function autocomplete(q: string): Promise<AutocompleteResponse> {
    const url = `${config.searchBaseUrl}/api/autocomplete?q=${encodeURIComponent(q)}`;
    const res = await fetch(url);
    if (!res.ok) throw unavailable("search", res.status);
    return (await res.json()) as AutocompleteResponse;
  }

  async function facets(query: Record<string, string | string[] | undefined>): Promise<FacetsResponse> {
    const url = `${config.searchBaseUrl}/api/facets?${toQs(query)}`;
    const res = await fetch(url);
    if (!res.ok) throw unavailable("search", res.status);
    return (await res.json()) as FacetsResponse;
  }

  return { search, autocomplete, facets };
}

function toQs(query: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      if (v.length > 0) params.set(k, v.join(","));
    } else {
      params.set(k, v);
    }
  }
  return params.toString();
}

function unavailable(svc: string, status: number): StormError {
  return new StormError({
    code: ErrorCodes.SERVICE_UNAVAILABLE,
    message: `${svc} responded with ${status}.`,
    status: 502,
  });
}
