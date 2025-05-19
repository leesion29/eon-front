import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyClasses } from "../../api/professorClassApi";
import {
  getGradesByClass,
  registerGrade,
  updateGrade,
  deleteGrade,
  isGradeScheduleOpen,
} from "../../api/professorGradeApi";
import { getAllSemesters } from "../../api/adminScheduleApi";
import PageComponent from "../../components/PageComponent";
import { showModal } from "../../slices/modalSlice";

const ProfessorGradePage = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.userId);
  const [isSearched, setIsSearched] = useState(false);
  const [isGradeRegPeriod, setIsGradeRegPeriod] = useState(false);

  const [semesterList, setSemesterList] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const [gradePage, setGradePage] = useState({
    dtoList: [],
    totalPage: 0,
    current: 1,
    totalCount: 0,
  });
  const [grades, setGrades] = useState([]);
  const [newGrades, setNewGrades] = useState({});

  const gradeMap = {
    A_PLUS: "A+",
    A0: "A",
    B_PLUS: "B+",
    B0: "B",
    C_PLUS: "C+",
    C0: "C",
    D_PLUS: "D+",
    D0: "D",
    F: "F",
  };

  useEffect(() => {
    getAllSemesters()
      .then((res) => setSemesterList(res.data))
      .catch(() => setSemesterList([]));

    isGradeScheduleOpen()
      .then((res) => setIsGradeRegPeriod(res.data))
      .catch(() => setIsGradeRegPeriod(false));
  }, []);

  const fetchClasses = async (semesterId) => {
    try {
      const res = await getMyClasses(1, 100, "id", "asc", semesterId);
      setClasses(res.data.dtoList);
      setSelectedClassId(null);
      setGrades([]);
      setIsSearched(false);
    } catch {
      setClasses([]);
    }
  };

  const handleSearch = () => {
    if (selectedClassId) {
      fetchGrades(selectedClassId);
      setIsSearched(true);
    } else {
      dispatch(showModal({ message: "강의를 선택해주세요.", type: "error" }));
      setGrades([]);
      setIsSearched(false);
    }
  };

  const fetchGrades = async (classId, page = 1, retry = false) => {
    try {
      const res = await getGradesByClass(classId, page);
      const data = res.data;

      if (
        data.dtoList.length === 0 &&
        data.totalCount > 0 &&
        !retry &&
        page > 1
      ) {
        return fetchGrades(classId, 1, true);
      }

      setGradePage(data);
      setGrades(data.dtoList);
    } catch {
      dispatch(
        showModal({
          message: "성적 조회에 실패했습니다.",
          type: "error",
        })
      );
      setGrades([]);
    }
  };

  const handleGradeChange = (studentId, value) => {
    setNewGrades((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleRegisterOrUpdate = async (studentId, enrollmentId, gradeId) => {
    const gradeValue = newGrades[studentId];
    if (!gradeValue)
      return dispatch(
        showModal({ message: "성적을 선택해주세요.", type: "error" })
      );

    try {
      const dto = { enrollmentId, grade: gradeValue };
      gradeId ? await updateGrade(dto) : await registerGrade(dto);
      dispatch(showModal(gradeId ? "성적 수정 완료" : "성적 등록 완료"));
      fetchGrades(selectedClassId, gradePage.current);
      setNewGrades((prev) => ({ ...prev, [studentId]: "" }));
    } catch {
      dispatch(
        showModal({ message: "성적 등록/수정에 실패했습니다.", type: "error" })
      );
    }
  };

  const handleDelete = async (gradeId) => {
    try {
      await deleteGrade(gradeId);
      dispatch(showModal("성적 초기화 완료"));
      fetchGrades(selectedClassId, gradePage.current);
    } catch {
      dispatch(showModal({ message: "성적 초기화 실패", type: "error" }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 bg-white shadow-md rounded-md mt-6 sm:mt-10">
      <div className="flex justify-between items-center border-b pb-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">
          성적 관리
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <select
          value={selectedSemesterId || ""}
          onChange={(e) => {
            const semId = e.target.value;
            setSelectedSemesterId(semId);
            if (semId) {
              fetchClasses(semId);
            } else {
              setClasses([]);
              setSelectedClassId(null);
              setGrades([]);
              setIsSearched(false);
            }
          }}
          className="px-3 py-2 w-full sm:w-64 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        >
          <option value="">학기 선택</option>
          {semesterList.map((s) => (
            <option key={s.semesterId} value={s.semesterId}>
              {s.year}년 {s.term === "FIRST" ? "1" : "2"}학기
            </option>
          ))}
        </select>

        <select
          value={selectedClassId || ""}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="px-3 py-2 w-full sm:w-64 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          disabled={!selectedSemesterId || classes.length === 0}
        >
          <option value="">강의 선택</option>
          {classes.map((c) => (
            <option key={c.classId} value={c.classId}>
              {c.courseName}
            </option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          disabled={!selectedClassId}
        >
          검색
        </button>
      </div>

      <table className="w-full text-sm min-w-full sm:table-auto sm:shadow-sm sm:border sm:border-gray-200 sm:rounded-md">
        <thead className="hidden sm:table-header-group bg-gray-50 text-gray-600 uppercase text-xs sm:text-sm leading-normal">
          <tr className="text-center">
            <th className="py-3 px-4">학번</th>
            <th className="py-3 px-4">이름</th>
            <th className="py-3 px-4">과목명</th>
            <th className="py-3 px-4">학점</th>
            <th className="py-3 px-4">성적</th>
            {grades.length > 0 &&
              grades[0]?.isCurrentSemester &&
              isGradeRegPeriod && (
                <>
                  <th className="py-3 px-4">입력</th>
                  <th className="py-3 px-4">관리</th>
                </>
              )}
          </tr>
        </thead>
        <tbody className="block sm:table-row-group text-gray-700 sm:text-center">
          {grades.length === 0 ? (
            <tr className="block sm:table-row">
              <td
                colSpan={
                  grades.length > 0 &&
                  grades[0]?.isCurrentSemester &&
                  isGradeRegPeriod
                    ? 7
                    : 5
                }
                className="block sm:table-cell py-4 text-center text-gray-400"
              >
                {isSearched
                  ? "성적 정보가 없습니다."
                  : "학기와 강의를 선택 후 검색해주세요."}
              </td>
            </tr>
          ) : (
            grades.map((g) => (
              <tr
                key={g.studentId}
                className="block p-3 mb-3 border border-gray-200 rounded-md shadow-sm sm:table-row sm:p-0 sm:mb-0 sm:shadow-none sm:rounded-none sm:border-0 sm:border-t sm:hover:bg-gray-50"
              >
                <td className="sm:hidden block text-left py-1 px-1 sm:text-center sm:py-2 sm:px-4 whitespace-normal break-words">
                  <span className="text-blue-800 text-lg font-semibold">{g.studentName}({g.studentId})</span>
                  <hr/>
                </td>
                <td className="sm:table-cell text-left py-1 px-1 hidden sm:text-center sm:py-2 sm:px-4 whitespace-normal break-words">
                  <span className="font-semibold sm:hidden">학번: </span>
                  {g.studentId}
                </td>
                <td className="sm:table-cell text-left py-1 px-1 hidden sm:text-center sm:py-2 sm:px-4 whitespace-normal break-words">
                  <span className="font-semibold sm:hidden">이름: </span>
                  {g.studentName}
                </td>
                <td className="block text-left py-1 px-1 sm:table-cell sm:text-center sm:py-2 sm:px-4 whitespace-normal break-words">
                  <span className="font-semibold sm:hidden">과목명: </span>
                  {g.courseName}
                </td>
                <td className="block text-left py-1 px-1 sm:table-cell sm:text-center sm:py-2 sm:px-4">
                  <span className="font-semibold sm:hidden">학점: </span>
                  {g.credit}
                </td>
                <td className="block text-left py-1 px-1 sm:table-cell sm:text-center sm:py-2 sm:px-4">
                  <span className="font-semibold sm:hidden">성적: </span>
                  {g.grade ? gradeMap[g.grade] || g.grade : "미등록"}
                </td>

                {g.isCurrentSemester && isGradeRegPeriod && (
                  <>
                    <td className="block text-left py-2 px-1 sm:table-cell sm:text-center sm:align-middle">
                      <span className="font-semibold sm:hidden">
                        성적 입력:{" "}
                      </span>
                      <select
                        value={newGrades[g.studentId] || ""}
                        onChange={(e) =>
                          handleGradeChange(g.studentId, e.target.value)
                        }
                        className="border px-2 py-1 rounded w-full sm:w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      >
                        <option value="">선택</option>
                        {Object.entries(gradeMap).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="block text-left py-2 px-1 sm:table-cell sm:text-center sm:align-middle">
                      <div className="flex flex-col space-y-2 mt-1 sm:mt-0 sm:flex-row sm:space-y-0 sm:space-x-2 sm:items-center sm:justify-center">
                        <button
                          onClick={() =>
                            handleRegisterOrUpdate(
                              g.studentId,
                              g.enrollmentId,
                              g.gradeId
                            )
                          }
                          className={`w-full sm:w-auto text-white px-2 py-1 rounded text-xs ${
                            g.grade
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          {g.grade ? "수정" : "등록"}
                        </button>
                        {g.gradeId && (
                          <button
                            onClick={() => handleDelete(g.gradeId)}
                            className="w-full sm:w-auto text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700 text-xs"
                          >
                            초기화
                          </button>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <PageComponent
        currentPage={gradePage.current}
        totalPage={gradePage.totalPage}
        onPageChange={(page) => fetchGrades(selectedClassId, page)}
      />
    </div>
  );
};

export default ProfessorGradePage;
