import axiosInstance from "./axiosInstance";

/**
 * GET /api/v1/UserManagement/summary
 * جلب قائمة المستخدمين مع pagination وسيرش وفلتر Role
 * @param {{ page?: number, pageSize?: number, search?: string, role?: string }} params
 */
export async function getUsersSummary({ page = 1, pageSize = 12, search = "", role = "" } = {}) {
  const params = { PageNumber: page, PageSize: pageSize };
  if (search) params.SearchTerm = search;
  if (role)   params.Role = role;

  const response = await axiosInstance.get("/api/v1/UserManagement/summary", { params });
  return response.data;
}

/**
 * GET /api/v1/UserManagement/{userId}
 * جلب بيانات مستخدم معين
 * @param {string} userId
 */
export async function getUserById(userId) {
  const response = await axiosInstance.get(`/api/v1/UserManagement/${userId}`);
  return response.data;
}
