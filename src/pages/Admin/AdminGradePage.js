import React, { useEffect, useState } from "react";
import { getDepartments } from "../../api/adminUserApi";
import {
  getGradeStatusSummary,
  finalizeGradesByDepartment,
  getCurrentSemester,
} from "../../api/adminGradeApi";
import { useDispatch } from "react-redux";
import { showModal } from "../../slices/modalSlice";
import Loading from "../../components/Loading";

const AdminGradeStatusPage = () => {
  const dispatch = useDispatch();
  const [currentSemester, setCurrentSemester] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [gradeStatusResponse, setGradeStatusResponse] = useState({
    hasStudentRecords: false,
    gradeStatusList: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const semesterRes = await getCurrentSemester();
        const deptRes = await getDepartments();
        setCurrentSemester(semesterRes.data);
        setDepartments(deptRes.data);
      } catch (e) {
        dispatch(
          showModal({
            message: "지금은 성적 집계 기간이 아닙니다.",
            type: "error",
          })
        );
      }
    };
    loadInitialData();
  }, [dispatch]);

  const handleDepartmentChange = async (e) => {
    const deptId = e.target.value;
    setSelectedDepartmentId(deptId);
    setIsLoading(true);
    if (!deptId) {
      setGradeStatusResponse({ hasStudentRecords: false, gradeStatusList: [] });
      setIsLoading(false);
      return;
    }

    try {
      const res = await getGradeStatusSummary(deptId);
      setGradeStatusResponse(res.data);
    } catch (e) {
      dispatch(showModal({ message: "조회에 실패했습니다.", type: "error" }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!selectedDepartmentId) {
      return dispatch(
        showModal({ message: "학과를 선택해주세요.", type: "error" })
      );
    }

    try {
      setIsLoading(true);
      await finalizeGradesByDepartment(selectedDepartmentId);

      dispatch(showModal({ message: "성적 집계가 완료되었습니다." }));

      const res = await getGradeStatusSummary(selectedDepartmentId);
      setGradeStatusResponse(res.data);
    } catch (e) {
      const errorMsg =
        typeof e.response?.data === "string"
          ? e.response.data
          : e.response?.data?.error || "성적 집계에 실패했습니다.";

      dispatch(
        showModal({
          message: errorMsg,
          type: "error",
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 버튼 비활성화 조건
  const hasMissingData = gradeStatusResponse.gradeStatusList.some(
    (s) => s.status === "미입력"
  );

  const hasFixableData = gradeStatusResponse.gradeStatusList.some(
    (s) => s.status === "수정됨"
  );

  const isFinalizeDisabled =
    isLoading ||
    !selectedDepartmentId ||
    hasMissingData ||
    (!hasFixableData && gradeStatusResponse.hasStudentRecords);

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white shadow-md rounded-md mt-10 space-y-12">
      {isLoading && <Loading />}
      <div className="flex justify-between items-center border-b pb-3 mb-4">
        <h2 className="text-2xl font-semibold text-gray-700">성적 집계 현황</h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <span className="text-gray-500 text-base">📅</span>
            <span className="font-semibold">
              {currentSemester?.year}년{" "}
              {currentSemester?.term === "FIRST" ? "1학기" : "2학기"}
            </span>
          </div>

          <select
            value={selectedDepartmentId}
            onChange={handleDepartmentChange}
            className="px-3 py-2 w-64 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="">학과 선택</option>
            {departments.map((d) => (
              <option key={d.departmentId} value={d.departmentId}>
                {d.departmentName}
              </option>
            ))}
          </select>

          <button
            onClick={handleFinalize}
            disabled={isFinalizeDisabled}
            className={`px-4 py-2 rounded transition
              ${
                isFinalizeDisabled
                  ? "bg-gray-300 cursor-not-allowed text-white"
                  : "bg-blue-700 hover:bg-blue-800 text-white"
              }`}
          >
            집계 실행
          </button>
        </div>
      </div>

      <table className="min-w-full table-auto border border-gray-200 text-sm rounded">
        <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
          <tr className="text-center">
            <th className="py-3 px-4">학번</th>
            <th className="py-3 px-4">이름</th>
            <th className="py-3 px-4">학과</th>
            <th className="py-3 px-4">상태</th>
            <th className="py-3 px-4">기존 평균평점</th>
            <th className="py-3 px-4">평균평점 계산</th>
            <th className="py-3 px-4">누락 과목 수</th>
          </tr>
        </thead>
        <tbody className="text-center text-gray-700">
          {selectedDepartmentId === "" ? (
            <tr>
              <td colSpan={7} className="py-4 text-gray-400">
                학과를 선택해주세요.
              </td>
            </tr>
          ) : gradeStatusResponse.gradeStatusList.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-4 text-gray-400">
                미입력 혹은 수정된 성적데이터가 없습니다.
              </td>
            </tr>
          ) : (
            gradeStatusResponse.gradeStatusList.map((s) => (
              <tr key={s.studentId} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{s.studentId}</td>
                <td className="py-2 px-4">{s.studentName}</td>
                <td className="py-2 px-4">{s.departmentName}</td>
                <td className="py-2 px-4 font-semibold">
                  {s.status === "미입력" ? (
                    <span className="text-red-600">미입력</span>
                  ) : (
                    <span className="text-yellow-600">수정됨</span>
                  )}
                </td>
                <td className="py-2 px-4">{s.recordedGpa ?? "-"}</td>
                <td className="py-2 px-4">{s.calculatedGpa ?? "-"}</td>
                <td className="py-2 px-4">{s.missingGradesCount}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminGradeStatusPage;
