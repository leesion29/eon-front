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
    if (!userId) return; 
    const fetchCourseList = async () => {
      try {
        const data = await getList(userId);
        setCourseList(data);
      } catch (error) {
        console.error("강의 목록 조회 실패:", error);
        setCourseList([]); 
      }
    };

    const fetchStatus = async () => {
      try {
        const data = await getStatus(userId);
        setEvaluationStatus(data);
      } catch (error) {
        console.error("평가 상태 조회 실패:", error);
        setEvaluationStatus([]);
      }
    };
    fetchCourseList();
    fetchStatus();
  }, [userId]);

  return (
    <div className="max-w-7xl mx-auto p-3 md:p-8 bg-white shadow-md rounded-md mt-6 md:mt-10">
      <div className="flex justify-between items-center border-b pb-3 mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-700">강의 평가</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full w-full table-auto shadow-sm border border-gray-200 rounded-md text-[10px] md:text-sm">
          <colgroup>
            <col className="w-[15%] md:w-[15%]" /> 
            <col className="w-[30%] md:w-auto" /> 
            <col className="w-[20%] md:w-[20%]" /> 
            <col className="w-[20%] md:w-[15%]" /> 
            <col className="w-[15%] md:w-[10%]" /> 
          </colgroup>
          <thead className="bg-gray-50 text-gray-600 uppercase text-[9px] md:text-sm leading-normal">
            <tr className="text-center">
              <th className="py-2 px-1 md:py-3 md:px-4">강의 번호</th>
              <th className="py-2 px-1 md:py-3 md:px-4">강의명</th>
              <th className="py-2 px-1 md:py-3 md:px-4">교수명</th>
              <th className="py-2 px-1 md:py-3 md:px-4">평가 여부</th>
              <th className="py-2 px-1 md:py-3 md:px-4">평가</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {courselist.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-400 text-xs md:text-sm">
                  평가할 강의가 없습니다.
                </td>
              </tr>
            ) : (
              courselist.map((course, i) => (
                <tr key={i} className="hover:bg-gray-50 border-t text-center">
                  <td className="py-1.5 px-1 md:py-2 md:px-4 align-middle">{course.classId}</td>
                  <td className="py-1.5 px-1 md:py-2 md:px-4 align-middle text-left md:text-center break-words">{course.courseName}</td>
                  <td className="py-1.5 px-1 md:py-2 md:px-4 align-middle text-left md:text-center break-words">{course.professorName}</td>
                  <td
                    className={`py-1.5 px-1 md:py-2 md:px-4 align-middle whitespace-nowrap ${
                      evaluationStatus?.some(
                        (e) =>
                          e.classId === course.classId && e.studentId === userId
                      )
                        ? "text-gray-400"
                        : "text-red-500"
                    }`}
                  >
                    {evaluationStatus?.some(
                      (e) =>
                        e.classId === course.classId && e.studentId === userId
                    )
                      ? "평가됨"
                      : "평가되지 않음"}
                  </td>
                  <td className="py-1.5 px-1 md:py-2 md:px-4 align-middle">
                    <button
                      className={`text-white text-[10px] md:text-sm font-semibold py-1 px-1.5 md:px-2 rounded transition whitespace-nowrap ${
                        evaluationStatus?.some(
                          (e) =>
                            e.classId === course.classId && e.studentId === userId
                        )
                          ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-700"
                      }`}
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
                      disabled={evaluationStatus?.some( // 평가된 경우 버튼 비활성화
                        (e) =>
                          e.classId === course.classId && e.studentId === userId
                      )}
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
      </div>
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