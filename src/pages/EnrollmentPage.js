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
  }, [navigate]);

  useEffect(() => {
    const fetchSemesterInfo = async () => {
      try {
        const data = await getEnrollmentSemesterInfo();
        setSemesterInfo(data);
      } catch (error) {
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
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    if (userId && filters.courseTypes && filters.courseTypes.length > 0) {
      handleSearch(1);
    }
  }, [userId, filters, currentPage]);

  useEffect(() => {
    const fetchEnrolled = async () => {
      if(!userId) return;
      try {
        const res = await getEnrolledCourses(userId);
        setTimetable(res.data);
      } catch (error) {
      }
    };
    fetchEnrolled();
  }, [userId]);

  const handleSearch = async (page = 1, size = 15) => {
    if(!userId) return;
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
      dispatch(showModal({message:"강의 검색 중 오류가 발생했습니다.", type: "error"}));
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
    if(!periodStr) return "-";
    const parts = periodStr
      .split(",")
      .map(Number)
      .sort((a, b) => a - b);

    if (parts.length === 0) return "-";
    if (parts.length === 1) return `${parts[0]}`;
    return `${parts[0]}~${parts[parts.length - 1]}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-8 bg-white shadow-md rounded-md mt-3 sm:mt-6 md:mt-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-1.5 sm:pb-2 md:pb-3 mb-2 sm:mb-3 md:mb-6">
        <h2 className="text-base sm:text-lg md:text-2xl font-semibold text-gray-700 mb-1 text-center md:text-left sm:mb-0">
          {semesterInfo
            ? `${semesterInfo.year}년 ${
                semesterInfo.term === "FIRST" ? "1" : "2"
              }학기 수강 신청`
            : "수강 신청"}
        </h2>
      </div>
      <div className="text-center text-gray-600 text-[9px] sm:text-xs md:text-sm mb-3 sm:mb-4 md:mb-6">
        ※ 필터를 선택한 후{" "}
        <span className="text-blue-600 font-semibold">검색 버튼</span>을
        눌러주세요.
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:justify-center sm:gap-2 md:gap-4 mb-4 sm:mb-6 md:mb-10">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full p-1 text-[9px] sm:text-[10px] md:w-48 md:py-2 md:px-3 md:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-blue-500"
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
          className="w-full p-1 text-[9px] sm:text-[10px] md:w-48 md:py-2 md:px-3 md:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-blue-500"
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
          className="w-full p-1 text-[9px] sm:text-[10px] md:w-48 md:py-2 md:px-3 md:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-blue-500"
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
          className="w-full p-1 text-[9px] sm:text-[10px] md:w-48 md:py-2 md:px-3 md:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-blue-500"
        >
          <option value="전체">전체 학점</option>
          {filters.credits.map((c) => (
            <option key={c.credit} value={c.credit}>
              {c.credit}학점
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="과목명 검색"
          className="w-full p-1 text-[9px] sm:text-[10px] md:w-64 md:py-2 md:px-3 md:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={() => handleSearch(1)}
          className="w-full p-1 text-[9px] sm:text-[10px] md:w-auto md:px-5 md:py-2 md:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
        >
          검색🔍
        </button>
      </div>

      <div className="w-full">
        <table className="w-full table-auto shadow-sm border border-gray-200 rounded-md text-[7px] sm:text-[8px] md:text-sm">
          <colgroup>
            <col className="w-[12%] sm:w-[10%] md:w-[7%]"/>
            <col className="w-auto min-w-[50px] sm:min-w-[60px] md:w-auto"/>
            <col className="w-[10%] sm:w-[8%] md:w-[6%]" />
            <col className="hidden md:table-cell md:w-[10%]" />
            <col className="hidden sm:table-cell sm:w-[7%] md:w-[6%]" />
            <col className="w-[8%] sm:w-[7%] md:w-[5%]" />
            <col className="w-[10%] sm:w-[8%] md:w-[7%]" />
            <col className="w-[12%] sm:w-[10%] md:w-[8%]" />
            <col className="hidden md:table-cell md:w-[7%]" />
            <col className="hidden sm:table-cell sm:w-[10%] md:w-[10%]" />
            <col className="w-[18%] sm:w-[12%] md:w-[10%]" />
            <col className="w-[10%] sm:w-[10%] md:w-[7%]" />
          </colgroup>
          <thead className="bg-gray-50 text-gray-500 text-[6px] sm:text-[7px] md:text-xs uppercase leading-tight">
            <tr>
              <th className="py-0.5 px-px sm:p-0.5 md:py-3 md:px-2 whitespace-nowrap">강의번호</th>
              <th className="py-0.5 px-px sm:p-0.5 md:py-3 md:px-2">과목명</th>
              <th className="py-0.5 px-px sm:p-0.5 md:py-3 md:px-2">구분</th>
              {/* 주석 - 어차피 본인의 학과만 보이기 때문에 반드시 표기될 필요는 없을 것 같으므로 개설학과를 안보이게 처리 */}
              <th className="hidden py-0.5 px-px sm:p-0.5 md:py-3 md:px-2">개설학과</th>
              <th className="hidden sm:table-cell py-0.5 px-px sm:p-0.5 md:py-3 md:px-2">학년</th>
              <th className="py-0.5 px-px sm:p-0.5 md:py-3 md:px-2">학점</th>
              <th className="py-0.5 px-px sm:p-0.5 md:py-3 md:px-2">요일</th>
              <th className="py-0.5 px-px sm:p-0.5 md:py-3 md:px-2">시간</th>
              <th className="hidden md:table-cell py-0.5 px-px sm:p-0.5 md:py-3 md:px-2">강의실</th>
              <th className="hidden sm:table-cell py-0.5 px-px sm:p-0.5 md:py-3 md:px-2">담당교수</th>
              <th className="py-0.5 px-px sm:p-0.5 md:py-3 md:px-2 whitespace-nowrap">신청/정원</th>
              <th className="py-0.5 px-px sm:p-0.5 md:py-3 md:px-2">신청</th>
            </tr>
          </thead>
          <tbody className="text-center text-gray-900">
            {courses.dtoList.length === 0 ? (
              <tr>
                <td colSpan={12} className="md:col-span-12 py-2 sm:py-3 md:py-4 text-gray-400 text-[7px] sm:text-[8px] md:text-xs">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              courses.dtoList.map((course) => (
                <tr key={course.강의번호} className="hover:bg-gray-50 border-t">
                  <td className="py-1 px-px sm:p-0.5 md:py-2 md:px-2 align-middle break-all">{course.강의번호}</td>
                  <td className="py-1 px-px sm:p-0.5 md:py-2 md:px-2 align-middle text-center break-words">{course.강의명}</td>
                  <td className="py-1 px-px sm:p-0.5 md:py-2 md:px-2 align-middle break-all">{course.구분}</td>
                  {/* 개설학과 필요하다면 md:table-cell를 양쪽에 추가하면 됨 */}
                  <td className="hidden py-1 px-px sm:p-0.5 md:py-2 md:px-2 align-middle">{course.개설학과}</td>
                  <td className="hidden sm:table-cell py-1 px-px sm:p-0.5 md:py-2 md:px-2 align-middle">{course.강의학년}학년</td>
                  <td className="py-1 px-px sm:p-0.5 md:py-2 md:px-2 align-middle">{course.강의학점}</td>
                  <td className="py-1 px-px sm:p-0.5 md:py-2 md:px-2 align-middle">{course.강의요일}</td>
                  <td className="py-1 px-px sm:p-0.5 md:py-2 md:px-2 align-middle whitespace-nowrap">{formatPeriodRange(course.강의시간)}</td>
                  <td className="hidden md:table-cell py-1 px-px sm:p-0.5 md:py-2 md:px-2 align-middle">{course.강의실}</td>
                  <td className="hidden sm:table-cell py-1 px-px sm:p-0.5 md:py-2 md:px-2 align-middle break-words">{course.담당교수}</td>
                  <td className="py-1 px-px sm:p-0.5 md:py-2 md:px-2 align-middle whitespace-nowrap">{course.수강인원}</td>
                  <td className="py-1 px-px sm:p-0.5 md:py-2 md:px-2 align-middle">
                    <button
                      onClick={() => handleEnroll(course)}
                      className="bg-blue-400 hover:bg-blue-600 text-white px-1 py-0.5 text-[6px] sm:text-[7px] md:px-3 md:py-1 md:text-sm rounded"
                    >
                      신청
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden mt-4 mb-4 mx-auto max-w-xs">
        <FloatingPopup subjects={timetable} isMobileView={true} />
      </div>

      <PageComponent
        currentPage={currentPage}
        totalPage={courses.totalPage}
        onPageChange={(page) => handleSearch(page)}
      />
      <div className="hidden md:block mt-4">
        <FloatingPopup subjects={timetable} />
      </div>
    </div>
  );
};

export default EnrollmentPage;