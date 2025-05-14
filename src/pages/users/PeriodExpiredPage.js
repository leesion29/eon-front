import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PeriodExpiredPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const message =
    location.state?.message || "현재는 해당 기능을 이용할 수 있는 기간이 아닙니다.";

  return (
    <div className="max-w-3xl mx-auto p-10 mt-24 bg-white shadow-lg rounded-2xl">
      <div className="flex flex-col items-center text-center space-y-8">
        <img
          src="/images/eonLogo.jpg"
          alt="이온대학교 로고"
          className="w-28 h-28 rounded-full shadow-md"
        />
        <h1 className="text-3xl font-extrabold text-red-600">
          접근이 제한되었습니다.
        </h1>
        <p className="text-gray-600 text-base">{message}</p>
        <button
          onClick={() => navigate("/main")}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md shadow transition"
        >
          메인으로 이동하기
        </button>
      </div>
    </div>
  );
};

export default PeriodExpiredPage;