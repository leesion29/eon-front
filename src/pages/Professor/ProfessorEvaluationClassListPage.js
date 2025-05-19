import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserId } from "../../slices/authSlice";
import { showModal } from "../../slices/modalSlice";
import PageComponent from "../../components/PageComponent";
import { getMyClasses } from "../../api/professorClassApi";
import { findProfessorLectureList } from "../../api/evaluationAPI";

const ProfessorEvaluationClassListPage = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.userId);
  const [status, setStatus] = useState([]);
  const [classes, setClasses] = useState({
    dtoList: [],
    totalPage: 0,
    current: 1,
    totalCount: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const sortResData = (classesData) => {
    let data = classesData.dtoList;

    data.sort(function (a, b) {
      const yearA = parseInt(a.semester.substring(0, 4));
      const yearB = parseInt(b.semester.substring(0, 4));
      if (yearA !== yearB) return yearB - yearA;
      const termA = parseInt(a.semester.substring(5, 6));
      const termB = parseInt(b.semester.substring(5, 6));
      if (termA !== termB) return termA - termB;
      return a.courseYear - b.courseYear;
    });

    return {
      ...classesData,
      dtoList: data,
    };
  };

  useEffect(() => {
    const localId = localStorage.getItem("id");
    if (!userId && localId) {
      dispatch(setUserId(localId));
    }
  }, [userId, dispatch]);

  const fetchClasses = async (page = 1) => {
    try {
      const semesterId = null;
      const res = await getMyClasses(page, 10, "id", "asc", semesterId);
      setClasses(sortResData(res.data));
      setCurrentPage(page);
    } catch (err) {
      dispatch(
        showModal({
          message: "강의 목록을 불러오지 못했습니다.",
          type: "error",
        })
      );
      console.log(err);
    }
  };

  const fetchStatus = async () => {
    const data = await findProfessorLectureList();
    setStatus(data);
  };

  useEffect(() => {
    if (userId) {
      fetchClasses(1);
      fetchStatus();
    }
  }, [userId]);

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 md:p-8 bg-white shadow-md rounded-md mt-4 sm:mt-6 md:mt-10">
      <div className="border-b pb-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">
          강의 평가 조회
        </h2>
      </div>

      <div className="w-full">
        <table className="w-full border-collapse sm:table-auto sm:shadow-sm sm:border sm:border-gray-200 sm:rounded-md">
          <thead className="hidden sm:table-header-group bg-gray-50 text-gray-600 uppercase text-xs leading-normal">
            <tr>
              <th className="py-3 px-4 text-center">번호</th>
              <th className="py-3 px-4 text-center">과목명</th>
              <th className="py-3 px-4 text-center">구분</th>
              <th className="py-3 px-4 text-center">학년</th>
              <th className="py-3 px-4 text-center">학기</th>
              <th className="py-3 px-4 text-center">상태</th>
            </tr>
          </thead>
          <tbody className="block sm:table-row-group text-gray-700">
            {classes.dtoList.length === 0 ? (
              <tr className="block sm:table-row">
                <td className="block sm:table-cell sm:col-span-6 py-6 text-center text-gray-400 text-xs sm:text-sm">
                  해당하는 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              classes.dtoList.map((c) => (
                <tr
                  key={c.classId}
                  className="block sm:table-row mb-4 sm:mb-0 p-3 sm:p-0 border sm:border-b sm:border-solid sm:border-gray-200 rounded-lg sm:rounded-none shadow-md sm:shadow-none hover:bg-gray-50 sm:hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    navigate("/main/professor/evaluationlist", {
                      state: { courseName: c.courseName, classId: c.classId },
                    });
                  }}
                >
                    <td data-label="번호" className="hidden text-xs text-gray-600 pt-0.5 pb-0.5 sm:table-cell sm:py-3 sm:px-4 sm:text-center sm:text-sm sm:text-gray-700">
                    <span className="font-medium sm:hidden mr-2"></span>
                    {c.classId}
                  </td>
                  <td data-label="과목명" className="block text-xs text-gray-600 pt-1 pb-0.5 sm:table-cell sm:py-3 sm:px-4 sm:text-center sm:text-sm sm:font-normal sm:text-gray-700">
                    <span className="font-bold sm:hidden mr-2 text-blue-800 text-lg ">{c.classId}</span><span className="sm:font-normal font-semibold text-sm">{c.courseName}</span>
                    <hr className="sm:hidden"/>
                  </td>
                  <td data-label="구분" className="block text-xs text-gray-600 pt-1 pb-0.5 sm:table-cell sm:py-3 sm:px-4 sm:text-center sm:text-sm sm:text-gray-700">
                    <span className="font-medium sm:hidden mr-2">구분:</span>
                    {c.courseType === "MAJOR" ? "전공" : "교양"}
                  </td>
                  <td data-label="학년" className="block text-xs text-gray-600 pt-0.5 pb-0.5 sm:table-cell sm:py-3 sm:px-4 sm:text-center sm:text-sm sm:text-gray-700">
                    <span className="font-medium sm:hidden mr-2">학년:</span>
                    {c.courseYear}학년
                  </td>
                  <td data-label="학기" className="block text-xs text-gray-600 pt-0.5 pb-0.5 sm:table-cell sm:py-3 sm:px-4 sm:text-center sm:text-sm sm:text-gray-700">
                    <span className="font-medium sm:hidden mr-2">학기:</span>
                    {c.semester}
                  </td>
                  <td data-label="상태" className={`block text-xs pt-0.5 pb-0.5 sm:table-cell sm:py-3 sm:px-4 sm:text-center sm:text-sm ${
                      status?.some((e) => e.classId === c.classId)
                        ? "text-gray-400" // 모바일/웹 모두 "기재됨"은 회색(gray-500)
                        : "text-red-500 font-semibold sm:font-normal sm:text-red-500" // "미기재"는 모바일/웹 모두 빨간색, 웹에서는 font-normal
                    }`}
                  >
                    <span className="font-medium sm:hidden mr-2 text-gray-600">상태:</span>
                    {status?.some((e) => e.classId === c.classId)
                      ? "기재됨"
                      : "미기재"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PageComponent
        currentPage={classes.current}
        totalPage={classes.totalPage}
        onPageChange={(page) => fetchClasses(page)}
      />
    </div>
  );
};

export default ProfessorEvaluationClassListPage;