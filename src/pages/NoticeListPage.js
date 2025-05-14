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
  const [inputKeyword, setInputKeyword] = useState("");
  
  useEffect(() => {
    if (userId) {
      fetchNoticeInfo();
    }
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
    } catch (error) {
      setMessage("공지 정보를 불러올 수 없습니다.");
    }
  };

  const handlePage = (page) => {
    setCurrentPage(page);
  };

  // 고정 처리
  const pinned = noticeInfo.filter((i) => i.pin === 1);
  const unpinned = noticeInfo.filter((i) => i.pin !== 1);

  // 페이징 처리
  const lastItem = currentPage * itemCount;
  const firstItem = lastItem - itemCount;
  const currentItem = unpinned.slice(firstItem, lastItem);
  const totalPage = Math.ceil(unpinned.length / itemCount);

  // 검색 처리
  const handleKeyword = () => {
    const userInputData = document.getElementById('searchKeyword').value;
    setInputKeyword(userInputData);
  }

  const handleSearch = async (searchKeyword) => {
      setKeyword(searchKeyword);
  };
  
  return (
    <div className="max-w-7xl mx-auto p-8 bg-white shadow-md rounded-md mt-10">
      <h1 className="text-3xl font-bold text-center mb-6">공지사항</h1>
      {keyword && (
        <p className="text-sm text-center text-gray-600 mb-2">
          🔍 "<span className="font-semibold">{keyword}</span>" 관련 검색
          결과입니다.
        </p>
      )}

      <div className="flex justify-end mb-6">
        <input
          type="text"
          placeholder="검색어 입력"
          id="searchKeyword"
          className="px-3 py-2 w-64 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleKeyword}
        />
        <button
          onClick={() => handleSearch(inputKeyword)}
          className="px-5 py-2 ml-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold"
        >
          검색 🔍
        </button>
      </div>

      {message && <p className="text-red-500 text-center">{message}</p>}
      <hr />
      <br />
      <div>
        <table className="table-auto border-collapse w-full">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="border border-blue-800 border-x-0 px-4 py-2">
                번호
              </th>
              <th className="border border-blue-800 border-x-0 px-4 py-2">
                제목
              </th>
              <th className="border border-blue-800 border-x-0 px-4 py-2">
                작성자
              </th>
              <th className="border border-blue-800 border-x-0 px-4 py-2">
                작성일
              </th>
              <th className="border border-blue-800 border-x-0 px-4 py-2">
                조회수
              </th>
            </tr>
          </thead>
          <tbody>
            {pinned || currentItem.length > 0 ? (
              [...pinned, ...currentItem].map((notice, i) => {
                const cellStyle =
                  notice.pin === 1
                    ? "text-center hover:bg-blue-100 bg-blue-50"
                    : "text-center hover:bg-gray-100";

                return (
                  <tr key={i} className={cellStyle}>
                    <td className="border border-gray-400 border-x-0 px-4 py-2">
                      {notice.pin === 1
                        ? "\u{1F4CC}"
                        : firstItem + i + 1 - pinned.length}
                    </td>
                    <td
                      className={
                        notice.pin === 1
                          ? `font-bold text-left border border-gray-400 border-x-0 px-4 py-2`
                          : `text-left border border-gray-400 border-x-0 px-4 py-2`
                      }
                    >
                      <Link
                        to="/main/noticedata"
                        state={{
                          noticeId: notice.noticeId,
                          page: currentPage,
                        }}
                      >
                        {notice.title}
                      </Link>
                    </td>
                    <td className="border border-gray-400 border-x-0 px-4 py-2">
                      관리자
                    </td>
                    <td className="border border-gray-400 border-x-0 px-4 py-2">
                      {notice.noticeDate}
                    </td>
                    <td className="border border-gray-400 border-x-0 px-4 py-2">
                      {notice.viewCount}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-4">
                  공지 정보를 불러오는 중...
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <PageComponent
          currentPage={currentPage}
          totalPage={totalPage}
          onPageChange={handlePage}
        />
      </div>
      <br />
      {userRole === "ADMIN" && (
        <div className="flex justify-end mt-4">
          <Link
            to="/main/noticewrite"
            className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-3 rounded transition"
          >
            &nbsp;등록&nbsp;
          </Link>
        </div>
      )}
    </div>
  );
};

export default NoticeListPage;
