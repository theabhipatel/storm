import type {
  AutocompleteResponse,
  FacetsResponse,
  SearchResponse,
} from "@storm/contracts";

import { apiSlice } from "../../store/apiSlice";

export interface SearchQueryArgs {
  q?: string | undefined;
  categoryId?: string | undefined;
  brandId?: string | undefined;
  priceMin?: string | undefined;
  priceMax?: string | undefined;
  inStock?: string | undefined;
  sort?: string | undefined;
  cursor?: string | undefined;
  limit?: string | undefined;
}

function stripEmpty(args: SearchQueryArgs): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(args)) {
    if (v !== undefined && v !== "" && v !== null) out[k] = String(v);
  }
  return out;
}

export const searchApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    search: build.query<SearchResponse, SearchQueryArgs>({
      query: (args) => ({
        url: "/api/search",
        method: "GET",
        params: stripEmpty(args),
      }),
    }),
    facets: build.query<FacetsResponse, SearchQueryArgs>({
      query: (args) => ({
        url: "/api/facets",
        method: "GET",
        params: stripEmpty(args),
      }),
    }),
    autocomplete: build.query<AutocompleteResponse, string>({
      query: (q) => ({
        url: "/api/autocomplete",
        method: "GET",
        params: { q },
      }),
    }),
  }),
});

export const {
  useSearchQuery,
  useFacetsQuery,
  useAutocompleteQuery,
  useLazyAutocompleteQuery,
} = searchApi;
