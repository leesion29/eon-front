import React, { useRef } from "react";
import Draggable from "react-draggable";
import { useNavigate } from "react-router-dom";

const FloatingPopup = ({ subjects }) => {
  const navigate = useNavigate();
  const nodeRef = useRef(null);

  const dayOrder = {
    월: 1,
    화: 2,
    수: 3,
    목: 4,
    금: 5,
    토: 6,
    일: 7,
  };

  const sortedSubjects = [...subjects].sort((a, b) => {
    const dayA = dayOrder[a.classDay] || 99;
    const dayB = dayOrder[b.classDay] || 99;
    if (dayA !== dayB) return dayA - dayB;
    return a.classStartPeriod - b.classStartPeriod;
  });

  return (
    <Draggable nodeRef={nodeRef}>
      <div
        ref={nodeRef}
        className="fixed top-6 right-6 z-50 bg-white shadow-lg rounded-xl p-4 w-72 cursor-move"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-base">📚 신청 과목</h4>
          <button
            onClick={() => navigate("/main/schedule")}
            className="text-xl hover:scale-110 transition"
            title="시간표 확인하기"
          >
            📘📘📘
          </button>
        </div>
        <ul className="text-sm max-h-40 overflow-y-auto pr-1 mb-2">
          {sortedSubjects.map((subj, idx) => (
            <li key={idx}>
              • {subj.courseName} ({subj.classDay}, {subj.classStartPeriod} ~ {subj.classEndPeriod}교시)
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500">총 {subjects.length} 과목 신청</p>
      </div>
    </Draggable>
  );
};

export default FloatingPopup;