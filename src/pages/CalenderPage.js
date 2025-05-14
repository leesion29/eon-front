import React, { useState } from "react";

const CalendarPage = () => {
  const events = [
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

  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(4);

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

  const isEventDay = (dateStr) =>
    events.some((e) => dateStr >= e.start && dateStr <= e.end);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-center items-center mb-6 gap-4">
        <span
          onClick={() => changeMonth(-1)}
          className="text-2xl font-bold cursor-pointer hover:text-blue-600"
        >
          &lt;
        </span>
        <h1 className="text-4xl font-bold">{selectedYear}</h1>
        <span
          onClick={() => changeMonth(1)}
          className="text-2xl font-bold cursor-pointer hover:text-blue-600"
        >
          &gt;
        </span>
      </div>

      <div className="flex justify-center mb-4 gap-2 text-lg font-semibold">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            onClick={() => setSelectedMonth(i + 1)}
            className={`px-3 py-1 cursor-pointer border-b-2 transition-all duration-200
           ${
             selectedMonth === i + 1
               ? "text-blue-700 border-blue-700 font-bold"
               : "text-gray-600 border-gray-300"
           }`}
          >
            {i + 1}월
          </div>
        ))}
      </div>

      <div className="flex gap-6 mt-16">
        {/* 왼쪽 달력 */}
        <div className="w-1/2 border rounded p-4">
          <div className="text-lg font-bold mb-1 text-center">
            {selectedYear}. {String(selectedMonth).padStart(2, "0")}.
          </div>

          {/* 요일 + 날짜 배경 */}
          <div className=" p-1.5 rounded">
            <div className="grid grid-cols-7 text-center text-sm font-semibold mb-1.5">
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                <div key={d} className="bg-blue-800 text-white py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {calendarCells.map((day, idx) => {
                const dateStr = day
                  ? formatDate(selectedYear, selectedMonth, day)
                  : null;
                const hasEvent = dateStr ? isEventDay(dateStr) : false;

                return (
                  <div
                    key={idx}
                    className={`h-24 flex flex-col items-center justify-start pt-2 rounded ${
                      day === null ? "bg-gray-50" : "bg-white"
                    } ${hasEvent ? "relative" : ""}`}
                  >
                    {day && (
                      <>
                        <div>{day}</div>
                        {hasEvent && (
                          <span className="w-1.5 h-1.5 bg-blue-900 rounded-full mt-1"></span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 오른쪽 일정 리스트 */}
        <div className="w-1/2 border rounded p-5 text-[17px] leading-7">
          <h2 className="text-xl font-bold mb-4">📌 일정</h2>
          {filteredEvents.length === 0 ? (
            <div className="text-gray-500">등록된 일정이 없습니다.</div>
          ) : (
            <ul className="space-y-4">
              {filteredEvents.map((e, idx) => (
                <li key={idx} className="flex gap-6 items-start">
                  <span className="text-blue-800 font-semibold min-w-[110px]">
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
