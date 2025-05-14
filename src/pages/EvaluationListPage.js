import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getList, getStatus } from "../api/evaluationAPI";
import AlertModal from "../components/AlertModal";

const EvaluationListPage = () => {
  const [courselist, setCourseList] = useState([]);
  const [evaluationStatus, setEvaluationStatus] = useState([]);
  const userId = useSelector((state) => state.auth?.userId);
  const navigate = useNavigate();
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  useEffect(() => {
    const fetchCourseList = async () => {
      const data = await getList(userId);
      setCourseList(data);
    };

    const fetchStatus = async () => {
      const data = await getStatus(userId);
      setEvaluationStatus(data);
    };
    fetchCourseList();
    fetchStatus();
  }, [userId]);

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white shadow-md rounded-md mt-10">
      <div className="flex justify-between items-center border-b pb-3 mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">강의 평가</h2>
      </div>

      <table className="min-w-full table-auto shadow-sm border border-gray-200 rounded-md text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
          <tr className="text-center">
            <th className="py-3 px-4"> 강의 번호</th>
            <th className="py-3 px-4">강의명</th>
            <th className="py-3 px-4">교수명</th>
            <th className="py-3 px-4">평가 여부</th>
            <th className="py-3 px-4">평가</th>
          </tr>
        </thead>
        <tbody className="text-center text-gray-700">
          {courselist.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-4 text-gray-400">
                평가할 강의가 없습니다.
              </td>
            </tr>
          ) : (
            courselist.map((course, i) => (
              <tr key={i} className="hover:bg-gray-50 border-t">
                <td className="py-2 px-4">{course.classId}</td>
                <td className="py-2 px-4">{course.courseName}</td>
                <td className="py-2 px-4">{course.professorName}</td>
                <td
                  className={
                    evaluationStatus?.some(
                      (e) =>
                        e.classId === course.classId && e.studentId === userId
                    )
                      ? "py-2 px-4 text-gray-400"
                      : "py-2 px-4 text-red-500"
                  }
                >
                  {evaluationStatus?.some(
                    (e) =>
                      e.classId === course.classId && e.studentId === userId
                  )
                    ? "평가됨"
                    : "평가되지 않음"}
                </td>

                <td className="py-2 px-4">
                  <button
                    className={
                      evaluationStatus?.some(
                        (e) =>
                          e.classId === course.classId && e.studentId === userId
                      )
                        ? "bg-gray-400 hover:gray-600 text-white text-sm font-semibold py-1 px-2 rounded transition"
                        : "bg-blue-500 hover:bg-blue-700 text-white text-sm font-semibold py-1 px-2 rounded transition"
                    }
                    onClick={() => {
                      const isAlreadyEvaluated = evaluationStatus?.some(
                        (e) =>
                          e.classId === course.classId && e.studentId === userId
                      );

                      if (isAlreadyEvaluated) {
                        setAlertModalOpen(true);
                        return;
                      }

                      navigate("/main/evaluation", {
                        state: {
                          name: course.courseName,
                          classId: course.classId,
                        },
                      });
                    }}
                  >
                    {evaluationStatus?.some(
                      (e) =>
                        e.classId === course.classId && e.studentId === userId
                    )
                      ? "완료"
                      : "평가"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <AlertModal
        isOpen={alertModalOpen}
        message={"이미 평가를 완료했습니다."}
        onClose={() => setAlertModalOpen(false)}
        type={"error"}
      />
    </div>
  );
};

export default EvaluationListPage;
