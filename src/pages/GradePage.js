import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUserId as setUserIdAction } from "../slices/authSlice";
import { fetchStudentGrades, fetchStudentRecord } from "../api/studentGradeApi";
import { convertGradeLabel } from "../util/gradeUtil";
import { getList, getStatus } from "../api/evaluationAPI";
import AlertModal from "../components/AlertModal";
import { useNavigate } from "react-router-dom";

const GradePage = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.userId);

  const [grades, setGrades] = useState([]);
  const [record, setRecord] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const localId = localStorage.getItem("id");
    if (!userId && localId) {

      dispatch(setUserIdAction(localId));
      loadAllData();
    } else if (userId) {
      loadAllData();
    }
  }, [userId, dispatch]);

  const loadAllData = async () => {
    if (!userId) {
        return;
    }
    try {
      const [gradesRes, recordRes] = await Promise.all([
        fetchStudentGrades(),
        fetchStudentRecord(),
      ]);
      setGrades(gradesRes.data);
      setRecord(recordRes.data);
    } catch (error) {
      setMessage("성적 정보를 불러올 수 없습니다.");
    }
  };

  const [courselist, setCourseList] = useState([]);
  const [evaluationStatus, setEvaluationStatus] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingEval, setIsLoadingEval] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsModalOpen(false);
    navigate("/main/evaluationlist");
  };

  const alertMessage = `현재 학기 성적은 모든 과목을\n 강의 평가 후, 조회할 수 있습니다.`;

  useEffect(() => {
    const fetchCourseList = async () => {
      if (!userId) {
        setCourseList([]);
        return;
      }
      try {
        const data = await getList(userId);
        setCourseList(data || []);
      } catch (error) {
        setCourseList([]);
      }
    };

    const fetchStatus = async () => {
      if (!userId) {
        setEvaluationStatus([]);
        return;
      }
      try {
        const data = await getStatus(userId);
        setEvaluationStatus(data || []);
      } catch (error) {
        setEvaluationStatus([]);
      }
    };

    const fetchAll = async () => {
      setIsLoadingEval(true);
      await Promise.all([fetchCourseList(), fetchStatus()]);
      setIsLoadingEval(false);
    };

    if (userId) {
      fetchAll();
    } else {
      setIsLoadingEval(false);
      setCourseList([]);
      setEvaluationStatus([]);
    }
  }, [userId]);

  useEffect(() => {
    if (!isLoadingEval && courselist && courselist.length > 0 && evaluationStatus && evaluationStatus.length > 0) {
      const isNotEvaluated = courselist.some(
        (course) => {
          const evaluationFound = evaluationStatus.some(
            (e) => e.classId === course.classId && e.studentId === userId // Direct string comparison
          );
          return !evaluationFound;
        }
      );
      setIsModalOpen(isNotEvaluated);
    } else {
      if (!isLoadingEval && courselist && courselist.length === 0) {
        setIsModalOpen(false);
      }

      else if (!isLoadingEval && courselist && courselist.length > 0 && (!evaluationStatus || evaluationStatus.length === 0)) {
        setIsModalOpen(true);
      } else if (!isLoadingEval) {
        setIsModalOpen(false);
      }
    }
  }, [courselist, evaluationStatus, userId, isLoadingEval]);

  return (
    <div className="w-full sm:w-4/5 mx-auto mt-4 sm:mt-6 md:mt-10 px-2 sm:px-0 space-y-6 sm:space-y-8">
      {record && (
        <div className="w-full mx-auto bg-white shadow-md rounded-md p-4 md:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4 sm:mb-6 border-b pb-3">
            {record.semester.year}년 {record.semester.term === "FIRST" ? "1학기" : "2학기"} 성적 요약
          </h2>

          <div className="md:hidden space-y-1 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-gray-500">연도:</span>
              <span className="text-gray-800">{record.semester.year}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-gray-500">학기:</span>
              <span className="text-gray-800">{record.semester.term === "FIRST" ? "1" : "2"}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-gray-500">신청학점:</span>
              <span className="text-gray-800">{record.enrolled ?? "-"}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-gray-500">취득학점:</span>
              <span className="text-gray-800">{record.earned ?? "-"}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-gray-500">평균평점:</span>
              <span className="text-gray-800">{record.gpa?.toFixed(2) ?? "-"}</span>
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-300 rounded-md text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs sm:text-sm leading-normal">
                <tr className="text-center">
                  <th className="py-3 px-4">연도</th>
                  <th className="py-3 px-4">학기</th>
                  <th className="py-3 px-4">신청학점</th>
                  <th className="py-3 px-4">취득학점</th>
                  <th className="py-3 px-4">평균평점</th>
                </tr>
              </thead>
              <tbody className="text-center text-gray-700">
                <tr className="hover:bg-gray-50 border-t">
                  <td className="py-2 px-4">{record.semester.year}</td>
                  <td className="py-2 px-4">{record.semester.term === "FIRST" ? "1" : "2"}</td>
                  <td className="py-2 px-4">{record.enrolled ?? "-"}</td>
                  <td className="py-2 px-4">{record.earned ?? "-"}</td>
                  <td className="py-2 px-4">{record.gpa?.toFixed(2) ?? "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="w-full mx-auto bg-white shadow-md rounded-md p-4 md:p-6 lg:p-8">
        <div className="border-b pb-3 mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2 sm:mb-0">과목별 성적</h2>
          {record && (
            <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm md:text-base mt-2">
              <span className="text-gray-500">📅</span>
              <span className="font-semibold">
                {record.semester.year}년 {record.semester.term === "FIRST" ? "1학기" : "2학기"}
              </span>
            </div>
          )}
        </div>

        {message && (
          <p className="py-4 text-center text-red-500 font-medium text-sm">{message}</p>
        )}

        <div className="md:hidden space-y-3">
          {grades.length === 0 && !message ? (
            <p className="py-4 text-center text-gray-400 text-xs">조회할 성적이 없습니다.</p>
          ) : (
            grades.map((g, i) => (
              <div key={`${g.courseName}-${i}-mobile`} className="py-3 border rounded-md p-3 border-gray-200 text-xs">
                <div className="grid grid-cols-3 gap-x-2 mb-0.5 items-center">
                  <span className="font-medium text-gray-500 col-span-1">과목명:</span>
                  <span className="text-gray-800 col-span-2 break-all">{g.courseName}</span>
                </div>
                <div className="grid grid-cols-3 gap-x-2 mb-0.5 items-center">
                  <span className="font-medium text-gray-500 col-span-1">구분:</span>
                  <span className="text-gray-800 col-span-2">{g.courseType || "-"}</span>
                </div>
                <div className="grid grid-cols-3 gap-x-2 mb-0.5 items-center">
                  <span className="font-medium text-gray-500 col-span-1">학점:</span>
                  <span className="text-gray-800 col-span-2">{g.credit}</span>
                </div>
                <div className="grid grid-cols-3 gap-x-2 mb-0.5 items-center">
                  <span className="font-medium text-gray-500 col-span-1">등급:</span>
                  <span className="text-gray-800 col-span-2">{g.grade ? convertGradeLabel(g.grade) : "미등록"}</span>
                </div>
                <div className="grid grid-cols-3 gap-x-2 items-center">
                  <span className="font-medium text-gray-500 col-span-1">평점:</span>
                  <span className="text-gray-800 col-span-2">{g.gradePoint?.toFixed(1) ?? "-"}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-300 rounded-md text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs sm:text-sm leading-normal">
              <tr className="text-center">
                <th className="py-3 px-4">과목명</th>
                <th className="py-3 px-4">구분</th>
                <th className="py-3 px-4">학점</th>
                <th className="py-3 px-4">등급</th>
                <th className="py-3 px-4">평점</th>
              </tr>
            </thead>
            <tbody className="text-center text-gray-700">
              {grades.length === 0 && !message ? (
                <tr>
                  <td colSpan={5} className="py-4 text-gray-400">조회할 성적이 없습니다.</td>
                </tr>
              ) : (
                grades.map((g, i) => (
                  <tr key={i} className="hover:bg-gray-50 border-t">
                    <td className="py-2 px-4">{g.courseName}</td>
                    <td className="py-2 px-4">{g.courseType || "-"}</td>
                    <td className="py-2 px-4">{g.credit}</td>
                    <td className="py-2 px-4">{g.grade ? convertGradeLabel(g.grade) : "미등록"}</td>
                    <td className="py-2 px-4">{g.gradePoint?.toFixed(1) ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`fixed inset-0 backdrop-blur-sm bg-black/10 z-40 ${isModalOpen ? "block" : "hidden"}`}></div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <AlertModal
            isOpen={isModalOpen}
            message={alertMessage}
            onClose={handleClose}
            type="error"
          />
        </div>
      )}
    </div>
  );
};

export default GradePage;