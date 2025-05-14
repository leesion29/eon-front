import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUserId } from "../../slices/authSlice";
import { showModal } from "../../slices/modalSlice";
import PageComponent from "../../components/PageComponent";
import { getMyClasses } from "../../api/professorClassApi";
import { findProfessorLectureList } from "../../api/evaluationAPI";

/* 강의 평가 조회 페이지(list) - 평가 내용을 볼 과목의 리스트를 조회 */
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

  // 데이터를 보기 좋게 정렬
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
    <div className="max-w-7xl mx-auto p-8 bg-white shadow-md rounded-md mt-10">
      <div className="flex justify-between items-center border-b pb-3 mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">강의 평가 조회</h2>
      </div>

      <table className="min-w-full table-auto shadow-sm border border-gray-200 rounded-md">
        <thead className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
          <tr>
            <th className="py-3 px-4">번호</th>
            <th className="py-3 px-4">과목명</th>
            <th className="py-3 px-4">구분</th>
            <th className="py-3 px-4">학년</th>
            <th className="py-3 px-4">학기</th>
            <th className="py-3 px-4">상태</th>
          </tr>
        </thead>
        <tbody className="text-gray-700 text-sm text-center">
          {classes.dtoList.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-6 text-gray-400">
                해당하는 데이터가 없습니다.
              </td>
            </tr>
          ) : (
            classes.dtoList.map((c) => (
              <tr
                key={c.classId}
                className="hover:bg-gray-100 border-b cursor-pointer"
                onClick={() => {
                  navigate("/main/professor/evaluationlist", {
                    state: { courseName: c.courseName, classId: c.classId },
                  });
                }}
              >
                <td className="py-3 px-4">{c.classId}</td>
                <td className="py-3 px-4">{c.courseName}</td>
                <td className="py-3 px-4">
                  {c.courseType === "MAJOR" ? "전공" : "교양"}
                </td>
                <td className="py-3 px-4">{c.courseYear}학년</td>
                <td className="py-3 px-4">{c.semester}</td>
                <td
                  className={
                    status?.some((e) => e.classId === c.classId)
                      ? "py-2 px-4 text-gray-400"
                      : "py-2 px-4 text-red-400"
                  }
                >
                  {status?.some((e) => e.classId === c.classId)
                    ? "기재됨"
                    : "미기재"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <PageComponent
        currentPage={classes.current}
        totalPage={classes.totalPage}
        onPageChange={(page) => fetchClasses(page)}
      />
    </div>
  );
};

export default ProfessorEvaluationClassListPage;
