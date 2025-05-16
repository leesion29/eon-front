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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.keyword]);

  useEffect(() => {
    if (userId) {
      fetchNoticeInfo();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, keyword]);

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

  const handleKeyword = () => {
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
    <div className="max-w-7xl mx-auto p-3 bg-white shadow-md rounded-md mt-4">
      <h1 className="text-lg font-bold text-center mb-3">공지사항</h1>
      {keyword && (
        <p className="text-[10px] text-center text-gray-600 mb-2">
          🔍 "<span className="font-semibold">{keyword}</span>" 관련 검색
          결과입니다.
        </p>
      )}

      <div className="flex flex-col xs:flex-row justify-end items-center mb-3 gap-1.5 xs:gap-2">
        <input
          type="text"
          placeholder="검색어 입력"
          id="searchKeyword"
          value={inputKeyword}
          className="px-2 py-1 w-full xs:w-40 sm:w-48 md:w-56 border border-gray-300 rounded shadow-sm text-[10px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          onChange={handleKeyword}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSearch}
          className="px-3 py-1 w-full xs:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm text-[10px] sm:text-xs font-semibold"
        >
          검색 🔍
        </button>
      </div>

      {message && <p className="text-red-500 text-center py-1 text-[10px]">{message}</p>}
      <hr className="my-2"/>
      
      <div className="w-full">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col style={{ width: '10%' }} /> 
            <col style={{ width: '35%' }} /> 
            <col style={{ width: '18%' }} /> 
            <col style={{ width: '22%' }} /> 
            <col style={{ width: '15%' }} /> 
          </colgroup>
          <thead className="bg-blue-800 text-white text-[9px] xs:text-[10px] sm:text-xs">
            <tr>
              <th className="px-0.5 py-1 text-center font-medium">번호</th>
              <th className="px-0.5 py-1 text-left font-medium">제목</th>
              <th className="px-0.5 py-1 text-center font-medium">작성자</th>
              <th className="px-0.5 py-1 text-center font-medium">작성일</th>
              <th className="px-0.5 py-1 text-center font-medium">조회수</th>
            </tr>
          </thead>
          <tbody className="text-[9px] xs:text-[10px] sm:text-xs">
            {(pinned.length > 0 || currentItem.length > 0) ? (
              [...pinned, ...currentItem].map((notice, i) => {
                const isPinned = notice.pin === 1;
                const displayItemNumber = isPinned ? "📌" : (firstItem + (i - pinned.length) + 1);

                return (
                  <tr key={notice.noticeId || i} className={`${isPinned ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"} border-b border-gray-200`}>
                    <td className={`px-0.5 py-1 text-center align-middle ${isPinned ? "font-semibold text-blue-600" : ""}`}>{displayItemNumber}</td>
                    <td className={`px-0.5 py-1 text-left align-middle ${isPinned ? "font-bold" : ""} break-words`}>
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
                    <td className="px-0.5 py-1 text-center align-middle break-keep overflow-hidden whitespace-nowrap text-ellipsis">{notice.writer || "관리자"}</td>
                    <td className="px-0.5 py-1 text-center align-middle whitespace-nowrap">{notice.noticeDate}</td>
                    <td className="px-0.5 py-1 text-center align-middle">{notice.viewCount}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-6 text-xs sm:text-sm">
                  {message || "공지사항이 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPage > 0 && (
        <div className="mt-3">
          <PageComponent
            currentPage={currentPage}
            totalPage={totalPage}
            onPageChange={handlePage}
          />
        </div>
      )}
      
      {userRole === "ADMIN" && (
        <div className="flex justify-end mt-3">
          <Link
            to="/main/noticewrite"
            className="bg-blue-500 hover:bg-blue-700 text-white text-[9px] xs:text-[10px] sm:text-xs font-semibold py-1 px-2 sm:py-1.5 sm:px-3 rounded-md transition"
          >
            등록
          </Link>
        </div>
      )}
    </div>
  );
};

export default NoticeListPage;