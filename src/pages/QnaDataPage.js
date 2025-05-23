import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QnaAnswerWritePage from "../pages/Admin/AdminQnaAnswerWritePage";
import AlertModal from "../components/AlertModal";
import BaseModal from "../components/BaseModal";
import ConfirmModal from "../components/ConfirmModal";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import { deleteAns, deleteQna, getQnaDetail, getWriterId, increaseViewCount } from "../api/qnaApi";

const QnaDataPage = () => {
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [baseModalOpen, setBaseModalOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [type, setType] = useState("error");
  const [goTarget, setGoTarget] = useState(null);
  const [props, setProps] = useState();
  const [writerId, setWriterId] = useState();
  const [message, setMessage] = useState("");
  const [contentInfo, setContentInfo] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const questionId = location.state?.questionId;
  const currentPage = location.state?.page;
  const userId = useSelector((state) => state.auth?.userId);
  const userRole = useSelector((state) => state.auth?.userRole);

  const handleClose = () => {
    setAlertModalOpen(false);
    setConfirmModalOpen(false);
    setBaseModalOpen(false);
    if (goTarget) {
      navigate(goTarget.path, goTarget.options || {});
      setGoTarget(null);
    } else {
      window.location.reload();
    }
  };

  const handleView = useCallback(async () => {
    try {
      increaseViewCount(questionId);
    } catch (error) {
      console.log("조회수 증가 실패");
    }
  }, [questionId]);

  useEffect(() => {
    handleView();
    const localQnaNumber = localStorage.getItem("No.");
    if (questionId) {
      localStorage.setItem("No.", questionId);
      fetchContentInfo(questionId);
      fetchWriterId(questionId);
    } else if (localQnaNumber) {
      fetchContentInfo(localQnaNumber);
      fetchWriterId(localQnaNumber);
    }
  }, [questionId, userId, writerId, setWriterId, handleView]);

  const fetchContentInfo = async (id) => {
    try {
      const data = await getQnaDetail(id);
      setContentInfo(data);
    } catch (error) {
      setMessage("게시물 정보를 불러올 수 없습니다.");
    }
  };

  const fetchWriterId = async (id) => {
    try {
      const data = await getWriterId(id);
      setWriterId(data);
    } catch (error) {
      setMessage("작성자 정보를 불러올 수 없습니다.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteQna(id);
      setMsg("삭제되었습니다.");
      setType("success");
    } catch (error) {
      setMsg("삭제되지 않았습니다.");
      setType("error");
    } finally {
      setAlertModalOpen(true);
      setGoTarget({
        path: "/main/qnalist",
        options: {
          state: { page: currentPage },
        },
      });
    }
  };

  const handleClickDelete = async (id) => {
    try {
      await deleteAns(id);
      setMsg("답변이 삭제되었습니다.");
      setType("success");
      setAlertModalOpen(true);
    } catch (error) {
      setMsg("답변이 삭제되지 않았습니다.");
      setType("error");
      setAlertModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto mt-10 bg-white rounded-lg shadow-md overflow-hidden">
        <Navbar
          name="Q&A"
          onListClick={() =>
            navigate("/main/qnalist", { state: { page: currentPage } })
          }
          onEditClick={() => {
            if (String(userId) !== String(writerId)) {
              setMsg("작성자만 수정할 수 있습니다!");
              setType("error");
              setGoTarget(null);
              setAlertModalOpen(true);
            } else {
              navigate("/main/qnaedit", {
                state: { page: currentPage, questionId: questionId },
              });
            }
          }}
          onDelClick={() => {
            if (String(userId) !== String(writerId) && userRole !== "ADMIN") {
              setMsg("작성자 혹은 관리자만\n 삭제할 수 있습니다!");
              setType("error");
              setGoTarget(null);
              setAlertModalOpen(true);
            } else {
              handleDelete(questionId);
            }
          }}
        />

        <div className="p-8">
          {message && <p className="text-red-500 text-center">{message}</p>}
          {contentInfo.length > 0 ? (
            contentInfo.map((qna, i) => (
              <div key={i}>
                <h2 className="text-blue-800 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold transition-all duration-300 mb-2">
                  {qna.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mb-8 transition-all duration-300">
                  {qna.userName} | {qna.createdAt} | {qna.viewCount}
                </p>
                <div className="whitespace-pre-line leading-relaxed text-base sm:text-lg md:text-lg transition-all duration-300 mb-6">
                  {qna.questionContent}
                </div>
                <hr className="my-10" />
                <div className="text-xl font-semibold text-white bg-blue-800 rounded-md px-4 py-2 mb-2">
                  답변내용
                </div>
                <div
                  className={`p-5 rounded-md shadow-md ${
                    !qna.answerContent ? "text-gray-400" : ""
                  }`}
                >
                  {qna.answerContent || "아직 답변이 작성되지 않았습니다."}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              {" "}
              데이터를 불러오는 중...
            </p>
          )}

          <div className="float-right mt-4">
            {userRole === "ADMIN" && contentInfo.length > 0 && (
              <>
                <button
                  onClick={() => {
                    const qna = contentInfo[0];
                    if (!qna.answerContent || qna.answerContent.trim() === "") {
                      setProps(
                        <QnaAnswerWritePage
                          qno={questionId}
                          page={currentPage}
                        />
                      );
                      setBaseModalOpen(true);
                    } else {
                      setMsg("이미 답변이 작성되었습니다.");
                      setType("error");
                      setGoTarget(null);
                      setAlertModalOpen(true);
                    }
                  }}
                  className="text-green-500 hover:text-green-700 sm:text-lg text-sm font-semibold px-3 rounded transition"
                >
                  📗답변 작성
                </button>
                &nbsp;
                <button
                  onClick={() => {
                    const qna = contentInfo[0];
                    if (qna.answerContent) {
                      setConfirmModalOpen(true);
                    } else {
                      setMsg("삭제할 답변이 없습니다.");
                      setType("error");
                      setGoTarget(null);
                      setAlertModalOpen(true);
                    }
                  }}
                  className="text-red-500 hover:text-red-700 sm:text-lg text-sm font-semibold py-2.5 px-3 rounded transition"
                >
                  ❌답변 삭제
                </button>
              </>
            )}
          </div>
        </div>

        {/* 모달 */}
        <AlertModal
          isOpen={alertModalOpen}
          message={msg}
          onClose={handleClose}
          type={type}
        />
        <BaseModal
          isOpen={baseModalOpen}
          onClose={handleClose}
          children={props}
        />
        <ConfirmModal
          isOpen={confirmModalOpen}
          message={"답변을 삭제하시겠습니까?"}
          onCancel={handleClose}
          onConfirm={() => {
            setConfirmModalOpen(false);
            handleClickDelete(questionId);
          }}
        />
      </div>
    </div>
  );
};

export default QnaDataPage;
