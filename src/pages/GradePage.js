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
  }, [userId]);

  const loadAllData = async () => {
    try {
      const [gradesRes, recordRes] = await Promise.all([
        fetchStudentGrades(),
        fetchStudentRecord(),
      ]);
      setGrades(gradesRes.data);
      setRecord(recordRes.data);
    } catch {
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
      const data = await getList(userId);
      setCourseList(data);
    };

    const fetchStatus = async () => {
      const data = await getStatus(userId);
      setEvaluationStatus(data);
    };

    const fetchAll = async () => {
      setIsLoadingEval(true);
      await Promise.all([fetchCourseList(), fetchStatus()]);
      setIsLoadingEval(false);
    };

    if (userId) fetchAll();
  }, [userId]);

  useEffect(() => {
    if (!isLoadingEval && courselist.length > 0 && evaluationStatus.length > 0) {
      const isNotEvaluated = courselist.some(
        (course) =>
          !evaluationStatus.some(
            (e) => e.classId === course.classId && e.studentId === userId
          )
      );
      setIsModalOpen(isNotEvaluated);
    }
  }, [courselist, evaluationStatus, userId, isLoadingEval]);

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10">
      {record && (
        <div className="bg-white shadow-md rounded-md p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {record.semester.year}년 {record.semester.term === "FIRST" ? "1학기" : "2학기"} 성적
          </h2>
          <table className="min-w-full table-auto border border-gray-200 rounded-md text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
              <tr className="text-center">
                <th className="py-3 px-4 w-1/5">연도</th>
                <th className="py-3 px-4 w-1/5">학기</th>
                <th className="py-3 px-4 w-1/5">신청학점</th>
                <th className="py-3 px-4 w-1/5">취득학점</th>
                <th className="py-3 px-4 w-1/5">평균평점</th>
              </tr>
            </thead>
            <tbody className="text-center text-gray-700">
              <tr className="hover:bg-gray-50 border-t">
                <td className="py-2 px-4 w-1/5">{record.semester.year}</td>
                <td className="py-2 px-4 w-1/5">{record.semester.term === "FIRST" ? "1" : "2"}</td>
                <td className="py-2 px-4 w-1/5">{record.enrolled ?? "-"}</td>
                <td className="py-2 px-4 w-1/5">{record.earned ?? "-"}</td>
                <td className="py-2 px-4 w-1/5">{record.gpa?.toFixed(2) ?? "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-white shadow-md rounded-md p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">과목별 성적</h2>

        {record && (
          <div className="flex items-center gap-2 text-gray-600 text-base mb-6">
            <span className="text-gray-500">📅</span>
            <span className="font-semibold">
              {record.semester.year}년 {record.semester.term === "FIRST" ? "1학기" : "2학기"}
            </span>
          </div>
        )}

        {message && (
          <div className="text-red-500 text-center font-medium mb-6">{message}</div>
        )}

        <table className="min-w-full table-auto border border-gray-200 rounded-md text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
            <tr className="text-center">
              <th className="py-3 px-4 w-1/5">과목명</th>
              <th className="py-3 px-4 w-1/5">구분</th>
              <th className="py-3 px-4 w-1/5">학점</th>
              <th className="py-3 px-4 w-1/5">등급</th>
              <th className="py-3 px-4 w-1/5">평점</th>
            </tr>
          </thead>
          <tbody className="text-center text-gray-700">
            {grades.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-gray-400">조회할 성적이 없습니다.</td>
              </tr>
            ) : (
              grades.map((g, i) => (
                <tr key={i} className="hover:bg-gray-50 border-t">
                  <td className="py-2 px-4 w-1/5">{g.courseName}</td>
                  <td className="py-2 px-4 w-1/5">{g.courseType || "-"}</td>
                  <td className="py-2 px-4 w-1/5">{g.credit}</td>
                  <td className="py-2 px-4 w-1/5">{g.grade ? convertGradeLabel(g.grade) : "미등록"}</td>
                  <td className="py-2 px-4 w-1/5">{g.gradePoint?.toFixed(1) ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className={`fixed inset-0 backdrop-blur-sm bg-black/10 z-40 ${isModalOpen ? "block" : "hidden"}`}></div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <AlertModal
              isOpen={isModalOpen}
              message={alertMessage}
              onClose={handleClose}
              type="error"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GradePage;
