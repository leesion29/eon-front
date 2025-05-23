import "../../src/App.css";
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUserId as setUserIdAction } from "../slices/authSlice";
import {
  fetchAllStudentRecords,
  fetchStudentGradesBySemester,
  fetchTotalRecord,
} from "../api/studentGradeApi";
import { convertGradeLabel } from "../util/gradeUtil";
import { useReactToPrint } from "react-to-print";

const AllGradePage = () => {
  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.userId);

  const [records, setRecords] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  const [message, setMessage] = useState("");
  const [totalRecord, setTotalRecord] = useState(null);

  useEffect(() => {
    const localId = localStorage.getItem("id");
    if (!userId && localId) {
      dispatch(setUserIdAction(localId));
    } else if (userId) {
      loadAllRecords();
    }
  }, [userId, dispatch]);
  const loadAllRecords = async () => {
    try {
      const [recordsRes, totalRes] = await Promise.all([
        fetchAllStudentRecords(),
        fetchTotalRecord(),
      ]);
      setRecords(recordsRes.data);
      setTotalRecord(totalRes.data);
      setMessage("");
    } catch {
      setMessage("전체 성적 정보를 불러올 수 없습니다.");
      setRecords([]);
      setTotalRecord(null);
    }
  };

  const handleSemesterClick = async (semesterId) => {
    setSelectedSemesterId(semesterId);
    try {
      const res = await fetchStudentGradesBySemester(semesterId);
      setGrades(res.data);
      setMessage("");
    } catch {
      setGrades([]);
      setMessage("선택한 학기의 과목별 성적을 불러올 수 없습니다.");
    }
  };

  return (
    <div className="w-full sm:w-4/5 mx-auto mt-4 sm:mt-6 md:mt-10 px-2 sm:px-0">
      <div ref={contentRef} className="space-y-6 sm:space-y-8">

        <div className="w-full mx-auto bg-white shadow-md rounded-md p-4 md:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-3 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2 sm:mb-0">
              전체 성적
            </h2>
            <button
              onClick={() => reactToPrintFn()}
              className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition text-sm font-medium"
            >
              🖨 인쇄
            </button>
          </div>

          {message && records.length === 0 && (
            <p className="py-4 text-center text-red-500 font-medium">
              {message}
            </p>
          )}


          <div className="md:hidden space-y-3">
            {records.length === 0 && !message ? (
              <p className="py-4 text-center text-gray-400">
                조회할 성적이 없습니다.
              </p>
            ) : (
              records.map((r) => (
                <div
                  key={`${r.recordId}-mobile`}
                  className={`py-3 border rounded-md p-3 cursor-pointer hover:bg-gray-50 ${
                    selectedSemesterId === r.semester.id ? "bg-gray-100 ring-2 ring-blue-500" : "border-gray-200"
                  }`}
                  onClick={() => handleSemesterClick(r.semester?.id)}
                >
                  <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                    <span className="font-medium text-gray-500 text-xs col-span-1">연도:</span>
                    <span className="text-xs text-gray-800 col-span-2">{r.semester.year}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                    <span className="font-medium text-gray-500 text-xs col-span-1">학기:</span>
                    <span className="text-xs text-gray-800 col-span-2">{r.semester.term === "FIRST" ? "1" : "2"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                    <span className="font-medium text-gray-500 text-xs col-span-1">신청학점:</span>
                    <span className="text-xs text-gray-800 col-span-2">{r.enrolled ?? "-"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                    <span className="font-medium text-gray-500 text-xs col-span-1">취득학점:</span>
                    <span className="text-xs text-gray-800 col-span-2">{r.earned ?? "-"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 items-center">
                    <span className="font-medium text-gray-500 text-xs col-span-1">평균평점:</span>
                    <span className="text-xs text-gray-800 col-span-2">{r.gpa?.toFixed(2) ?? "-"}</span>
                  </div>
                </div>
              ))
            )}
            {totalRecord && records.length > 0 && (
              <div className="mt-4 pt-3 border-t text-xs text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">취득학점 합계:</span>
                  <span className="font-bold">{totalRecord.totalEarned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-500">전체 평균평점:</span>
                  <span className="font-bold">{totalRecord.totalGpa?.toFixed(2)}</span>
                </div>
              </div>
            )}
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
                {records.length === 0 && !message ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-gray-400">
                      조회할 성적이 없습니다.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr
                      key={r.recordId}
                      className={`hover:bg-gray-50 border-t cursor-pointer ${
                        selectedSemesterId === r.semester.id ? "bg-gray-100" : ""
                      }`}
                      onClick={() => handleSemesterClick(r.semester?.id)}
                    >
                      <td className="py-2 px-4">{r.semester.year}</td>
                      <td className="py-2 px-4">
                        {r.semester.term === "FIRST" ? "1" : "2"}
                      </td>
                      <td className="py-2 px-4">{r.enrolled ?? "-"}</td>
                      <td className="py-2 px-4">{r.earned ?? "-"}</td>
                      <td className="py-2 px-4">
                        {r.gpa?.toFixed(2) ?? "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {totalRecord && records.length > 0 && (
                <tfoot className="bg-gray-50 text-gray-700 text-sm">
                  <tr className="text-center font-medium border-t">
                    <td className="py-2 px-4"></td>
                    <td className="py-2 px-4"></td>
                    <td className="py-2 px-4 font-normal text-gray-600 uppercase">총계</td>
                    <td className="py-2 px-4">
                      취득학점 합계:{" "}
                      <span className="font-bold">{totalRecord.totalEarned}</span>
                    </td>
                    <td className="py-2 px-4">
                      전체 평균평점:{" "}
                      <span className="font-bold">
                        {totalRecord.totalGpa?.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        <div className="w-full mx-auto bg-white shadow-md rounded-md p-4 md:p-6 lg:p-8">
          <div className="border-b pb-3 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2 sm:mb-0">
              과목별 성적
            </h2>
            {selectedSemesterId !== null && (
              <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm md:text-base mt-2">
                <span className="text-gray-500">📅</span>
                <span className="font-semibold">
                  {
                    records.find((r) => r.semester.id === selectedSemesterId)
                      ?.semester.year
                  }
                  년{" "}
                  {records.find((r) => r.semester.id === selectedSemesterId)
                    ?.semester.term === "FIRST"
                    ? "1학기"
                    : "2학기"}
                </span>
              </div>
            )}
          </div>
          
          {message && selectedSemesterId !== null && grades.length === 0 && ( 
             <p className="py-4 text-center text-red-500 font-medium">
              {message}
            </p>
          )}

          {selectedSemesterId === null ? (
            <p className="py-4 text-center text-gray-400">
              위 성적 테이블에서 학기를 클릭하여 조회할 수 있습니다.
            </p>
          ) : grades.length === 0 && !message ? ( 
            <p className="py-4 text-center text-gray-400">
              선택한 학기의 과목별 성적이 없습니다.
            </p>
          ) : grades.length > 0 ? (
            <>

              <div className="md:hidden space-y-3">
                {grades.map((g, i) => (
                  <div key={`${g.courseName}-${i}-mobile`} className="py-3 border rounded-md p-3 border-gray-200">
                    <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                      <span className="font-medium text-gray-500 text-xs col-span-1">과목명:</span>
                      <span className="text-xs text-gray-800 col-span-2 break-all">{g.courseName}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                      <span className="font-medium text-gray-500 text-xs col-span-1">구분:</span>
                      <span className="text-xs text-gray-800 col-span-2">{g.courseType || "-"}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                      <span className="font-medium text-gray-500 text-xs col-span-1">학점:</span>
                      <span className="text-xs text-gray-800 col-span-2">{g.credit}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                      <span className="font-medium text-gray-500 text-xs col-span-1">등급:</span>
                      <span className="text-xs text-gray-800 col-span-2">{g.grade ? convertGradeLabel(g.grade) : "미등록"}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 items-center">
                      <span className="font-medium text-gray-500 text-xs col-span-1">평점:</span>
                      <span className="text-xs text-gray-800 col-span-2">{g.gradePoint?.toFixed(1) ?? "-"}</span>
                    </div>
                  </div>
                ))}
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
                    {grades.map((g, i) => (
                      <tr key={`${g.courseName}-${i}`} className="hover:bg-gray-50 border-t">
                        <td className="py-2 px-4">{g.courseName}</td>
                        <td className="py-2 px-4">{g.courseType || "-"}</td>
                        <td className="py-2 px-4">{g.credit}</td>
                        <td className="py-2 px-4">
                          {g.grade ? convertGradeLabel(g.grade) : "미등록"}
                        </td>
                        <td className="py-2 px-4">
                          {g.gradePoint?.toFixed(1) ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AllGradePage;