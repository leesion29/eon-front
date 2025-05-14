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

    fetchCourseList();
  }, [userId, classId]);

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white shadow-md rounded-md mt-10">
      <div className="flex justify-between items-center border-b pb-3 mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">
          강의 평가 데이터 리스트
        </h2>
      </div>

      <table className="min-w-full table-auto shadow-sm border border-gray-200 rounded-md text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
          <tr className="text-center">
            <th className="py-3 px-4"> No.</th>
            <th className="py-3 px-4">강의명</th>
            <th className="py-3 px-4">평가일</th>
          </tr>
        </thead>
        <tbody className="text-center text-gray-700">
          {evaluationList.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-4 text-gray-400">
                강의 평가 데이터가 없습니다.
              </td>
            </tr>
          ) : (
            evaluationList.map((evaluation, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50 border-t cursor-pointer"
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
                <td className="py-2 px-4">{i + 1}</td>
                <td className="py-2 px-4">{courseName}</td>
                <td className="py-2 px-4">
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
        className="text-blue-500 hover:text-blue-700 text-lg font-semibold px-3 pt-10 rounded transition"
      >
        ← 이전으로
      </button>
    </div>
  );
};

export default ProfessorEvaluationListPage;
