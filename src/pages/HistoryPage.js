import React, { useEffect, useState, useCallback } from "react";
import { getEnrolledCourses, deleteCourse } from "../api/enrollmentApi";
import { useDispatch, useSelector } from "react-redux";
import { showModal } from "../slices/modalSlice";
import { useNavigate } from "react-router-dom";
import { checkEnrollPeriod } from "../api/enrollmentApi";

const HistoryPage = () => {
  const [timetable, setTimetable] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth.userId);
  const [isClassRegPeriod, setIsClassRegPeriod] = useState(false);

  const fetchMyTimetable = useCallback(async () => {
    try {
      const response = await getEnrolledCourses(userId);
      console.log("response:", response);
      setTimetable(response.data);
    } catch (error) {
      console.error("수강 목록 조회 실패:", error);
      dispatch(showModal("수강 목록 조회 중 오류가 발생했습니다.", "error"));
    }
  }, [userId, dispatch]);

  useEffect(() => {
    if (userId) fetchMyTimetable();
  }, [userId, fetchMyTimetable]);

  const handleRemove = async (classId) => {
    try {
      await deleteCourse(userId, classId);
      dispatch(showModal("강의가 성공적으로 삭제되었습니다.", "success"));
      fetchMyTimetable();
    } catch (error) {
      console.error("수강 삭제 실패:", error);
      dispatch(showModal("강의 삭제 중 오류가 발생했습니다.", "error"));
    }
  };

  useEffect(() => {
    const checkPeriod = async () => {
      try {
        const isOpen = await checkEnrollPeriod();
        setIsClassRegPeriod(isOpen);
      } catch (e) {
        setIsClassRegPeriod(false);
      }
    };

    checkPeriod();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 bg-white shadow-md mt-6 rounded-md">
      <h2 className="text-3xl font-bold text-center mb-6"> 수강 신청 내역 </h2>

      {timetable.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-xl text-center font-semibold mb-6">
            {" "}
            📚 수강 목록 📚{" "}
          </h3>

          <table className="w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-center">
                <th className="border p-2">강의명</th>
                <th className="border p-2">요일</th>
                <th className="border p-2">교시</th>
                <th className="border p-2">학점</th>
                <th className="border p-2">교수</th>
                {isClassRegPeriod && <th className="border p-2">삭제</th>}
              </tr>
            </thead>

            <tbody>
              {timetable.map((course) => (
                <tr key={course.강의번호} className="text-center">
                  <td className="border p-2">{course.courseName}</td>
                  <td className="border p-2">{course.classDay}</td>
                  <td className="border p-2">
                    {course.classStartPeriod} ~ {course.classEndPeriod}
                  </td>
                  <td className="border p-2">{course.classCredit || "N/A"}</td>
                  <td className="border p-2">{course.professorName}</td>
                  {isClassRegPeriod && (
                    <td className="border p-2">
                      <button
                        onClick={() => handleRemove(course.강의번호)}
                        className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        삭제 🗑️
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">수강 목록이 없습니다.</p>
      )}
    </div>
  );
};

export default HistoryPage;
