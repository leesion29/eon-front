import React from "react";

const PageComponent = ({ currentPage, totalPage, onPageChange }) => {
  if (totalPage < 1) return null;

  const visiblePages = 5;

  const generatePages = () => {
    const pages = [];
    const half = Math.floor(visiblePages / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPage, currentPage + half);

    if (currentPage <= half) {
      end = Math.min(totalPage, visiblePages);
    } else if (currentPage + half > totalPage) {
      start = Math.max(1, totalPage - visiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pages = generatePages();
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPage;

  return (
    <div className="flex justify-center mt-6 gap-2 text-sm text-gray-700">
      <button
        disabled={isFirst}
        onClick={() => onPageChange(1)}
        className={`w-8 h-8 border rounded transition ${
          isFirst
            ? "bg-white text-gray-300 cursor-not-allowed"
            : "bg-white hover:bg-blue-100"
        }`}
      >
        ◀
      </button>

      <button
        disabled={isFirst}
        onClick={() => onPageChange(currentPage - 1)}
        className={`w-8 h-8 border rounded transition ${
          isFirst
            ? "bg-white text-gray-300 cursor-not-allowed"
            : "bg-white hover:bg-blue-100"
        }`}
      >
        〈
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 border rounded flex items-center justify-center transition ${
            page === currentPage
              ? "bg-blue-600 text-white font-bold"
              : "bg-white hover:bg-blue-100"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        disabled={isLast}
        onClick={() => onPageChange(currentPage + 1)}
        className={`w-8 h-8 border rounded transition ${
          isLast
            ? "bg-white text-gray-300 cursor-not-allowed"
            : "bg-white hover:bg-blue-100"
        }`}
      >
        〉
      </button>

      <button
        disabled={isLast}
        onClick={() => onPageChange(totalPage)}
        className={`w-8 h-8 border rounded transition ${
          isLast
            ? "bg-white text-gray-300 cursor-not-allowed"
            : "bg-white hover:bg-blue-100"
        }`}
      >
        ▶
      </button>
    </div>
  );
};

export default PageComponent;
