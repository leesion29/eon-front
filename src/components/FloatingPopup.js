import React, { useRef } from "react";
import Draggable from "react-draggable";
import { useNavigate } from "react-router-dom";

const FloatingPopup = ({ subjects, isMobileView }) => {
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

  const isMobile = isMobileView;

  const rootClasses = isMobile
    ? "w-full p-3 bg-white shadow-lg rounded-md cursor-move z-10" // 모바일: 부모 너비 전체 사용, 패딩 12px
    : "fixed top-6 right-6 z-50 bg-white shadow-lg rounded-xl p-4 w-72 cursor-move"; // 데스크탑

  const headerContainerClasses = `flex items-center justify-between ${
    isMobile ? "mb-2" : "mb-3"
  }`;

  const titleClasses = `font-semibold ${
    isMobile ? "text-sm" : "text-base"
  }`;

  const buttonClasses = `${
    isMobile ? "text-lg" : "text-xl"
  } hover:scale-110 transition`;

  const listClasses = `${
    isMobile
      ? "text-sm max-h-32"
      : "text-sm max-h-40"
  } overflow-y-auto pr-1 mb-2`;

  const listItemClasses = isMobile
    ? "break-words" // 모바일에서 긴 텍스트 줄바꿈 허용
    : "";

  const totalTextClasses = `text-gray-500 ${
    isMobile ? "text-xs" : "text-xs"
  }`;

  return (
    <Draggable nodeRef={nodeRef}>
      <div ref={nodeRef} className={rootClasses}>
        <div className={headerContainerClasses}>
          <h4 className={titleClasses}>📚 신청 과목</h4>
          <button
            onClick={() => navigate("/main/schedule")}
            className={buttonClasses}
            title="시간표 확인하기"
          >
            📘📘📘
          </button>
        </div>
        <ul className={listClasses}>
          {sortedSubjects.map((subj, idx) => (
            <li key={idx} className={listItemClasses}>
              • {subj.courseName} ({subj.classDay}, {subj.classStartPeriod} ~{" "}
              {subj.classEndPeriod}교시)
            </li>
          ))}
        </ul>
        <p className={totalTextClasses}>총 {subjects.length} 과목 신청</p>
      </div>
    </Draggable>
  );
};

export default FloatingPopup;