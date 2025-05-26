import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PageComponent from "../components/PageComponent";
import { useSelector } from "react-redux";
import { getList } from "../api/noticeApi";

const NoticeListPage = () => {
  const [message, setMessage] = useState("");
  const [noticeInfo, setNoticeInfo] = useState([]);
  const location = useLocation();
  const checkPage = location.state?.page ?? 1;
  const [keyword, setKeyword] = useState(location.state?.keyword || "");
  const [currentPage, setCurrentPage] = useState(checkPage);
  const itemCount = 10;

  const userId = useSelector((state) => state.auth?.userId);
  const userRole = useSelector((state) => state.auth?.userRole);
  const [inputKeyword, setInputKeyword] = useState(location.state?.keyword || "");

  useEffect(() => {
    if (location.state?.keyword && location.state.keyword !== inputKeyword) {
        setInputKeyword(location.state.keyword);
    }
  }, [location.state?.keyword, inputKeyword]); // inputKeyword를 의존성 배열에 추가하는 것이 좋을 수 있습니다.

  useEffect(() => {
    if (userId) {
      fetchNoticeInfo();
    }
  }, [userId, keyword, currentPage]);

  const fetchNoticeInfo = async () => {
    try {
      const res = await getList();
      const all = res.data;
      const filtered = keyword
        ? all.filter(
            (n) => n.title.includes(keyword) || n.content.includes(keyword)
          )
        : all;
      setNoticeInfo(filtered);
      if (filtered.length === 0 && keyword) {
        setMessage(`"${keyword}" 관련 검색 결과가 없습니다.`);
      } else if (filtered.length === 0 && !keyword) {
        setMessage("등록된 공지사항이 없습니다.");
      }
      else {
        setMessage("");
      }
    } catch (error) {
      setMessage("공지 정보를 불러올 수 없습니다.");
      setNoticeInfo([]);
    }
  };

  const handlePage = (page) => {
    setCurrentPage(page);
  };

  const pinned = noticeInfo.filter((i) => i.pin === 1);
  const unpinned = noticeInfo.filter((i) => i.pin !== 1);

  const lastItem = currentPage * itemCount;
  const firstItem = lastItem - itemCount;
  const currentItem = unpinned.slice(firstItem, lastItem);
  const totalPage = Math.ceil(unpinned.length / itemCount);

  const handleKeywordChange = () => {
    const userInputData = document.getElementById('searchKeyword').value;
    setInputKeyword(userInputData);
  }

  const handleSearch = () => {
    setKeyword(inputKeyword);
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-3 md:p-6 bg-white shadow-md rounded-md mt-2 sm:mt-3 md:mt-6">
      <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-center mb-1.5 sm:mb-2 md:mb-3 lg:mb-4">공지사항</h1>
      {keyword && (
        <p className="text-[9px] sm:text-[10px] md:text-xs text-center text-gray-600 mb-1 sm:mb-1.5 md:mb-2 lg:mb-3">
          🔍 "<span className="font-semibold">{keyword}</span>" 관련 검색 결과입니다.
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-end items-center mb-1.5 sm:mb-2 md:mb-3 lg:mb-4 gap-1 sm:gap-1.5">
      <input
          type="text"
          placeholder="검색어 입력"
          id="searchKeyword"
          value={inputKeyword}
          className="px-2 py-1 w-full text-[10px] sm:text-xs md:text-sm sm:w-48 md:w-56 lg:w-64 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          onChange={handleKeywordChange}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSearch}
          className="px-3 py-1 w-full text-[10px] sm:text-xs md:text-sm sm:w-auto whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm font-semibold"
        >
          검색 🔍
        </button>
      </div>

      {message && <p className="text-red-500 text-center py-0.5 text-[9px] sm:text-[10px]">{message}</p>}
      <hr className="my-1 sm:my-1.5 md:my-2 lg:my-3"/>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            <col className="w-[12%] sm:w-[10%] md:w-[8%] lg:w-[6%]" />
            <col className="w-auto min-w-[100px] sm:min-w-0 sm:w-auto" />
            <col className="w-[20%] sm:w-[18%] md:w-[15%] lg:w-[12%]" />
            <col className="w-[25%] sm:w-[22%] md:w-[20%] lg:w-[15%]" />
            <col className="w-[15%] sm:w-[12%] md:w-[10%] lg:w-[8%]" />
          </colgroup>
          <thead className="bg-blue-800 text-white text-[8px] xs:text-[9px] sm:text-xs md:text-sm">
            <tr>
              <th className="py-0.5 px-px sm:py-1 sm:px-1.5 md:py-1.5 md:px-2 text-center font-normal sm:font-medium whitespace-nowrap">번호</th>
              <th className="py-0.5 px-px sm:py-1 sm:px-1.5 md:py-1.5 md:px-2 text-center font-normal sm:font-medium whitespace-nowrap">제목</th>
              <th className="py-0.5 px-px sm:py-1 sm:px-1.5 md:py-1.5 md:px-2 text-center font-normal sm:font-medium whitespace-nowrap">작성자</th>
              <th className="py-0.5 px-px sm:py-1 sm:px-1.5 md:py-1.5 md:px-2 text-center font-normal sm:font-medium whitespace-nowrap">작성일</th>
              <th className="py-0.5 px-px sm:py-1 sm:px-1.5 md:py-1.5 md:px-2 text-center font-normal sm:font-medium whitespace-nowrap">조회수</th>
            </tr>
          </thead>
          <tbody className="text-[8px] xs:text-[9px] sm:text-xs md:text-sm">
            {(pinned.length > 0 || currentItem.length > 0) ? (
              [...pinned, ...currentItem].map((notice, i) => {
                const isPinned = notice.pin === 1;
                const displayItemNumber = isPinned ? "📌" : (firstItem + (i - pinned.length) + 1);

                return (
                  <tr key={notice.noticeId || i} className={`${isPinned ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"} border-b border-gray-300`}>
                    <td className={`py-0.5 px-px sm:py-1 sm:px-1.5 md:py-1.5 md:px-2 text-center align-middle ${isPinned ? "font-semibold text-blue-600" : ""}`}>{displayItemNumber}</td>
                    <td className={`py-0.5 px-px sm:py-1 sm:px-1.5 md:py-2 md:px-2 text-left align-middle break-words ${isPinned ? "font-bold" : ""}`}>
                      <Link
                        to="/main/noticedata"
                        state={{
                          noticeId: notice.noticeId,
                          page: currentPage,
                          keyword: keyword,
                        }}
                        className="hover:text-blue-600"
                      >
                        {notice.title}
                      </Link>
                    </td>
                    <td className="py-0.5 px-px sm:py-1 sm:px-1.5 md:py-1.5 md:px-2 text-center align-middle break-words sm:break-keep sm:overflow-hidden sm:whitespace-nowrap sm:text-ellipsis">{notice.writer || "관리자"}</td>
                    <td className="py-0.5 px-px sm:py-1 sm:px-1.5 md:py-1.5 md:px-2 text-center align-middle whitespace-nowrap">{notice.noticeDate}</td>
                    <td className="py-0.5 px-px sm:py-1 sm:px-1.5 md:py-1.5 md:px-2 text-center align-middle">{notice.viewCount}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-4 sm:py-6 md:py-8 text-[9px] sm:text-xs">
                  {message || "공지사항이 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPage > 0 && (
        <div className="mt-1.5 sm:mt-2 md:mt-3 lg:mt-4">
          <PageComponent
            currentPage={currentPage}
            totalPage={totalPage}
            onPageChange={handlePage}
          />
        </div>
      )}

      {userRole === "ADMIN" && (
        <div className="flex justify-end mt-1.5 sm:mt-2 md:mt-3">
          <Link
            to="/main/noticewrite"
            className="bg-blue-500 hover:bg-blue-700 text-white text-[8px] xs:text-[9px] sm:text-xs font-semibold py-0.5 px-1 sm:py-1 sm:px-1.5 md:py-1.5 md:px-2 lg:py-2 lg:px-3 rounded-sm sm:rounded-md transition"
          >
            등록
          </Link>
        </div>
      )}
    </div>
  );
};

export default NoticeListPage;