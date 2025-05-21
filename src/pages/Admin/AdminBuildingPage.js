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
    <div className="w-4/5 mx-auto sm:w-full mt-4 sm:mt-6 md:mt-10">
      <div className="w-full sm:max-w-5xl sm:mx-auto bg-white shadow-md rounded-md p-4 md:p-6 lg:p-8 mb-8">
        <div className="flex justify-between items-center border-b pb-3 mb-6">
          <h2 className="sm:text-2xl font-semibold text-gray-700">
            건물 사용 현황
          </h2>
          <button
            onClick={() => {
              setIsModalOpen(true);
              setIsEditMode(false);
              setForm({ name: "", status: "AVAILABLE" });
            }}
            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm font-medium"
          >
            건물 등록
          </button>
        </div>

        {buildings.length === 0 ? (
          <p className="py-4 text-center text-gray-400">
            등록된 건물이 없습니다.
          </p>
        ) : (
          <>
            <div className="md:hidden space-y-3">
              {paginatedBuildings.map((b) => (
                <div
                  key={`${b.buildingId}-mobile`}
                  className="py-3 border-b border-gray-200 last:border-b-0"
                >
                  <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                    <span className="font-medium text-gray-500 text-xs col-span-1">
                      건물명:
                    </span>
                    <span className="text-xs text-gray-800 col-span-2 break-all">
                      {b.buildingName}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                    <span className="font-medium text-gray-500 text-xs col-span-1">
                      건물번호:
                    </span>
                    <span className="text-xs text-gray-800 col-span-2">
                      {b.buildingId}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 mb-2 items-center">
                    <span className="font-medium text-gray-500 text-xs col-span-1">
                      상태:
                    </span>
                    <span
                      className={`text-xs col-span-2 ${
                        b.status === "AVAILABLE"
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {b.status === "AVAILABLE"
                        ? "✅ 사용 가능"
                        : "❌ 사용 불가"}
                    </span>
                  </div>
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => openEditModal(b)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(b)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
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
                  {paginatedBuildings.map((b) => (
                    <tr
                      key={b.buildingId}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="py-2 px-4">{b.buildingId}</td>
                      <td className="py-2 px-4 break-all">{b.buildingName}</td>
                      <td className="py-2 px-4">
                        {b.status === "AVAILABLE"
                          ? "✅ 사용 가능"
                          : "❌ 사용 불가"}
                      </td>
                      <td className="py-2 px-4 space-x-2">
                        <button
                          onClick={() => openEditModal(b)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(b)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {buildings.length > 0 && paginatedBuildings.length === 0 && (
              <p className="py-4 text-center text-gray-500 md:hidden">
                해당 페이지에 표시할 건물이 없습니다.
              </p>
            )}
          </>
        )}

        <PageComponent
          currentPage={currentPage}
          totalPage={Math.ceil(buildings.length / itemsPerPage)}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

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
