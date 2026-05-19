export interface AdminUser {
  id: string;
  email: string;
  name: string;
  mobile: string | null;
  role: "customer" | "admin";
  blocked: boolean;
  emailVerified: boolean;
  mobileVerified: boolean;
  createdAt: string;
}

export interface AdminUserListResponse {
  items: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminAddress {
  id: string;
  label: string;
  fullName: string;
  mobile: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

export interface AdminProfileChange {
  id: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changedAt: string;
}

export interface AdminAuditLogEntry {
  id: string;
  actorId: string | null;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AdminUserDetail {
  user: AdminUser;
  addresses: AdminAddress[];
  profileChanges: AdminProfileChange[];
  auditLog: AdminAuditLogEntry[];
}

export interface UserListFilters {
  q?: string | undefined;
  role?: "customer" | "admin" | undefined;
  blocked?: "true" | "false" | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}
