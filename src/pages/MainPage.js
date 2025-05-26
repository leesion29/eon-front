import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthHeader } from "../util/authHeader";
import { getEnrolledCourses } from "../api/enrollmentApi";
import { getMyClasses } from "../api/professorClassApi";
import { useSelector } from "react-redux";

const images = [
  "/images/Eon1.jpg",
  "/images/Eon2.jpg",
  "/images/Eon3.jpg",
  "/images/Eon4.jpg",
  "/images/Eon5.jpg",
  "/images/Eon6.jpg",
];

const imageNames = [
  "컴퓨터정보공학관",
  "AI융합관",
  "데이터사이언스관",
  "임베디드·IoT관",
  "정보보호관",
  "IT융합실습관",
];

const bgColors = [
  "bg-red-100",
  "bg-blue-100",
  "bg-green-100",
  "bg-yellow-100",
  "bg-purple-100",
  "bg-pink-100",
  "bg-orange-100",
  "bg-teal-100",
];

const periods = [
  { label: "1교시" },
  { label: "2교시" },
  { label: "3교시" },
  { label: "4교시" },
  { label: "5교시" },
  { label: "6교시" },
  { label: "7교시" },
  { label: "8교시" },
  { label: "9교시" },
  { label: "10교시" },
];

const days = ["월", "화", "수", "목", "금"];

const dummyCalendarEvents = [
  {
    start: "2025-04-01",
    end: "2025-04-07",
    event: "학생설계전공 신청",
    color: "bg-red-100",
  },
  {
    start: "2025-04-16",
    end: "2025-04-18",
    event: "융합전공 신청",
    color: "bg-blue-100",
  },
  {
    start: "2025-04-21",
    end: "2025-04-25",
    event: "1학기 중간고사",
    color: "bg-yellow-100",
  },
];

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;

const generateMonthDays = (year, month) => {
  const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate();
  const getFirstDayOfWeek = (y, m) => new Date(y, m - 1, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);
  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarCells.push(day);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);
  return calendarCells;
};

const monthDays = generateMonthDays(currentYear, currentMonth);

const formatDate = (year, month, day) =>
  `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const MainPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [noticeList, setNoticeList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [schedule, setSchedule] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState(dummyCalendarEvents);
  const navigate = useNavigate();
  const { userRole, userId } = useSelector((state) => state.auth);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await axios.get(
          "https://www.eonuniversity.co.kr/api/notice/list",
          getAuthHeader()
        );
        const sorted = res.data.sort(
          (a, b) => new Date(b.noticeDate) - new Date(a.noticeDate)
        );
        setNoticeList(sorted.slice(0, 5));
      } catch (err) {
        console.error("공지사항 불러오기 실패", err);
      }
    };
    fetchNotices();
  }, []);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        let rawScheduleData = [];
        if (userRole === "STUDENT") {
          const res = await getEnrolledCourses(userId);
          rawScheduleData = res.data;
        } else if (userRole === "PROFESSOR") {
          const res = await getMyClasses(1, 100, "id", "asc");
          rawScheduleData = res.data.dtoList.map((c) => ({
            classDay: c.day,
            classStartPeriod: parseInt(c.startTime),
            classEndPeriod: parseInt(c.endTime),
            courseName: c.courseName,
            classRoom: `${c.buildingName} ${c.lectureRoomName}`,
          }));
        }

        if (Array.isArray(rawScheduleData) && rawScheduleData.length > 0) {
          const scheduleWithRandomColors = rawScheduleData.map((course) => ({
            ...course,
            bgColorClass: bgColors[Math.floor(Math.random() * bgColors.length)],
          }));
          setSchedule(scheduleWithRandomColors);
        } else {
          setSchedule([]);
        }
      } catch (e) {
        console.error("시간표 불러오기 실패", e);
        setSchedule([]);
      }
    };
    if (userId) fetchSchedule();
  }, [userId, userRole]);

  // 학사일정 JSON 로드
  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        const response = await fetch("/schedule.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCalendarEvents(data);
      } catch (error) {
        console.error(
          "Failed to fetch schedule.json, using dummy data. Error:",error);
      }
    };
    fetchCalendarEvents();
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      navigate("/main/noticelist", { state: { keyword: searchTerm.trim() } });
    }
  };

  const handleTagClick = (tag) => {
    const keyword = tag.replace(/^#/, "");
    navigate("/main/noticelist", { state: { keyword } });
  };

  const getEventForDay = (dateStr) =>
    calendarEvents.find((e) => dateStr >= e.start && dateStr <= e.end);

  const maxPeriod =
    schedule.length > 0
      ? Math.max(...schedule.map((c) => c.classEndPeriod), 8)
      : 8;

  return (
    <div className="max-w-screen-2xl mx-auto mt-4 sm:mt-6 px-2 sm:px-4">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        {/* 왼쪽 영역 */}
        <div className="w-full md:w-1/2 flex flex-col space-y-6 md:space-y-10">
          {/* ... (관리자 뷰 또는 시간표 렌더링 - 이전과 동일) ... */}
          {userRole === "ADMIN" ? (
            <div className="rounded-md p-4 sm:p-6 text-left text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight space-y-2 sm:space-y-3 min-h-[250px] md:min-h-[300px] lg:min-h-[400px] flex flex-col justify-center">
              <div>𝐈𝐧𝐧𝐨𝐯𝐚𝐭𝐞.</div> <div>𝐈𝐭𝐞𝐫𝐚𝐭𝐞.</div> <div>𝐈𝐥𝐥𝐮𝐦𝐢𝐧𝐚𝐭𝐞</div>
              <div className="text-xl sm:text-2xl pt-3 sm:pt-4 text-right">
                – 𝐀𝐭 𝐄.𝐎𝐍
              </div>
            </div>
          ) : userRole === "STUDENT" ? (
            <Link
              to="/main/schedule"
              className="bg-white rounded-md p-4 transition"
            >
              <div className="text-lg font-semibold mb-4">📘 나의 시간표</div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-xs table-fixed">
                  <thead>
                    <tr className="bg-gray-100 text-center">
                      <th className="border border-gray-300 px-1 w-[72px]">
                        시간
                      </th>
                      {days.map((day) => (
                        <th
                          key={day}
                          className="border border-gray-300 p-2 w-1/5"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periods.slice(0, maxPeriod).map((period, periodIndex) => {
                      const currentPeriod = periodIndex + 1;
                      const renderMap = {};
                      return (
                        <tr
                          key={period.label}
                          className="text-center h-[3.2rem]"
                        >
                          <td className="border border-gray-300 p-1 bg-gray-100 font-semibold text-[11px]">
                            {period.label}
                          </td>
                          {days.map((day) => {
                            if (renderMap[`${day}-${currentPeriod}`])
                              return null;
                            const course = schedule.find(
                              (c) =>
                                c.classDay === day &&
                                c.classStartPeriod === currentPeriod
                            );
                            if (course) {
                              const duration =
                                course.classEndPeriod -
                                course.classStartPeriod +
                                1;
                              for (let i = 0; i < duration; i++) {
                                renderMap[`${day}-${currentPeriod + i}`] = true;
                              }
                              const cellClassName = `border border-gray-300 text-[11px] font-semibold ${
                                course.bgColorClass
                                  ? course.bgColorClass
                                  : "bg-white"
                              }`;
                              return (
                                <td
                                  key={`${day}-${period.label}`}
                                  rowSpan={duration}
                                  className={cellClassName}
                                >
                                  {course.courseName}
                                </td>
                              );
                            } else {
                              return (
                                <td
                                  key={`${day}-${period.label}`}
                                  className="border border-gray-300"
                                ></td>
                              );
                            }
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Link>
          ) : userRole === "PROFESSOR" ? (
            <Link
              to="/main/professor/classes"
              className="bg-white rounded-md p-4 transition"
            >
              <div className="text-lg font-semibold mb-4">
                📘 교수 강의 시간표
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-xs table-fixed">
                  <thead>
                    <tr className="bg-gray-100 text-center">
                      <th className="border border-gray-300 px-1 w-[72px]">
                        시간
                      </th>
                      {days.map((day) => (
                        <th
                          key={day}
                          className="border border-gray-300 p-2 w-1/5"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {periods.slice(0, maxPeriod).map((period, periodIndex) => {
                      const currentPeriod = periodIndex + 1;
                      const renderMap = {};
                      return (
                        <tr
                          key={period.label}
                          className="text-center h-[3.2rem]"
                        >
                          <td className="border border-gray-300 p-1 bg-gray-100 font-semibold text-[11px]">
                            {period.label}
                          </td>
                          {days.map((day) => {
                            if (renderMap[`${day}-${currentPeriod}`])
                              return null;
                            const course = schedule.find(
                              (c) =>
                                c.classDay === day &&
                                c.classStartPeriod === currentPeriod
                            );
                            if (course) {
                              const duration =
                                course.classEndPeriod -
                                course.classStartPeriod +
                                1;
                              for (let i = 0; i < duration; i++) {
                                renderMap[`${day}-${currentPeriod + i}`] = true;
                              }
                              const cellClassName = `border border-gray-300 text-[11px] font-semibold ${
                                course.bgColorClass
                                  ? course.bgColorClass
                                  : "bg-white"
                              }`;
                              return (
                                <td
                                  key={`${day}-${period.label}`}
                                  rowSpan={duration}
                                  className={cellClassName}
                                >
                                  <div>{course.courseName}</div>
                                  <div>{course.classRoom}</div>
                                </td>
                              );
                            } else {
                              return (
                                <td
                                  key={`${day}-${period.label}`}
                                  className="border border-gray-300"
                                ></td>
                              );
                            }
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Link>
          ) : null}

          {/* 학사일정 */}
          <Link
            to="/main/calender" // 오타 유지
            className="bg-white rounded-md p-4 mt-6 block cursor-pointer"
          >
            <h2 className="text-lg font-semibold mb-2">
              📅 학사일정 ({currentYear}.{String(currentMonth).padStart(2, "0")}
              )
            </h2>
            <div className="grid grid-cols-7 gap-1 text-xs text-center border p-2 rounded">
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                <div key={d} className="font-bold text-gray-700">
                  {d}
                </div>
              ))}
              {monthDays.map((day, idx) => {
                if (day === null)
                  return (
                    <div
                      key={`blank-${idx}`}
                      className="h-16 border bg-gray-50"
                    ></div>
                  );

                const dateStr = formatDate(currentYear, currentMonth, day);
                const match = getEventForDay(dateStr);

                return (
                  <div
                    key={`day-${idx}`}
                    className={`h-16 border text-[10px] px-0 py-0.5 sm:px-1 sm:py-1 md:p-2 flex flex-col justify-start items-center ${
                      match ? match.color : "bg-white"
                    }`}
                  >
                    <div>{day}</div>
                    {match && (
                      <div className="font-bold text-[8px] sm:text-[9px] md:text-[10px] leading-tight mt-0.5 break-words w-full text-center overflow-hidden">
                        {match.event}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Link>
        </div>

        {/* 오른쪽 영역 */}
        <div className="w-full md:w-1/2 flex flex-col space-y-6 md:space-y-10 md:pl-6 md:pr-6">
          {/* ... (이미지 슬라이더, 검색창, 공지사항 - 이전과 동일) ... */}
          <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] overflow-hidden rounded-lg shadow-lg">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
                  idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                {" "}
                <img
                  src={img}
                  alt={`홍보 이미지 ${idx + 1}`}
                  className="w-full h-full object-cover"
                />{" "}
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end justify-end p-2 sm:p-3 md:p-4">
                  {" "}
                  <span className="text-gray-200 text-sm sm:text-base md:text-lg font-bold drop-shadow-md">
                    {imageNames[idx]}
                  </span>{" "}
                </div>{" "}
              </div>
            ))}
          </div>
          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="검색어를 입력해주세요."
              className="w-full border-b-2 border-gray-400 focus:border-blue-500 px-2 py-3 sm:px-3 sm:py-4 text-sm sm:text-base md:text-lg focus:outline-none"
            />
            <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600">
              {[
                "#휴학",
                "#복학",
                "#수강신청",
                "#성적조회",
                "#강의평가",
                "#중간고사",
                "#예비군",
              ].map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded hover:bg-gray-300 cursor-pointer"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2 sm:mb-4 mt-2 sm:mt-4">
              <h2 className="text-xl sm:text-2xl font-semibold">📢 공지사항</h2>
              <Link
                to="/main/noticelist"
                className="text-blue-500 text-xs sm:text-sm hover:underline"
              >
                전체보기
              </Link>
            </div>
            <ul className="space-y-2 sm:space-y-3 text-sm">
              {noticeList.map((n, idx) => (
                <li
                  key={idx}
                  className="flex justify-between text-gray-800 items-start"
                >
                  <Link
                    to="/main/noticedata"
                    state={{ noticeId: n.noticeId }}
                    className="hover:underline flex-1 truncate mr-2 sm:mr-3"
                  >
                    {n.title}
                  </Link>
                  <span className="text-gray-500 text-xs sm:text-sm whitespace-nowrap">
                    {n.noticeDate?.slice(5, 10)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
