import axiosInstance from "./axiosInstance";

// ── Upgrade / KYC ────────────────────────────────────────────────────────────
export async function upgradeToLandlord() {
  const response = await axiosInstance.post(
    "/api/v1/IdentityManagement/upgrade-to-landlord",
    {},
  );
  return response.data;
}

export async function getKycStatus() {
  const response = await axiosInstance.get(
    "/api/v1/IdentityManagement/kyc/status",
  );
  return response.data;
}

// ── Roles — GET all (full details) ───────────────────────────────────────────
// Response: { succeeded, message, errors, data: [{ id, name, displayName, description, userCount, createdAt, createdBy, isActive }] }
export async function getRoles() {
  return axiosInstance.get("/api/v1/IdentityManagement/roles");
}

// ── Roles — GET lookup (lightweight) ─────────────────────────────────────────
// Response: { succeeded, message, errors, data: [{ id, name, displayName }] }
export async function getRolesLookup() {
  const res = await axiosInstance.get("/api/v1/IdentityManagement/roles/lookup");
  return res.data?.data ?? res.data ?? [];
}

// ── Roles — POST create ───────────────────────────────────────────────────────
// Body: { roleName, displayName, description }
export async function createRole(data) {
  return axiosInstance.post("/api/v1/IdentityManagement/roles", data);
}

// ── Roles — PUT update ────────────────────────────────────────────────────────
// Body: { displayName, description }
export async function updateRole(roleId, data) {
  return axiosInstance.put(`/api/v1/IdentityManagement/roles/${roleId}`, data);
}

// ── Users — POST assign role ──────────────────────────────────────────────────
// Body: { roleName }
export async function assignRoleToUser(userId, roleName) {
  return axiosInstance.post(`/api/v1/IdentityManagement/users/${userId}/roles`, {
    roleName,
  });
}
