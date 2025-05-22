import React from "react";

const BaseModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-4 w-5/6 max-w-sm sm:p-6 sm:w-full sm:max-w-2xl rounded-xl max-h-[90vh] overflow-y-auto shadow-2xl relative mx-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-4xl"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default BaseModal;