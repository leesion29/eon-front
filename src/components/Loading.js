import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-60">
      <h3 className="mb-2">잠시만 기다려주세요</h3>
      <img src="/loading.gif" alt="Loading..." className="w-16 h-16" />
    </div>
  );
};

export default Loading;
