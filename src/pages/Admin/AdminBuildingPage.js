import React, { useEffect, useState } from "react";
import {
  getAllBuildings,
  createBuilding,
  updateBuilding,
  deleteBuilding,
} from "../../api/adminBuildingApi";
import { useDispatch } from "react-redux";
import { showModal } from "../../slices/modalSlice";
import useConfirmModal from "../../hooks/useConfirmModal";
import BaseModal from "../../components/BaseModal";
import PageComponent from "../../components/PageComponent";

const AdminBuildingPage = () => {
  const dispatch = useDispatch();
  const { openConfirm, ConfirmModalComponent } = useConfirmModal();

  const [buildings, setBuildings] = useState([]);
  const [form, setForm] = useState({ name: "", status: "AVAILABLE" });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedBuildings = buildings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchBuildings = async () => {
    try {
      const res = await getAllBuildings();
      setBuildings(res.data);
    } catch {
      setBuildings([]);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode && editTarget) {
        await updateBuilding(editTarget.buildingId, form.name, form.status);
        dispatch(showModal("건물 수정 완료"));
      } else {
        await createBuilding(form.name, form.status);
        dispatch(showModal("건물 등록 완료"));
      }
      setIsModalOpen(false);
      setForm({ name: "", status: "AVAILABLE" });
      setIsEditMode(false);
      setEditTarget(null);
      fetchBuildings();
    } catch (err) {
      dispatch(
        showModal({
          message: err?.response?.data || "요청 처리 중 오류 발생",
          type: "error",
        })
      );
    }
  };

  const handleDelete = (building) => {
    openConfirm(
      `${building.buildingName} \n\n이 건물을 삭제하시겠습니까?\n\n※ 수업 이력이 있는 강의실이 포함된 건물은 삭제할 수 없습니다.`,
      async () => {
        try {
          await deleteBuilding(building.buildingId);
          dispatch(showModal("건물 삭제 완료"));
          fetchBuildings();
        } catch (err) {
          dispatch(
            showModal({
              message: err?.response?.data || "삭제 중 오류 발생",
              type: "error",
            })
          );
        }
      }
    );
  };

  const openEditModal = (building) => {
    setForm({ name: building.buildingName, status: building.status });
    setEditTarget(building);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full p-4 md:p-6 lg:p-8 mt-6">
      <div className="flex justify-between items-center border-b pb-3 mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">건물 사용 현황</h2>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setIsEditMode(false);
            setForm({ name: "", status: "AVAILABLE" });
          }}
          className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
        >
          건물 등록
        </button>
      </div>

      <table className="min-w-full table-auto border border-gray-300 rounded text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase">
          <tr className="text-center">
            <th className="py-3 px-4">건물번호</th>
            <th className="py-3 px-4">건물명</th>
            <th className="py-3 px-4">상태</th>
            <th className="py-3 px-4">관리</th>
          </tr>
        </thead>
        <tbody className="text-center text-gray-700">
          {buildings.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-4 text-gray-400">
                등록된 건물이 없습니다.
              </td>
            </tr>
          ) : (
            paginatedBuildings.map((b) => (
              <tr key={b.buildingId} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{b.buildingId}</td>
                <td className="py-2 px-4">{b.buildingName}</td>
                <td className="py-2 px-4">
                  {b.status === "AVAILABLE" ? "✅ 사용 가능" : "❌ 사용 불가"}
                </td>
                <td className="py-2 px-4 space-x-2">
                  <button
                    onClick={() => openEditModal(b)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(b)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <PageComponent
          currentPage={currentPage}
          totalPage={Math.ceil(buildings.length / itemsPerPage)}
          onPageChange={(page) => setCurrentPage(page)}
        />

      <BaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-xl font-semibold mb-6 text-center">
          {isEditMode ? "건물 수정" : "건물 등록"}
        </h2>

        <div
          className={`grid gap-4 ${
            isEditMode ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          }`}
        >
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              건물명 *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="예: 공학관"
            />
          </div>

          {isEditMode && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                상태 *
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="AVAILABLE">사용 가능</option>
                <option value="UNAVAILABLE">사용 불가</option>
              </select>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          className={`mt-6 w-full ${
            isEditMode
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white py-2 rounded`}
        >
          {isEditMode ? "수정" : "등록"}
        </button>
      </BaseModal>

      {ConfirmModalComponent}
    </div>
  );
};

export default AdminBuildingPage;
