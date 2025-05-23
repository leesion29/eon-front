import React, { useState, useEffect } from "react";

// 기본 4월 데이터 (JSON 로딩 실패 시 사용)
const defaultEvents = [
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

const CalendarPage = () => {
  const [events, setEvents] = useState(defaultEvents);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(4);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch("/schedule.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error(
          "Failed to fetch schedule.json, using default data:",
          error
        );
      }
    };

    fetchSchedule();
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
  const getFirstDayOfWeek = (year, month) =>
    new Date(year, month - 1, 1).getDay();

  const changeMonth = (diff) => {
    let newMonth = selectedMonth + diff;
    let newYear = selectedYear;
    if (newMonth === 0) {
      newMonth = 12;
      newYear--;
    } else if (newMonth === 13) {
      newMonth = 1;
      newYear++;
    }
    setSelectedYear(newYear);
    setSelectedMonth(newMonth);
  };

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDayOfWeek = getFirstDayOfWeek(selectedYear, selectedMonth);

  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarCells.push(day);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const formatDate = (year, month, day) =>
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // '방학'인지 확인하는 함수
  const isVacation = (eventString) =>
    !!eventString && eventString.includes("방학");

  // *** 수정된 로직: '방학'이 *아닌* 이벤트가 있는지 확인 ***
  const hasNonVacationEvent = (dateStr) => {
    if (!dateStr) return false;
    return events.some(
      (e) => dateStr >= e.start && dateStr <= e.end && !isVacation(e.event)
    );
  };

  // 해당 날짜에 *어떤* 이벤트라도 있는지 확인 (배경/스타일링용)
  const hasAnyEvent = (dateStr) => {
    if (!dateStr) return false;
    return events.some((e) => dateStr >= e.start && dateStr <= e.end);
  };

  const filteredEvents = events
    .filter(
      (e) =>
        e.start.startsWith(
          `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`
        ) ||
        e.end.startsWith(
          `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`
        )
    )
    .sort((a, b) => a.start.localeCompare(b.start));

  const formatRange = (start, end) => {
    const [sY, sM, sD] = start.split("-");
    const [eY, eM, eD] = end.split("-");
    if (start === end) return `${sM}.${sD}`;
    return `${sM}.${sD} ~ ${eM}.${eD}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 max-md:p-3">
      {/* 년도/월 선택 UI (이전과 동일) */}
      <div className="flex justify-center items-center mb-6 gap-4 max-md:gap-2 max-md:mb-4">
        <span
          onClick={() => changeMonth(-1)}
          className="text-2xl font-bold cursor-pointer hover:text-blue-600 max-md:text-xl"
        >
          &lt;
        </span>
        <h1 className="text-4xl font-bold max-md:text-2xl">{selectedYear}</h1>
        <span
          onClick={() => changeMonth(1)}
          className="text-2xl font-bold cursor-pointer hover:text-blue-600 max-md:text-xl"
        >
          &gt;
        </span>
      </div>
      <div className="flex justify-center mb-4 gap-2 text-lg font-semibold max-md:flex-wrap max-md:gap-1 max-md:text-sm max-md:mb-6">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            onClick={() => setSelectedMonth(i + 1)}
            className={`px-3 py-1 cursor-pointer border-b-2 transition-all duration-200 max-md:px-2 max-md:py-0.5 ${
              selectedMonth === i + 1
                ? "text-blue-700 border-blue-700 font-bold"
                : "text-gray-600 border-gray-300"
            }`}
          >
            {i + 1}월
          </div>
        ))}
      </div>

      {/* 달력과 일정 리스트 컨테이너 */}
      <div className="flex gap-6 mt-16 max-md:flex-col max-md:mt-4 max-md:gap-4">
        {/* 달력 */}
        <div className="w-1/2 border rounded p-4 max-md:w-full max-md:p-2">
          <div className="text-lg font-bold mb-1 text-center max-md:text-base">
            {selectedYear}. {String(selectedMonth).padStart(2, "0")}.
          </div>
          <div className=" p-1.5 rounded max-md:p-1">
            <div className="grid grid-cols-7 text-center text-sm font-semibold mb-1.5 max-md:text-xs">
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                <div
                  key={d}
                  className="bg-blue-800 text-white py-1 max-md:py-0.5"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm max-md:text-xs">
              {calendarCells.map((day, idx) => {
                const dateStr = day
                  ? formatDate(selectedYear, selectedMonth, day)
                  : null;

                // *** 수정된 로직 ***
                // '방학'이 *아닌* 이벤트가 있을 때만 콩알 표시
                const showDot = hasNonVacationEvent(dateStr);
                const _hasAnyEvent = hasAnyEvent(dateStr);

                return (
                  <div
                    key={idx}
                    className={`h-24 flex flex-col items-center justify-start pt-2 rounded max-md:h-16 max-md:pt-1 ${
                      day === null ? "bg-gray-50" : "bg-white"
                    } ${_hasAnyEvent ? "relative" : ""}`}
                  >
                    {day && (
                      <>
                        <div>{day}</div>
                        {/* showDot이 true일 때만 콩알 렌더링 */}
                        {showDot && (
                          <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mt-1 max-md:w-1 max-md:h-1"></span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 일정 리스트 (이전과 동일) */}
        <div className="w-1/2 border rounded p-5 text-[17px] leading-7 max-md:w-full max-md:p-4 max-md:text-sm">
          <h2 className="text-xl font-bold mb-4 max-md:text-lg">📌 일정</h2>
          {filteredEvents.length === 0 ? (
            <div className="text-gray-500">등록된 일정이 없습니다.</div>
          ) : (
            <ul className="space-y-4 max-md:space-y-3">
              {filteredEvents.map((e, idx) => (
                <li key={idx} className="flex gap-6 items-start max-md:gap-3">
                  <span className="text-blue-800 font-semibold min-w-[110px] max-md:min-w-[80px]">
                    {formatRange(e.start, e.end)}
                  </span>
                  <span>{e.event}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
