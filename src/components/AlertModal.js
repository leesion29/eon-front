import React, { useEffect, useRef } from "react";

const AlertModal = ({ isOpen, message, onClose, type = "success" }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { once: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalType = type === "success" ? "success" : "error";
  const gifSrc = `/images/${modalType}.gif`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
        <img src={gifSrc} alt={modalType} className="w-20 h-20 mx-auto mb-4" />
        <p className="mb-4 whitespace-pre-line">
          {typeof message === "string"
            ? message
            : typeof message === "object"
            ? JSON.stringify(message, null, 2)
            : "알 수 없는 오류가 발생했습니다."}
        </p>
        <button
          ref={buttonRef}
          autoFocus
          onClick={onClose}
          className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
