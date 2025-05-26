import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PageComponent from "../components/PageComponent";
import AlertModal from "../components/AlertModal";
import { getQnaList, getWriterId } from "../api/qnaApi";

const QnaListPage = () => {
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [type, setType] = useState("");
  const [msg, setMsg] = useState("");
  const [goTarget, setGoTarget] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const userId = useSelector((state) => state.auth?.userId);
  const userRole = useSelector((state) => state.auth?.userRole);
  const [inputKeyword, setInputKeyword] = useState("");
  const [keyword, setKeyword] = useState("");

  const [message, setMessage] = useState("");
  const [qnaInfo, setQnaInfo] = useState([]);
  const checkPage = location.state?.page ?? 1;
  const [currentPage, setCurrentPage] = useState(checkPage);
  const itemCount = 15;

  useEffect(() => {
    if (location.state?.keyword && location.state.keyword !== inputKeyword) {
      setInputKeyword(location.state.keyword);
    }
  }, [location.state?.keyword]);

  useEffect(() => {
    if (userId) {
      fetchQnaInfo();
    }
  }, [userId, keyword, currentPage]);

  const fetchQnaInfo = async () => {
    try {
      const data = await getQnaList();
      const filtered = keyword
        ? data.filter(
            (n) => n.title.includes(keyword) || n.content.includes(keyword)
          )
        : data;
      setQnaInfo(filtered);
      if (filtered.length === 0 && keyword) {
        setMessage(`"${keyword}" 관련 검색 결과가 없습니다.`);
      } else if (filtered.length === 0 && !keyword) {
        setMessage("등록된 Q&A가 없습니다.");
      } else {
        setMessage("");
      }
    } catch (error) {
      setMessage("Q&A 정보를 불러올 수 없습니다.");
      setQnaInfo([]);
    }
  };

  const fetchWriterId = async (id) => {
    try {
      const data = await getWriterId(id);
      return data;
    } catch (error) {
      console.error("작성자 정보 로딩 실패:", error);
    }
  };

  const setAlertData = (modalType, modalMsg, target = null) => {
    setType(modalType);
    setMsg(modalMsg);
    setGoTarget(target);
    setAlertModalOpen(true);
  };

  const handleClose = () => {
    setAlertModalOpen(false);
    if (goTarget) {
      navigate("/main/qnadata", {
        state: goTarget,
      });
      setGoTarget(null);
    }
  };

  const handlePage = (page) => {
    setCurrentPage(page);
  };

  const lastItem = currentPage * itemCount;
  const firstItem = lastItem - itemCount;
  const currentItem = qnaInfo.slice(firstItem, lastItem);
  const totalPage = Math.ceil(qnaInfo.length / itemCount);

  const handleKeywordChange = () => {
    const userInputData = document.getElementById("searchKeyword").value;
    setInputKeyword(userInputData);
  };

  const handleSearch = () => {
    setKeyword(inputKeyword);
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 bg-white shadow-md rounded-md mt-4 sm:mt-6 md:mt-8">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-3 sm:mb-4 md:mb-5">
        Q&A
      </h1>
      {keyword && (
        <p className="text-[10px] sm:text-xs md:text-sm text-center text-gray-600 mb-2 sm:mb-3 md:mb-4">
          🔍 "<span className="font-semibold">{keyword}</span>" 관련 검색
          결과입니다.
        </p>
      )}
      <div className="flex flex-col sm:flex-row sm:justify-end items-center mb-3 sm:mb-4 md:mb-5 gap-1.5 sm:gap-2">
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

      {message && !alertModalOpen && (
        <p className="text-red-500 text-center py-1 text-[10px] sm:text-xs">
          {message}
        </p>
      )}
      <hr className="my-2 sm:my-3 md:my-4" />

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            <col className="w-[10%] sm:w-[8%] md:w-[7%] lg:w-[6%]" />
            <col className="w-[35%] sm:w-auto" />
            <col className="w-[15%] sm:w-[15%] md:w-[15%] lg:w-[12%]" />
            <col className="w-[20%] sm:w-[20%] md:w-[15%]" />
            <col className="w-[10%] sm:w-[12%] md:w-[10%] lg:w-[8%]" />
            <col className="w-[10%] sm:w-[10%] md:w-[10%] lg:w-[8%]" />
          </colgroup>
          <thead className="bg-blue-800 text-white text-[8px] sm:text-[10px] md:text-xs lg:text-sm">
            <tr>
              <th className="py-0.5 px-0.5 sm:py-1 sm:px-1.5 md:py-1.5 md:px-2 text-center font-normal sm:font-medium whitespace-nowrap">
                번호
              </th>
              <th className="py-0.5 px-0.5 sm:py-1 sm:px-1.5 md:py-1.5 md:px-2 text-center font-normal sm:font-medium whitespace-nowrap">
                제목
              </th>
              <th className="py-0.5 px-0.5 sm:py-1 sm:px-1.5 md:py-1.5 md:px-2 text-center font-normal sm:font-medium whitespace-nowrap">
                작성자
              </th>
              <th className="py-0.5 px-0.5 sm:py-1 sm:px-1.5 md:py-1.5 md:px-2 text-center font-normal sm:font-medium whitespace-nowrap">
                작성일
              </th>
              <th className="py-0.5 px-0.5 sm:py-1 sm:px-1.5 md:py-1.5 md:px-2 text-center font-normal sm:font-medium whitespace-nowrap">
                조회수
              </th>
              <th className="py-0.5 px-0.5 sm:py-1 sm:px-1.5 md:py-1.5 md:px-2 text-center font-normal sm:font-medium whitespace-nowrap">
                상태
              </th>
            </tr>
          </thead>
          <tbody className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm">
            {currentItem.length > 0 ? (
              currentItem.map((qna, i) => {
                const isSecret = /\u{1F512}/u.test(qna.title);
                const rowClass =
                  i % 2 === 0
                    ? "bg-blue-50 hover:bg-blue-100"
                    : "bg-white hover:bg-gray-100";

                return (
                  <tr
                    key={qna.questionId || i}
                    className={`${rowClass} border-b border-gray-300`}
                  >
                    <td className="py-0.5 px-0.5 sm:py-1 sm:px-1.5 md:py-2 md:px-2 text-center align-middle">
                      {firstItem + i + 1}
                    </td>
                    <td className="py-0.5 px-0.5 sm:py-1 sm:px-1.5 md:py-2 md:px-2 text-left align-middle break-words">
                      {isSecret ? (
                        <p
                          className="text-gray-500 hover:text-gray-700 cursor-pointer flex items-center"
                          onClick={async () => {
                            let writerId = await fetchWriterId(qna.questionId);
                            const target = {
                              questionId: qna.questionId,
                              page: currentPage,
                              keyword: keyword,
                            };
                            if (String(userId) === String(writerId)) {
                              setAlertData(
                                "success",
                                "본인 확인 완료! 글을 조회합니다.",
                                target
                              );
                            } else if (userRole !== "STUDENT") {
                              setAlertData(
                                "success",
                                "권한 확인 완료! 글을 조회합니다.",
                                target
                              );
                            } else {
                              setAlertData(
                                "error",
                                "읽을 수 있는 권한이 없습니다."
                              );
                            }
                          }}
                        >
                          🔒 비밀글입니다.
                        </p>
                      ) : (
                        <Link
                          to="/main/qnadata"
                          state={{
                            questionId: qna.questionId,
                            page: currentPage,
                            keyword: keyword,
                          }}
                          className="hover:text-blue-600"
                        >
                          {qna.title}
                        </Link>
                      )}
                    </td>
                    <td className="py-0.5 px-0.5 sm:py-1 sm:px-1.5 md:py-2 md:px-2 text-center align-middle break-words sm:break-keep sm:overflow-hidden sm:whitespace-nowrap sm:text-ellipsis">
                      {qna.userName || "익명"}
                    </td>
                    <td className="py-0.5 px-0.5 sm:py-1 sm:px-1.5 md:py-2 md:px-2 text-center align-middle whitespace-nowrap">
                      {qna.createdAt}
                    </td>
                    <td className="py-0.5 px-0.5 sm:py-1 sm:px-1.5 md:py-2 md:px-2 text-center align-middle">
                      {qna.viewCount}
                    </td>
                    <td
                      className={`py-0.5 px-0.5 sm:text-xs sm:py-1 sm:px-1.5 md:text-sm md:py-2 md:px-2 text-center align-middle break-words ${
                        qna.status === "미답변" ? "text-red-500" : "text-black"
                      }`}
                    >
                      {qna.status === "답변완료" ? (
                        <>
                          {/* 모바일용 */}
                          <span className="sm:hidden">
                            완료
                          </span>
                          {/* 웹용 */}
                          <span className="hidden sm:inline">{qna.status}</span>
                        </>
                      ) : (
                        qna.status
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-gray-500 py-4 sm:py-6 md:py-8 text-[9px] sm:text-xs"
                >
                  {message || "Q&A가 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPage > 0 && (
        <div className="mt-2 sm:mt-3 md:mt-4">
          <PageComponent
            currentPage={currentPage}
            totalPage={totalPage}
            onPageChange={handlePage}
          />
        </div>
      )}

      {userRole !== "ADMIN" && (
        <div className="flex justify-end mt-2 sm:mt-3 md:mt-4">
          <Link
            to="/main/qnawrite"
            className="bg-blue-500 hover:bg-blue-700 text-white text-[9px] sm:text-[10px] md:text-xs font-semibold py-1 px-1.5 sm:py-1.5 sm:px-2 md:py-2 md:px-3 rounded-md transition"
          >
            등록
          </Link>
        </div>
      )}

      <AlertModal
        isOpen={alertModalOpen}
        message={msg}
        onClose={handleClose}
        type={type}
      />
    </div>
  );
};

export default QnaListPage;
