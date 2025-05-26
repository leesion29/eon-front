import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { getEnrolledCourses } from "../api/enrollmentApi";

const days = ["월", "화", "수", "목", "금"];

const periods = [
  { label: "1", pcLabel: "1교시", time: "09:00", pcTime: "09:00 ~ 09:50" },
  { label: "2", pcLabel: "2교시", time: "10:00", pcTime: "10:00 ~ 10:50" },
  { label: "3", pcLabel: "3교시", time: "11:00", pcTime: "11:00 ~ 11:50" },
  { label: "4", pcLabel: "4교시", time: "12:00", pcTime: "12:00 ~ 12:50" },
  { label: "5", pcLabel: "5교시", time: "13:00", pcTime: "13:00 ~ 13:50" },
  { label: "6", pcLabel: "6교시", time: "14:00", pcTime: "14:00 ~ 14:50" },
  { label: "7", pcLabel: "7교시", time: "15:00", pcTime: "15:00 ~ 15:50" },
  { label: "8", pcLabel: "8교시", time: "16:00", pcTime: "16:00 ~ 16:50" },
  { label: "9", pcLabel: "9교시", time: "17:00", pcTime: "17:00 ~ 17:50" },
  { label: "10", pcLabel: "10교시", time: "18:00", pcTime: "18:00 ~ 18:50" }, // 10교시 추가
];

const COLORS = [
  "bg-red-200",
  "bg-orange-200",
  "bg-yellow-200",
  "bg-green-200",
  "bg-teal-200",
  "bg-blue-200",
  "bg-indigo-200",
  "bg-purple-200",
  "bg-pink-200",
  "bg-gray-200",
  "bg-lime-200",
];

const getColorClass = (courseName) => {
  let hash = 0;
  for (let i = 0; i < courseName.length; i++) {
    hash = courseName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
};

const baseRowMobileRem = 2.25;
const baseRowPcRem = 4.375;

const SchedulePage = () => {
  const userId = useSelector((state) => state.auth.userId);
  const [schedule, setSchedule] = useState([]);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  const currentRowHeightRem = isMobileView ? baseRowMobileRem : baseRowPcRem;

  const updateView = useCallback(() => {
    setIsMobileView(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", updateView);
    return () => window.removeEventListener("resize", updateView);
  }, [updateView]);

  const fetchSchedule = useCallback(async () => {
    try {
      const response = await getEnrolledCourses(userId);
      setSchedule(response.data);
    } catch (error) {
      console.error("시간표 조회 실패:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchSchedule();
  }, [userId, fetchSchedule]);

  const renderMap = {};

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-6 bg-white shadow-md mt-4 rounded-md">
      <h2 className="text-lg md:text-2xl font-bold text-center mb-3 md:mb-4">
        📝 시간표 📝
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full w-full border-collapse border border-gray-300 table-fixed">
          <thead className="text-[10px] md:text-sm">
            <tr className="bg-gray-100 text-center">
              <th className="border border-gray-300 p-1 w-[40px] md:w-[130px]">
                시간
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="border border-gray-300 p-1 md:p-2 w-[calc((100%-40px)/5)] md:w-1/5"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[9px] md:text-sm">
            {periods.map((period, periodIndex) => {
              const currentPeriod = periodIndex + 1;

              const currentActualRowHeight = isMobileView
                ? baseRowMobileRem
                : baseRowPcRem;
              const rowHeightStyle = { height: `${currentActualRowHeight}rem` };

              return (
                <tr
                  key={period.label}
                  className="text-center"
                  style={rowHeightStyle}
                >
                  <td className="border border-gray-300 p-0.5 bg-gray-50 align-middle">
                    <div className="font-semibold leading-tight md:hidden">
                      {period.label}
                    </div>
                    <div className="font-semibold leading-tight hidden md:block">
                      {period.pcLabel}
                    </div>
                    <div className="text-[8px] md:text-xs text-gray-600 leading-tight md:hidden">
                      {period.time}
                    </div>
                    <div className="text-[8px] md:text-xs text-gray-600 leading-tight hidden md:block">
                      {period.pcTime}
                    </div>
                  </td>
                  {days.map((day) => {
                    if (renderMap[`${day}-${currentPeriod}`]) return null;

                    const course = schedule.find(
                      (c) =>
                        c.classDay === day &&
                        c.classStartPeriod === currentPeriod
                    );

                    if (course) {
                      const duration =
                        course.classEndPeriod - course.classStartPeriod + 1;
                      for (let i = 0; i < duration; i++) {
                        renderMap[`${day}-${currentPeriod + i}`] = true;
                      }
                      const bgColorClass = getColorClass(course.courseName);

                      const cellHeight = duration * currentActualRowHeight;
                      const cellHeightStyle = { height: `${cellHeight}rem` };

                      return (
                        <td
                          key={`${day}-${period.label}`}
                          rowSpan={duration}
                          className="border border-gray-300 p-0 align-top relative"
                          style={cellHeightStyle}
                        >
                          <div
                            className={`${bgColorClass} absolute inset-0 flex flex-col justify-center items-center p-0.5 md:p-1 rounded-sm shadow-sm break-words leading-tight overflow-hidden`}
                          >
                            <p className="font-bold text-[8px] md:text-xs">
                              {course.courseName}
                            </p>
                            <p className="text-[7px] md:text-[10px] hidden md:block">
                              {course.professorName}
                            </p>
                            <p className="text-[7px] md:text-[10px]">
                              {course.classRoom}
                            </p>
                          </div>
                        </td>
                      );
                    } else {
                      return (
                        <td
                          key={`${day}-${period.label}`}
                          className="border border-gray-300 p-0.5"
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
    </div>
  );
};

export default SchedulePage;
