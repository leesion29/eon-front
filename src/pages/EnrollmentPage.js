import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getFilters,
  searchCourses,
  enrollCourse,
  getEnrolledCourses,
  getEnrollmentSemesterInfo,
  checkEnrollPeriod,
} from "../api/enrollmentApi";
import { showModal } from "../slices/modalSlice";
import { setUserId as setUserIdAction } from "../slices/authSlice";
import FloatingPopup from "../components/FloatingPopup";
import PageComponent from "../components/PageComponent";

const EnrollmentPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth.userId);

  const [semesterInfo, setSemesterInfo] = useState(null);
  const [courses, setCourses] = useState({
    dtoList: [],
    totalPage: 0,
    current: 1,
    totalCount: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [timetable, setTimetable] = useState([]);

  const [filters, setFilters] = useState({
    courseTypes: [],
    classDays: [],
    classTimes: [],
    credits: [],
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("전체");
  const [filterDay, setFilterDay] = useState("전체");
  const [filterTime, setFilterTime] = useState("전체");
  const [filterCredit, setFilterCredit] = useState("전체");

  useEffect(() => {
    const checkPeriod = async () => {
      const isOpen = await checkEnrollPeriod();
      if (!isOpen) {
        navigate("/main/period-expired", {
          state: { message: "현재는 수강신청 기간이 아닙니다!" },
        });
      }
    };
    checkPeriod();
  }, [navigate]);

  useEffect(() => {
    const status = sessionStorage.getItem("studentStatus");
    if (status === "LEAVE") {
      navigate("/main/period-expired", {
        state: { message: "휴학 상태에서는 수강신청할 수 없습니다." },
      });
    }
  }, []);
  
  useEffect(() => {
    const fetchSemesterInfo = async () => {
      try {
        const data = await getEnrollmentSemesterInfo();
        setSemesterInfo(data);
      } catch (error) {
        console.error("수강신청 학기 정보 조회 실패:", error);
      }
    };
    fetchSemesterInfo();
  }, []);

  useEffect(() => {
    const localId = localStorage.getItem("id");
    if (!userId && localId) {
      dispatch(setUserIdAction(localId));
    }
  }, [userId, dispatch]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [courseTypesRes, classDaysRes, classTimesRes, creditsRes] =
          await getFilters();
        setFilters({
          courseTypes: courseTypesRes.data,
          classDays: classDaysRes.data,
          classTimes: classTimesRes.data,
          credits: creditsRes.data,
        });
      } catch (error) {
        console.error("필터 데이터 불러오기 실패:", error);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    if (userId && filters.courseTypes.length > 0) {
      handleSearch(1);
    }
  }, [userId, filters]);

  useEffect(() => {
    const fetchEnrolled = async () => {
      try {
        const res = await getEnrolledCourses(userId);
        setTimetable(res.data);
      } catch (error) {
        console.error("내 수강 목록 불러오기 실패:", error);
      }
    };
    if (userId) fetchEnrolled();
  }, [userId]);

  const handleSearch = async (page = 1, size = 15) => {
    try {
      const response = await searchCourses(userId, {
        courseName: searchQuery || null,
        courseType: filterCategory !== "전체" ? filterCategory : null,
        classDay: filterDay !== "전체" ? filterDay : null,
        classStart: filterTime !== "전체" ? parseInt(filterTime) : null,
        credit: filterCredit !== "전체" ? parseInt(filterCredit) : null,
        page,
        size,
      });
      setCourses(response.data);
      setCurrentPage(page);
    } catch (error) {
      console.error("강의 검색 실패:", error);
      dispatch(showModal("강의 검색 중 오류가 발생했습니다.", "error"));
    }
  };

  const handleEnroll = async (course) => {
    const isAlreadyEnrolled = timetable.some(
      (c) => c.강의번호 === course.강의번호
    );
    if (isAlreadyEnrolled) {
      dispatch(
        showModal({ message: "이미 신청된 강의입니다!", type: "error" })
      );
      return;
    }

    try {
      const response = await enrollCourse(userId, {
        studentId: userId,
        classId: course.강의번호,
      });

      const msg = response.data;

      if (msg.includes("성공")) {
        dispatch(
          showModal({
            message: `"${course.강의명}" 강의가 시간표에 추가되었습니다!`,
            type: "success",
          })
        );

        const updated = await getEnrolledCourses(userId);
        setTimetable(updated.data);
      } else {
        dispatch(showModal({ message: msg, type: "error" }));
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ?? error.response?.data ?? error.message;
      dispatch(
        showModal({
          message: msg || "수강 신청 중 오류가 발생했습니다.",
          type: "error",
        })
      );
    } finally {
      handleSearch(currentPage);
    }
  };

  const formatPeriodRange = (periodStr) => {
    const parts = periodStr
      .split(",")
      .map(Number)
      .sort((a, b) => a - b);

    if (parts.length === 0) return "-";
    if (parts.length === 1) return `${parts[0]}교시`;
    return `${parts[0]} ~ ${parts[parts.length - 1]}교시`;
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white shadow-md rounded-md mt-10">
      {/* 헤더 */}
      <div className="flex justify-between items-center border-b pb-3 mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">
          {semesterInfo
            ? `${semesterInfo.year}년 ${
                semesterInfo.term === "FIRST" ? "1" : "2"
              }학기 수강 신청`
            : "수강 신청"}
        </h2>
      </div>
      {/* 안내 문구 */}
      <div className="text-center text-gray-600 text-sm mb-6">
        ※ 필터를 선택한 후{" "}
        <span className="text-blue-600 font-semibold">검색 버튼</span>을
        눌러주세요.
      </div>
      {/* 필터 + 검색창 통합 박스 */}
      <div className="flex flex-wrap gap-4 items-center justify-center mb-10">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 w-48 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="전체">전체 구분</option>
          {filters.courseTypes.map((t) => (
            <option key={t.courseType} value={t.courseType}>
              {t.courseType}
            </option>
          ))}
        </select>

        <select
          value={filterDay}
          onChange={(e) => setFilterDay(e.target.value)}
          className="px-3 py-2 w-48 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="전체">전체 요일</option>
          {filters.classDays.map((d) => (
            <option key={d.classDay} value={d.classDay}>
              {d.classDay}
            </option>
          ))}
        </select>

        <select
          value={filterTime}
          onChange={(e) => setFilterTime(e.target.value)}
          className="px-3 py-2 w-48 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="전체">전체 시작교시</option>
          {filters.classTimes.map((t) => (
            <option key={t.classTime} value={t.classTime}>
              {t.classTime}교시
            </option>
          ))}
        </select>

        <select
          value={filterCredit}
          onChange={(e) => setFilterCredit(e.target.value)}
          className="px-3 py-2 w-48 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="전체">전체 학점</option>
          {filters.credits.map((c) => (
            <option key={c.credit} value={c.credit}>
              {c.credit}학점
            </option>
          ))}
        </select>

        {/* 과목명 검색창 */}
        <input
          type="text"
          placeholder="과목명 검색"
          className="px-3 py-2 w-64 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* 검색 버튼 */}
        <button
          onClick={() => handleSearch(1)}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold"
        >
          검색 🔍
        </button>
      </div>
      {/* 검색 결과 테이블 */}
      <table className="min-w-full table-auto shadow-sm border border-gray-200 rounded-md text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
          <tr className="text-center">
            {[
              "강의번호",
              "과목명",
              "구분",
              "개설학과",
              "강의학년",
              "학점",
              "강의요일",
              "강의시간",
              "강의실",
              "담당교수",
              "신청인원/정원",
              "신청",
            ].map((header) => (
              <th key={header} className="py-3 px-2">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-center text-gray-900">
          {courses.dtoList.length === 0 ? (
            <tr>
              <td colSpan="12" className="py-4 text-gray-400">
                검색 결과가 없습니다.
              </td>
            </tr>
          ) : (
            courses.dtoList.map((course) => (
              <tr key={course.강의번호} className="hover:bg-gray-50 border-t">
                <td className="py-2 px-2">{course.강의번호}</td>
                <td className="py-2 px-2">{course.강의명}</td>
                <td className="py-2 px-2">{course.구분}</td>
                <td className="py-2 px-2">{course.개설학과}</td>
                <td className="py-2 px-2">{course.강의학년}학년</td>
                <td className="py-2 px-2">{course.강의학점}학점</td>
                <td className="py-2 px-2">{course.강의요일}요일</td>
                <td className="py-2 px-2">
                  {formatPeriodRange(course.강의시간)}
                </td>
                <td className="py-2 px-2">{course.강의실}</td>
                <td className="py-2 px-2">{course.담당교수}</td>
                <td className="py-2 px-2">{course.수강인원}</td>
                <td className="py-2 px-2">
                  <button
                    onClick={() => handleEnroll(course)}
                    className="bg-blue-400 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    신청 🛒
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <PageComponent
        currentPage={currentPage}
        totalPage={courses.totalPage}
        onPageChange={(page) => handleSearch(page)}
      />
      <FloatingPopup subjects={timetable} />
    </div>
  );
};

export default EnrollmentPage;
