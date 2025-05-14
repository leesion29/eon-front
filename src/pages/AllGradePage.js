import "../../src/App.css"
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
      loadAllRecords();
    } else if (userId) {
      loadAllRecords();
    }
  }, [userId]);

  const loadAllRecords = async () => {
    try {
      const [recordsRes, totalRes] = await Promise.all([
        fetchAllStudentRecords(),
        fetchTotalRecord(),
      ]);
      setRecords(recordsRes.data);
      setTotalRecord(totalRes.data);
    } catch {
      setMessage("전체 성적 정보를 불러올 수 없습니다.");
    }
  };

  const handleSemesterClick = async (semesterId) => {
    setSelectedSemesterId(semesterId);
    try {
      const res = await fetchStudentGradesBySemester(semesterId);
      setGrades(res.data);
    } catch {
      setGrades([]);
      setMessage("선택한 학기의 과목별 성적을 불러올 수 없습니다.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10">
      {/* 전체 성적 테이블 */}
      <button onClick={() => reactToPrintFn()} className="float-right bg-gray-500 py-1 px-3 text-white rounded-md">🖨인쇄</button>
      <div ref={contentRef}>
      <div className="bg-white shadow-md rounded-md p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">전체 성적</h2>

        {message && (
          <div className="text-red-500 text-center font-medium mb-6">
            {message}
          </div>
        )}

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
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-gray-400">
                  조회할 성적이 없습니다.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr
                  key={r.recordId}
                  className={`hover:bg-gray-100 border-t cursor-pointer ${
                    selectedSemesterId === r.semester.id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => handleSemesterClick(r.semester?.id)}
                >
                  <td className="py-2 px-4 w-1/5">{r.semester.year}</td>
                  <td className="py-2 px-4 w-1/5">
                    {r.semester.term === "FIRST" ? "1" : "2"}
                  </td>
                  <td className="py-2 px-4 w-1/5">{r.enrolled ?? "-"}</td>
                  <td className="py-2 px-4 w-1/5">{r.earned ?? "-"}</td>
                  <td className="py-2 px-4 w-1/5">
                    {r.gpa?.toFixed(2) ?? "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* 총합 표시 (tfoot) */}
          {totalRecord && (
            <tfoot className="bg-gray-50 text-gray-700 text-sm">
              <tr className="text-center font-medium border-t">
                <td className="py-2 px-4 w-1/5"></td>
                <td className="py-2 px-4 w-1/5"></td>
                <td className="py-2 px-4 w-1/5"></td>
                <td className="py-2 px-4 w-1/5">
                  취득학점 합계:{" "}
                  <span className="font-bold">{totalRecord.totalEarned}</span>
                </td>
                <td className="py-2 px-4 w-1/5">
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

      {/* 과목별 성적 테이블 */}
      <div className="bg-white shadow-md rounded-md p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          과목별 성적
        </h2>

        {selectedSemesterId !== null && (
          <div className="flex items-center gap-2 text-gray-600 text-base mb-6">
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

        {selectedSemesterId === null ? (
          <div className="text-gray-400 text-center font-medium">
            위 성적 테이블에서 학기를 클릭하여 조회할 수 있습니다.
          </div>
        ) : grades.length === 0 ? (
          <div className="text-gray-400 text-center font-medium">
            선택한 학기의 과목별 성적이 없습니다.
          </div>
        ) : (
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
              {grades.map((g, i) => (
                <tr key={i} className="hover:bg-gray-50 border-t">
                  <td className="py-2 px-4 w-1/5">{g.courseName}</td>
                  <td className="py-2 px-4 w-1/5">{g.courseType || "-"}</td>
                  <td className="py-2 px-4 w-1/5">{g.credit}</td>
                  <td className="py-2 px-4 w-1/5">
                    {g.grade ? convertGradeLabel(g.grade) : "미등록"}
                  </td>
                  <td className="py-2 px-4 w-1/5">
                    {g.gradePoint?.toFixed(1) ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>
      </div>
    </div>
  );
};

export default AllGradePage;
