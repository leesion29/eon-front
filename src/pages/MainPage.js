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

const generateAprilDays = () => {
  const firstDayOfWeek = 2; // 4월 1일은 화요일
  const daysInMonth = 30;
  const blanks = Array(firstDayOfWeek).fill(null);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  return [...blanks, ...daysArray];
};

const aprilDays = generateAprilDays();

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
          "http://localhost:8080/api/notice/list",
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
        if (userRole === "STUDENT") {
          const res = await getEnrolledCourses(userId);
          setSchedule(res.data);
        } else if (userRole === "PROFESSOR") {
          const res = await getMyClasses(1, 100, "id", "asc");
          setSchedule(
            res.data.dtoList.map((c) => ({
              classDay: c.day,
              classStartPeriod: parseInt(c.startTime),
              classEndPeriod: parseInt(c.endTime),
              courseName: c.courseName,
              classRoom: `${c.buildingName} ${c.lectureRoomName}`,
            }))
          );
        }
      } catch (e) {
        console.error("시간표 불러오기 실패", e);
      }
    };
    if (userId) fetchSchedule();
  }, [userId, userRole]);

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
      ? Math.max(...schedule.map((c) => c.classEndPeriod))
      : 10;

  return (
    <div className="max-w-screen-2xl mx-auto mt-6 px-4">
      <div className="flex flex-col md:flex-row gap-10">
        {/* 왼쪽 영역 */}
        <div className="w-full md:w-1/2 flex flex-col space-y-10">
          {userRole === "ADMIN" && (
            <div className="rounded-md p-6 text-left text-7xl font-bold leading-tight space-y-3 min-h-[400px] flex flex-col justify-center">
              <div>𝐈𝐧𝐧𝐨𝐯𝐚𝐭𝐞.</div>
              <div>𝐈𝐭𝐞𝐫𝐚𝐭𝐞.</div>
              <div>𝐈𝐥𝐥𝐮𝐦𝐢𝐧𝐚𝐭𝐞</div>
              <div className="text-2xl pt-4 text-right">– 𝐀𝐭 𝐄.𝐎𝐍</div>
            </div>
          )}

          {userRole === "STUDENT" && (
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
                              return (
                                <td
                                  key={`${day}-${period.label}`}
                                  rowSpan={duration}
                                  className="border border-gray-300 bg-blue-100 text-[11px] font-semibold"
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
          )}

          {/* 교수 시간표 */}
          {userRole === "PROFESSOR" && (
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
                              return (
                                <td
                                  key={`${day}-${period.label}`}
                                  rowSpan={duration}
                                  className="border border-gray-300 bg-blue-100 text-[11px] font-semibold"
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
          )}

          {/* 학사일정 추가 */}
          <Link
            to="/main/calender"
            className="bg-white rounded-md p-4 mt-6 block cursor-pointer"
          >
            <h2 className="text-lg font-semibold mb-2">📅 학사일정</h2>
            <div className="grid grid-cols-7 gap-1 text-xs text-center border p-2 rounded">
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                <div key={d} className="font-bold text-gray-700">
                  {d}
                </div>
              ))}
              {aprilDays.map((day, idx) => {
                if (day === null)
                  return (
                    <div key={`blank-${idx}`} className="h-16 border"></div>
                  );
                const dateStr = `2025-04-${String(day).padStart(2, "0")}`;
                const match = getEventForDay(dateStr);
                return (
                  <div
                    key={`day-${idx}`}
                    className={`h-16 border text-[10px] p-2 ${
                      match ? match.color : ""
                    }`}
                  >
                    <div>{day}</div>
                    {match && <div className="font-bold">{match.event}</div>}
                  </div>
                );
              })}
            </div>
          </Link>
        </div>

        {/* 오른쪽 영역: 홍보 이미지, 검색창, 공지사항 */}
        <div className="w-full md:w-1/2 flex flex-col space-y-10 pl-6 pr-6">
          {/* 홍보 이미지 */}
          <div className="relative w-full h-[400px] overflow-hidden rounded-lg shadow-lg">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
                  idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <img
                  src={img}
                  alt={`홍보 이미지 ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30">
                  <span className="absolute bottom-2 right-4 text-gray-200 text-lg font-bold drop-shadow-md">
                    {imageNames[idx]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 검색창 */}
          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="검색어를 입력해주세요."
              className="w-full border-b-2 border-black px-3 py-4 text-lg focus:outline-none"
            />
            <div className="flex flex-wrap gap-2 mt-3 text-sm text-gray-600">
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
                  className="bg-gray-100 px-2 py-1 rounded hover:bg-gray-300 cursor-pointer"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 공지사항 */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-4 mt-4">
              <h2 className="text-2xl font-semibold">📢 공지사항</h2>
              <Link
                to="/main/noticelist"
                className="text-blue-500 text-sm hover:underline"
              >
                전체보기
              </Link>
            </div>
            <ul className="space-y-3 text-sm">
              {noticeList.map((n, idx) => (
                <li key={idx} className="flex justify-between text-gray-800">
                  <Link
                    to="/main/noticedata"
                    state={{ noticeId: n.noticeId }}
                    className="hover:underline"
                  >
                    {n.title}
                  </Link>
                  <span>{n.noticeDate?.slice(5, 10)}</span>
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
