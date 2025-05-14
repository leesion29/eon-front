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
    } catch {
      setClasses([]);
    }
  };

  const handleSearch = () => {
    if (selectedClassId) {
      fetchGrades(selectedClassId);
      setIsSearched(true);
    }
  };

  const fetchGrades = async (classId, page = 1, retry = false) => {
    try {
      const res = await getGradesByClass(classId, page);
      const data = res.data;

      if (data.dtoList.length === 0 && data.totalCount > 0 && !retry) {
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
      fetchGrades(selectedClassId);
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
      fetchGrades(selectedClassId);
    } catch {
      dispatch(showModal({ message: "성적 초기화 실패", type: "error" }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white shadow-md rounded-md mt-10">
      <div className="flex justify-between items-center border-b pb-3 mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">성적 관리</h2>
      </div>

      {/* 필터 영역 */}
      <div className="flex gap-4 mb-6">
        <select
          value={selectedSemesterId || ""}
          onChange={(e) => {
            const semId = e.target.value;
            setSelectedSemesterId(semId);
            fetchClasses(semId); // 학기별로 강의를 다시 불러옵니다.
          }}
          className="px-3 py-2 w-64 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 
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
          className="px-3 py-2 w-64 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          검색
        </button>
      </div>

      {/* 성적 테이블 */}
      <table className="min-w-full table-auto shadow-sm border border-gray-200 rounded-md text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
          <tr className="text-center">
            <th className="py-3 px-4">학번</th>
            <th className="py-3 px-4">이름</th>
            <th className="py-3 px-4">과목명</th>
            <th className="py-3 px-4">학점</th>
            <th className="py-3 px-4">성적</th>
            {grades[0]?.isCurrentSemester && isGradeRegPeriod && (
              <>
                <th className="py-3 px-4">입력</th>
                <th className="py-3 px-4">관리</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="text-center text-gray-700">
          {grades.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-4 text-gray-400">
                {isSearched
                  ? "성적 정보가 없습니다."
                  : "학기와 강의를 선택 후 검색해주세요."}
              </td>
            </tr>
          ) : (
            grades.map((g) => (
              <tr key={g.studentId} className="hover:bg-gray-50 border-t">
                <td className="py-2 px-4">{g.studentId}</td>
                <td className="py-2 px-4">{g.studentName}</td>
                <td className="py-2 px-4">{g.courseName}</td>
                <td className="py-2 px-4">{g.credit}</td>
                <td className="py-2 px-4">
                  {g.grade ? gradeMap[g.grade] || g.grade : "미등록"}
                </td>

                {g.isCurrentSemester && isGradeRegPeriod && (
                  <>
                    <td className="py-2 px-4">
                      <select
                        value={newGrades[g.studentId] || ""}
                        onChange={(e) =>
                          handleGradeChange(g.studentId, e.target.value)
                        }
                        className="border px-2 py-1 rounded w-16 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      >
                        <option value="">선택</option>
                        {Object.entries(gradeMap).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-4 space-x-2">
                      <button
                        onClick={() =>
                          handleRegisterOrUpdate(
                            g.studentId,
                            g.enrollmentId,
                            g.gradeId
                          )
                        }
                        className={`text-white px-2 py-1 rounded ${
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
                          className="text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                        >
                          초기화
                        </button>
                      )}
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
