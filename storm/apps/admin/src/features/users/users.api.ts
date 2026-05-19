import { apiSlice } from "../../store/apiSlice";
import type {
  AdminUserDetail,
  AdminUserListResponse,
  UserListFilters,
} from "./users.types";

const usersApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    listUsers: build.query<AdminUserListResponse, UserListFilters>({
      query: (params) => ({
        url: "/api/admin/users",
        method: "GET",
        params: filtersToQuery(params),
      }),
      providesTags: [{ type: "AdminUserList", id: "LIST" }],
    }),
    getUser: build.query<AdminUserDetail, string>({
      query: (id) => ({ url: `/api/admin/users/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "AdminUserDetail", id }],
    }),
    blockUser: build.mutation<void, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/api/admin/users/${id}/block`,
        method: "POST",
        data: { reason },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "AdminUserList", id: "LIST" },
        { type: "AdminUserDetail", id },
      ],
    }),
    unblockUser: build.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/api/admin/users/${id}/unblock`,
        method: "POST",
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "AdminUserList", id: "LIST" },
        { type: "AdminUserDetail", id },
      ],
    }),
  }),
});

function filtersToQuery(filters: UserListFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.q) params["q"] = filters.q;
  if (filters.role) params["role"] = filters.role;
  if (filters.blocked) params["blocked"] = filters.blocked;
  params["page"] = String(filters.page ?? 1);
  params["pageSize"] = String(filters.pageSize ?? 20);
  return params;
}

export const {
  useListUsersQuery,
  useGetUserQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
} = usersApi;
