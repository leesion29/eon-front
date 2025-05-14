import React from "react";

const UnauthorizedPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-8 py-32 bg-white shadow-md rounded-md mt-24">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <img
          src="/images/eonLogo.jpg"
          alt="로고"
          className="w-24 h-24 rounded-full shadow mb-4"
        />
        <h1 className="text-3xl font-bold text-red-600">⛔ 접근이 제한되었습니다</h1>
        <div className="text-gray-700 text-lg leading-relaxed">
          <p>이 페이지에 접근할 수 있는 권한이 없습니다.</p>
          <p>로그인 정보 또는 접근 권한을 확인해 주세요.</p>
        </div>
        <a
          href="/main"
          className="mt-6 inline-block bg-blue-600 text-white text-sm px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          메인 페이지로 이동
        </a>
      </div>
    </div>
  );
};

export default UnauthorizedPage;