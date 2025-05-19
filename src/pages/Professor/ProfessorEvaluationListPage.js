import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { findProfessorLectureList } from "../../api/evaluationAPI";

/* 강의 평가 데이터 리스트 페이지(evaluationlist) - 강의 평가 내역을 보여주는 페이지*/
const ProfessorEvaluationListPage = () => {
  const [evaluationList, setEvaluationList] = useState([]);
  const navigate = useNavigate();

  const { state } = useLocation();
  const userId = useSelector((state) => state.auth?.userId);
  const courseName = state.courseName;
  const classId = state.classId;

  // 날짜 포맷팅
  const formatingDate = (date) => {
    const formatedDate = date.substring(0, 10).split("-");
    const formatedTime = date.substring(11, 16).split(":");
    return (
      formatedDate[0] +
      "년 " +
      formatedDate[1] +
      "월 " +
      formatedDate[2] +
      "일 " +
      formatedTime[0] +
      "시 " +
      formatedTime[1] +
      "분"
    );
  };

  useEffect(() => {
    const fetchCourseList = async () => {
      const data = await findProfessorLectureList();
      const filtereddata = data.filter(function (c) {
        return c.classId === classId;
      });
      setEvaluationList(filtereddata);
    };

    if (classId) {
      fetchCourseList();
    }
  }, [userId, classId]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 bg-white shadow-md rounded-md mt-6 sm:mt-10">
      <div className="flex justify-between items-center border-b pb-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">
          강의 평가 데이터 리스트
        </h2>
      </div>

      <table className="w-full text-sm table-auto shadow-sm sm:border border-gray-200 rounded-md">
        <thead className="hidden sm:table-header-group bg-gray-50 text-gray-600 uppercase text-xs sm:text-sm leading-normal">
          <tr className="text-center border border-gray-200">
            <th className="py-3 px-4"> No.</th>
            <th className="py-3 px-4">강의명</th>
            <th className="py-3 px-4">평가일</th>
          </tr>
        </thead>
        <tbody className="block sm:table-row-group text-gray-700 sm:text-center">
          {evaluationList.length === 0 ? (
            <tr className="block sm:table-row">
              <td
                colSpan={3}
                className="py-4 text-center text-gray-400 block sm:table-cell"
              >
                강의 평가 데이터가 없습니다.
              </td>
            </tr>
          ) : (
            evaluationList.map((evaluation, i) => (
              <tr
                key={i}
                className="block p-3 mb-3 border rounded-md shadow-sm sm:table-row sm:p-0 sm:mb-0 sm:border-0 sm:shadow-none hover:bg-gray-50 sm:border-t cursor-pointer"
                onClick={() => {
                  navigate("/main/professor/evaluationdata", {
                    state: {
                      evaluationId: evaluation.evaluationId,
                      courseName: courseName,
                      classId: classId,
                      num: i,
                    },
                  });
                }}
              >
                <td className="block text-left py-1 sm:py-2 px-1 sm:px-4 sm:table-cell sm:text-center font-extrabold text-lg text-blue-800 sm:text-black sm:text-sm sm:font-normal">
                  <span className="sm:hidden">No. </span>
                  {i + 1}
                <hr className="sm:hidden"/>
                </td>
                <td className="block text-left py-1 sm:py-2 px-1 sm:px-4 sm:table-cell sm:text-center whitespace-normal break-words">
                  <span className="font-semibold sm:hidden">강의명: </span>
                  {courseName}
                </td>
                <td className="block text-left py-1 sm:py-2 px-1 sm:px-4 sm:table-cell sm:text-center">
                  <span className="font-semibold sm:hidden">평가일: </span>
                  {formatingDate(evaluation.createdAt)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <button
        onClick={() => {
          navigate("/main/professor/list");
        }}
        className="text-blue-500 hover:text-blue-700 text-base sm:text-lg font-semibold px-2 sm:px-3 pt-6 sm:pt-10 rounded transition"
      >
        ← 이전으로
      </button>
    </div>
  );
};

export default ProfessorEvaluationListPage;
