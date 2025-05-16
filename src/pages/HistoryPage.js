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
    if (!userId) return;
    try {
      const response = await getEnrolledCourses(userId);
      setTimetable(response.data);
    } catch (error) {
      console.error("수강 목록 조회 실패:", error);
      dispatch(showModal({message: "수강 목록 조회 중 오류가 발생했습니다.", type: "error"}));
      setTimetable([]);
    }
  }, [userId, dispatch]);

  useEffect(() => {
    if (userId) fetchMyTimetable();
  }, [userId, fetchMyTimetable]);

  const handleRemove = async (classId) => {
    try {
      await deleteCourse(userId, classId);
      dispatch(showModal({message: "강의가 성공적으로 삭제되었습니다.", type: "success"}));
      fetchMyTimetable();
    } catch (error) {
      console.error("수강 삭제 실패:", error);
      dispatch(showModal({message: "강의 삭제 중 오류가 발생했습니다.", type: "error"}));
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
    <div className="max-w-5xl mx-auto p-3 md:p-4 bg-white shadow-md mt-4 md:mt-6 rounded-md">
      <h2 className="text-xl md:text-3xl font-bold text-center mb-4 md:mb-6"> 수강 신청 내역 </h2>

      {timetable.length > 0 ? (
        <div className="mt-4 md:mt-6">
          <h3 className="text-lg md:text-xl text-center font-semibold mb-4 md:mb-6">
            {" "}
            📚 수강 목록 📚{" "}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full w-full border border-gray-300 table-auto text-[10px] md:text-sm">
              <colgroup>
                <col className="w-auto md:w-auto" /> {/* 강의명 */}
                <col className="w-[12%] md:w-[10%]" />  {/* 요일 */}
                <col className="w-[15%] md:w-[12%]" />  {/* 교시 */}
                <col className="w-[10%] md:w-[10%]" />  {/* 학점 */}
                <col className="w-[20%] md:w-auto" /> {/* 교수 */}
                {isClassRegPeriod && <col className="w-[13%] md:w-[10%]" />} {/* 삭제 */}
              </colgroup>
              <thead className="text-[9px] md:text-xs uppercase">
                <tr className="bg-gray-100 text-center">
                  <th className="border p-1 md:p-2">강의명</th>
                  <th className="border p-1 md:p-2">요일</th>
                  <th className="border p-1 md:p-2">교시</th>
                  <th className="border p-1 md:p-2">학점</th>
                  <th className="border p-1 md:p-2">교수</th>
                  {isClassRegPeriod && <th className="border p-1 md:p-2">삭제</th>}
                </tr>
              </thead>

              <tbody className="text-gray-700">
                {timetable.map((course) => (
                  <tr key={course.classId || course.강의번호} className="text-center hover:bg-gray-50 border-t">
                    <td className="border p-1 md:p-2 align-middle text-left md:text-center break-words">{course.courseName}</td>
                    <td className="border p-1 md:p-2 align-middle whitespace-nowrap">{course.classDay}</td>
                    <td className="border p-1 md:p-2 align-middle whitespace-nowrap">
                      {`${course.classStartPeriod}~${course.classEndPeriod}`}
                    </td>
                    <td className="border p-1 md:p-2 align-middle whitespace-nowrap">{course.classCredit || "N/A"}</td>
                    <td className="border p-1 md:p-2 align-middle text-left md:text-center break-words">{course.professorName}</td>
                    {isClassRegPeriod && (
                      <td className="border p-1 md:p-2 align-middle">
                        <button
                          onClick={() => handleRemove(course.classId || course.강의번호)}
                          className="bg-red-500 hover:bg-red-700 text-white px-2 py-0.5 md:px-3 md:py-1 rounded text-[9px] md:text-sm whitespace-nowrap"
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
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10 text-xs md:text-sm">수강 목록이 없습니다.</p>
      )}
    </div>
  );
};

export default HistoryPage;