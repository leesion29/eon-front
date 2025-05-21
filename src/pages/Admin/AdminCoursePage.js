import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  getCoursesByFilter,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../api/adminCourseApi";
import { getAllDepartments } from "../../api/adminDepartmentApi";
import { showModal } from "../../slices/modalSlice";
import useConfirmModal from "../../hooks/useConfirmModal";
import PageComponent from "../../components/PageComponent";
import BaseModal from "../../components/BaseModal";

const AdminCoursePage = () => {
  const dispatch = useDispatch();
  const { openConfirm, ConfirmModalComponent } = useConfirmModal();
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [form, setForm] = useState({
    name: "",
    type: "MAJOR",
    credit: 3,
    year: 1,
    departmentId: "",
    status: "AVAILABLE",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const fetchDepartments = async () => {
    const res = await getAllDepartments();
    setDepartments(res.data);
    if (res.data.length > 0) setSelectedDept(String(res.data[0].departmentId));
  };

  const fetchCourses = async () => {
    if (!selectedDept) return;
    const res = await getCoursesByFilter(selectedDept);
    setCourses(res.data);
  };

  useEffect(() => {
    fetchDepartments();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
    fetchCourses();
  }, [selectedDept]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "type") {
      const isMajor = value === "MAJOR";
      setForm((prev) => ({
        ...prev,
        type: value,
        credit: isMajor ? 3 : 1,
        departmentId: isMajor ? prev.departmentId : "",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (form.type === "MAJOR" && !form.departmentId) {
        dispatch(
          showModal({
            message: "전공 과목은 학과를 선택해야 합니다.",
            type: "error",
          })
        );
        return;
      }

      if (isEditMode && editTarget) {
        await updateCourse(editTarget.courseId, {
          newName: form.name,
          newCredit: Number(form.credit),
          newCourseYear: Number(form.year),
          newType: form.type,
          newStatus: form.status,
        });
        dispatch(showModal("과목 수정 완료"));
      } else {
        await createCourse({
          courseName: form.name,
          courseType: form.type,
          credit: Number(form.credit),
          courseYear: Number(form.year),
          departmentId:
            form.type === "MAJOR" && form.departmentId !== ""
              ? Number(form.departmentId)
              : null,
          status: form.status || "AVAILABLE",
        });
        dispatch(showModal("과목 등록 완료"));
      }

      setIsModalOpen(false);
      setIsEditMode(false);
      setEditTarget(null);
      setForm({
        name: "",
        type: "MAJOR",
        credit: 3,
        year: 1,
        status: "AVAILABLE",
        departmentId: "",
      });
      fetchCourses();
    } catch (err) {
      dispatch(
        showModal({
          message: err?.response?.data || "요청 처리 중 오류 발생",
          type: "error",
        })
      );
    }
  };

  const openEditModal = (course) => {
    setForm({
      name: course.courseName,
      type: course.courseType,
      credit: course.credit,
      year: course.courseYear,
      status: course.status,
      departmentId: course.departmentId || "",
    });
    setEditTarget(course);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = (course) => {
    openConfirm(`${course.courseName} 과목을 삭제하시겠습니까?`, async () => {
      try {
        await deleteCourse(course.courseId);
        dispatch(showModal("과목 삭제 완료"));
        fetchCourses();
      } catch (err) {
        dispatch(
          showModal({
            message: err?.response?.data || "삭제 중 오류 발생",
            type: "error",
          })
        );
      }
    });
  };

  const paginatedCourses = courses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-4/5 mx-auto sm:w-full mt-4 sm:mt-6 md:mt-10">
      <div className="w-full sm:max-w-5xl sm:mx-auto bg-white shadow-md rounded-md p-4 md:p-6 lg:p-8 mb-8">
        <div className="flex justify-between items-center border-b pb-3 mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">과목 현황</h2>
          <button
            onClick={() => {
              setForm({
                name: "",
                type: "MAJOR",
                credit: 3,
                year: 1,
                status: "AVAILABLE",
                departmentId: "",
              });
              setIsEditMode(false);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            과목 등록
          </button>
        </div>

        <div className="mb-4">
          <select
            className="px-3 py-2 w-full sm:w-64 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departments.map((d) => (
              <option key={d.departmentId} value={d.departmentId}>
                {d.departmentName}
              </option>
            ))}
            <option value="common">공통</option>
          </select>
        </div>

        {courses.length === 0 ? (
          <p className="py-4 text-center text-gray-400">
            해당 학과의 과목이 없습니다.
          </p>
        ) : (
          <>
            <div className="md:hidden space-y-4">
              {paginatedCourses.map((c) => (
                <div
                  key={`${c.courseId}-card`}
                  className="bg-white p-4 border border-gray-200 rounded-lg shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-blue-700 break-all">
                      {c.courseName}
                    </h3>
                    <span
                      className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${
                        c.status === "AVAILABLE"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {c.status === "AVAILABLE" ? "개설" : "미개설"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      <span className="font-medium text-gray-500">
                        과목번호:
                      </span>{" "}
                      {c.courseId}
                    </p>
                    <p>
                      <span className="font-medium text-gray-500">구분:</span>{" "}
                      {c.courseType === "MAJOR" ? "전공" : "교양"}
                    </p>
                    <p>
                      <span className="font-medium text-gray-500">학점:</span>{" "}
                      {c.credit}학점
                    </p>
                    <p>
                      <span className="font-medium text-gray-500">학년:</span>{" "}
                      {c.courseYear}학년
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => openEditModal(c)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full table-auto shadow-sm border border-gray-200 rounded-md text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
                  <tr className="text-center">
                    <th className="py-3 px-4">과목번호</th>
                    <th className="py-3 px-4">과목명</th>
                    <th className="py-3 px-4">상태</th>
                    <th className="py-3 px-4">구분</th>
                    <th className="py-3 px-4">학점</th>
                    <th className="py-3 px-4">학년</th>
                    <th className="py-3 px-4">관리</th>
                  </tr>
                </thead>
                <tbody className="text-center text-gray-700">
                  {paginatedCourses.map((c) => (
                    <tr key={c.courseId} className="hover:bg-gray-50 border-t">
                      <td className="py-2 px-4">{c.courseId}</td>
                      <td className="py-2 px-4 break-all">{c.courseName}</td>
                      <td className="py-2 px-4">
                        {c.status === "AVAILABLE" ? "✅ 개설" : "❌ 미개설"}
                      </td>
                      <td className="py-2 px-4">
                        {c.courseType === "MAJOR" ? "전공" : "교양"}
                      </td>
                      <td className="py-2 px-4">{c.credit}</td>
                      <td className="py-2 px-4">{c.courseYear}</td>
                      <td className="py-2 px-4 space-x-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {courses.length > 0 && paginatedCourses.length === 0 && (
              <p className="py-4 text-center text-gray-500 md:hidden">
                해당 페이지에 표시할 과목이 없습니다.
              </p>
            )}
          </>
        )}

        <PageComponent
          currentPage={currentPage}
          totalPage={Math.ceil(courses.length / itemsPerPage)}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      <BaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-xl font-bold mb-6 text-center">
            {isEditMode ? "과목 수정" : "과목 등록"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                과목명 *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="과목명을 입력하세요"
                className="w-full p-2 border rounded"
              />
            </div>

            {!isEditMode && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  과목 구분 *
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="MAJOR">전공</option>
                  <option value="LIBERAL">교양</option>
                </select>
              </div>
            )}

            {form.type === "MAJOR" && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  소속 학과 *
                </label>
                <select
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">학과 선택</option>
                  {departments.map((dept) => (
                    <option key={dept.departmentId} value={dept.departmentId}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">
                학점 *
              </label>
              {form.type === "MAJOR" ? (
                <input
                  type="number"
                  name="credit"
                  value={3}
                  readOnly
                  className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
                />
              ) : (
                <select
                  name="credit"
                  value={form.credit}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value={1}>1학점</option>
                  <option value={2}>2학점</option>
                </select>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                대상 학년 *
              </label>
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                min={1}
                max={4}
                className="w-full p-2 border rounded"
              />
            </div>

            {isEditMode && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  과목 상태
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="AVAILABLE">개설</option>
                  <option value="UNAVAILABLE">미개설</option>
                </select>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className={`mt-6 w-full text-white py-3 rounded ${
              isEditMode
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isEditMode ? "수정" : "등록"}
          </button>
        </div>
      </BaseModal>

      {ConfirmModalComponent}
    </div>
  );
};

export default AdminCoursePage;
