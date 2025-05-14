import React, { useEffect, useState } from "react";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../api/adminDepartmentApi";
import { useDispatch } from "react-redux";
import { showModal } from "../../slices/modalSlice";
import useConfirmModal from "../../hooks/useConfirmModal";
import BaseModal from "../../components/BaseModal";
import PageComponent from "../../components/PageComponent";

const AdminDepartmentPage = () => {
  const dispatch = useDispatch();
  const { openConfirm, ConfirmModalComponent } = useConfirmModal();

  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ name: "", status: "AVAILABLE" });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedDepartments = departments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchDepartments = async () => {
    try {
      const res = await getAllDepartments();
      setDepartments(res.data);
    } catch {
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (isEditMode && editTarget) {
        await updateDepartment(editTarget.departmentId, form.name, form.status);
        dispatch(showModal("학과 수정 완료"));
      } else {
        await createDepartment(form.name);
        dispatch(showModal("학과 등록 완료"));
      }
      setIsModalOpen(false);
      setForm({ name: "", status: "AVAILABLE" });
      setIsEditMode(false);
      setEditTarget(null);
      fetchDepartments();
    } catch (err) {
      dispatch(
        showModal({
          message: err?.response?.data || "요청 처리 중 오류 발생",
          type: "error",
        })
      );
    }
  };

  const handleDelete = (department) => {
    openConfirm(
      `${department.departmentName}\n\n이 학과를 삭제하시겠습니까?`,
      async () => {
        try {
          await deleteDepartment(department.departmentId);
          dispatch(showModal("학과 삭제 완료"));
          fetchDepartments();
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

  const openEditModal = (department) => {
    setForm({ name: department.departmentName, status: department.status });
    setEditTarget(department);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full p-4 md:p-6 lg:p-8 mt-6">
      <div className="flex justify-between items-center border-b pb-3 mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">학과 현황</h2>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setIsEditMode(false);
            setForm({ name: "", status: "AVAILABLE" });
          }}
          className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
        >
          학과 등록
        </button>
      </div>

      <table className="min-w-full table-auto border border-gray-300 rounded text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase">
          <tr className="text-center">
            <th className="py-3 px-4">학과번호</th>
            <th className="py-3 px-4">학과명</th>
            <th className="py-3 px-4">상태</th>
            <th className="py-3 px-4">학생 수</th>
            <th className="py-3 px-4">교수 수</th>
            <th className="py-3 px-4">개설 과목 수</th>
            <th className="py-3 px-4">개설 강의 수</th>
            <th className="py-3 px-4">관리</th>
          </tr>
        </thead>
        <tbody className="text-center text-gray-700">
          {departments.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-4 text-gray-400">
                등록된 학과가 없습니다.
              </td>
            </tr>
          ) : (
            paginatedDepartments.map((d) => (
              <tr key={d.departmentId} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{d.departmentId}</td>
                <td className="py-2 px-4">{d.departmentName}</td>
                <td className="py-2 px-4">
                  {d.status === "AVAILABLE" ? "✅ 운영 중" : "❌ 운영 중지"}
                </td>
                <td className="py-2 px-4">{d.studentCount}명</td>
                <td className="py-2 px-4">{d.professorCount}명</td>
                <td className="py-2 px-4">{d.courseCount}개</td>
                <td className="py-2 px-4">{d.classCount}개</td>
                <td className="py-2 px-4 space-x-2">
                  <button
                    onClick={() => openEditModal(d)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(d)}
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
        totalPage={Math.ceil(departments.length / itemsPerPage)}
        onPageChange={(page) => setCurrentPage(page)}
      />

      <BaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-xl font-semibold mb-6 text-center">
          {isEditMode ? "학과 수정" : "학과 등록"}
        </h2>

        <div
          className={`grid gap-4 ${
            isEditMode ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          }`}
        >
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              학과명 *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="예: 컴퓨터공학과"
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
                <option value="AVAILABLE">운영 중</option>
                <option value="UNAVAILABLE">운영 중지</option>
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

export default AdminDepartmentPage;
