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
  const [goTarget, setGoTarget] = useState(null); // 이동할 정보 저장

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
    if (userId) {
      fetchQnaInfo();
    }
  }, [userId, keyword]);

  const fetchQnaInfo = async () => {
    try {
      const data = await getQnaList();
      console.log(data);
      const filtered = keyword
      ? data.filter(
          (n) => n.title.includes(keyword) || n.content.includes(keyword)
        )
      : data;
      setQnaInfo(filtered);
    } catch (error) {
      setMessage("Q&A 정보를 불러올 수 없습니다.");
    }
  };

  const fetchWriterId = async (id) => {
    try {
      const data = await getWriterId(id);
      return data;
    } catch (error) {
      setMessage("작성자 정보를 불러올 수 없습니다.");
    }
  };

  const setAlertData = (modalType, modalMsg, target = null) => {
    setType(modalType);
    setMsg(modalMsg);
    setGoTarget(target); // navigate 정보 저장
    setAlertModalOpen(true);
  };

  const handleClose = () => {
    setAlertModalOpen(false);
    if (goTarget) {
      navigate("/main/qnadata", {
        state: goTarget,
      });
      setGoTarget(null); // navigate 초기화
    }
  };

  const handlePage = (page) => {
    setCurrentPage(page);
  };

  const lastItem = currentPage * itemCount;
  const firstItem = lastItem - itemCount;
  const currentItem = qnaInfo.slice(firstItem, lastItem);
  const totalPage = Math.ceil(qnaInfo.length / itemCount);

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
      <h1 className="text-3xl font-bold text-center mb-6">Q&A</h1>
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
        <table className="table-auto border-collapse border border-gray-400 w-full border-x-0">
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
              <th className="border border-blue-800 border-x-0 px-4 py-2">
                상태
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItem.length > 0 ? (
              currentItem.map((qna, i) => (
                <tr
                  key={i}
                  className={`text-center ${
                    i % 2 === 0
                      ? "hover:bg-blue-100 bg-blue-50"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <td className="border border-gray-400 px-4 py-2 border-x-0">
                    {firstItem + i + 1}
                  </td>
                  <td className="text-left border border-gray-400 px-4 py-2 border-x-0">
                    {/\u{1F512}/u.test(qna.title) ? (
                      <p
                        className="text-gray-400 cursor-pointer"
                        onClick={async () => {
                          let writerId = await fetchWriterId(qna.questionId);
                          const target = {
                            questionId: qna.questionId,
                            page: currentPage,
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
                        }}
                      >
                        {qna.title}
                      </Link>
                    )}
                  </td>
                  <td className="border border-gray-400 px-4 py-2 border-x-0">
                    {qna.userName}
                  </td>
                  <td className="border border-gray-400 px-4 py-2 border-x-0">
                    {qna.createdAt}
                  </td>
                  <td className="border border-gray-400 px-4 py-2 border-x-0">
                    {qna.viewCount}
                  </td>
                  <td
                    className={
                      qna.status === "미답변"
                        ? "text-red-500 border border-gray-400 px-4 py-2 border-x-0"
                        : "border border-gray-400 px-4 py-2 border-x-0"
                    }
                  >
                    {qna.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-4">
                  Q&A 정보를 불러오는 중...
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
      {userRole !== "ADMIN" && (
        <div className="flex justify-end mt-4">
          <Link
            to="/main/qnawrite"
            className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-3 rounded transition float-right"
          >
            &nbsp;등록&nbsp;
          </Link>
        </div>
      )}
      {/* 메시지 모달 */}
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
