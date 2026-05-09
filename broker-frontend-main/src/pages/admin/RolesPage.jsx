import React, { useState, useEffect } from "react";
import { getRoles, createRole, updateRole } from "../../services/identityService";

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);

  // جلب الأدوار أول ما الصفحة تحمل
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await getRoles();
      // بنشيك على شكل الـ Data اللي راجعة من السيرفر
      setRoles(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (currentRole.id) {
        // لو بنعمل تعديل (Update)
        await updateRole(currentRole.id, currentRole);
      } else {
        // لو بنعمل إضافة جديدة (Create)
        await createRole(currentRole);
      }
      setIsModalOpen(false);
      fetchRoles(); // تحديث الكروت بعد الحفظ
    } catch (error) {
      console.error("Failed to save role:", error);
      // بنطلع alert بسيط عشان تعرف لو السيرفر رفض (زي الـ 422 اللي شفناها)
      alert("Failed to save. Check console for validation errors.");
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      {/* الهيدر وزرار الإضافة */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-amber-200">Roles Management</h1>
          <p className="text-gray-400 mt-2">Manage system permissions and access levels</p>
        </div>
        <button
          onClick={() => {
            setCurrentRole({ name: "", description: "" });
            setIsModalOpen(true);
          }}
          className="bg-amber-200 text-black px-8 py-3 rounded-xl font-bold hover:bg-amber-300 transition-all shadow-lg shadow-amber-200/10"
        >
          + Create New Role
        </button>
      </div>

      {/* عرض الكروت */}
      {loading ? (
        <div className="flex justify-center mt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-200"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700 flex justify-between items-center hover:border-amber-200/40 transition-all group"
            >
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-amber-200">{role.name}</h3>
                  <span className="text-[10px] bg-gray-700 px-2 py-1 rounded text-gray-400 uppercase tracking-widest">Role</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  {role.description || "No description provided for this role."}
                </p>
              </div>

              <button
                onClick={() => {
                  setCurrentRole(role);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 bg-gray-700/50 hover:bg-amber-200 hover:text-black px-4 py-2 rounded-lg transition-all"
              >
                <span className="font-semibold text-sm">Edit</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* المودال */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center p-4 z-50">
          <div className="bg-gray-800 p-8 rounded-3xl w-full max-w-md border border-gray-700 shadow-2xl scale-in-center">
            <h2 className="text-2xl font-bold mb-6 text-amber-200">
              {currentRole.id ? "Edit Role Details" : "Create New System Role"}
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 tracking-widest uppercase">Role Name</label>
                <input
                  placeholder="e.g. Moderator"
                  value={currentRole.name}
                  onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
                  className="w-full bg-gray-900/50 p-4 rounded-xl border border-gray-600 text-white focus:border-amber-200 focus:ring-1 focus:ring-amber-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 tracking-widest uppercase">Description</label>
                <textarea
                  placeholder="What permissions does this role have?"
                  value={currentRole.description}
                  onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
                  className="w-full bg-gray-900/50 p-4 rounded-xl border border-gray-600 text-white focus:border-amber-200 focus:ring-1 focus:ring-amber-200 outline-none h-32 resize-none transition-all"
                />
              </div>
            </div>
            <div className="mt-10 flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 text-gray-400 hover:text-white font-medium transition-all"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="bg-amber-200 text-black px-8 py-2 rounded-xl font-bold hover:bg-amber-300 transition-all shadow-lg shadow-amber-200/20"
              >
                {currentRole.id ? "Update Role" : "Create Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPage;