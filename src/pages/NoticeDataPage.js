import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import AlertModal from "../components/AlertModal";
import ConfirmModal from "../components/ConfirmModal";
import { getAuthHeader } from "../util/authHeader";
import Navbar from "../components/Navbar";
const NoticeDataPage = () => {
  const navigate = useNavigate();
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [type, setType] = useState("");
  const [msg, setMsg] = useState("");
  const [goTarget, setGoTarget] = useState(null);

  const location = useLocation();
  const noticeId = location.state?.noticeId;
  const currentPage = location.state?.page;
  const userId = useSelector((state) => state.auth?.userId);
  const userRole = useSelector((state) => state.auth?.userRole);

  const [message, setMessage] = useState("");
  const [contentInfo, setContentInfo] = useState(null);
  const [target, setTarget] = useState(null);
  const setAlertData = (modalType, modalMsg, target) => {
    setType(modalType);
    setMsg(modalMsg);
    setGoTarget(target);
    setAlertModalOpen(true);
  };

  const handleClose = () => {
    setAlertModalOpen(false);
    setConfirmModalOpen(false);
    if (goTarget) {
      navigate("/main/noticelist", {
        state: goTarget,
      });
      setGoTarget(null);
    }
  };

  const handleView = useCallback(async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/notice/update/${noticeId}`,
        null,
        getAuthHeader()
      );
    } catch (error) {
      console.log("조회수 증가 실패");
    }
  }, [noticeId]);

  const handleDelete = async (noticeId) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/notice/delete/${noticeId}`,
        getAuthHeader()
      );
      setAlertData("success", "삭제되었습니다.", null);
    } catch (error) {
      setAlertData("error", "삭제되지 않았습니다.", null);
    } finally {
      setAlertModalOpen(true);
      setGoTarget({
        path: "/main/noticelist",
        options: {
          state: { page: currentPage },
        },
      });
    }
  };

  useEffect(() => {
    const localNoticeId = localStorage.getItem("No.");
    const fetchContentInfo = async (id) => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/notice/${id}`,
          getAuthHeader()
        );
        setContentInfo(response.data);
        handleView();
      } catch (error) {
        setMessage("게시물 정보를 불러올 수 없습니다.");
      }
    };
    if (noticeId) {
      localStorage.setItem("No.", noticeId);
      fetchContentInfo(noticeId);
      setTarget(noticeId);
    } else if (localNoticeId) {
      fetchContentInfo(localNoticeId);
      setTarget(localNoticeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noticeId, userId]);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto mt-10 bg-white rounded-lg shadow-md overflow-hidden">
        <Navbar
          name={"NOTICE"}
          onListClick={() => {
            localStorage.removeItem("No.");
            navigate("/main/noticelist", { state: { page: currentPage } });
          }}
          onEditClick={() => {
            if (userRole !== "ADMIN") {
              setAlertData("error", "관리자만 수정할 수 있습니다!", null);
            } else {
              navigate("/main/noticeedit", {
                state: { page: currentPage, noticeId: noticeId },
              });
            }
          }}
          onDelClick={() => {
            if (userRole !== "ADMIN") {
              setAlertData("error", "관리자만 삭제할 수 있습니다!", null);
            } else {
              setConfirmModalOpen(true);
            }
          }}
        />

        <div className="p-8">
          {message && <p className="text-red-500 text-center">{message}</p>}
          {contentInfo ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-blue-800 text-xl sm:text-1xl md:text-3xl lg:text-4xl font-semibold transition-all duration-300">
                  {contentInfo.title}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-gray-500 mb-6 transition-all duration-300">
                작성일: {contentInfo.noticeDate}
              </p>

              <div className="whitespace-pre-line leading-relaxed text-base sm:text-lg md:text-lg transition-all duration-300">
                {contentInfo.content?.replace(/\n/g, "\n")}
                <img src="/images/u1.jpg" style={{ opacity: 0.8 }} className = "mt-10" alt="notice" />

              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">데이터를 불러오는 중...</p>
          )}

          <AlertModal
            isOpen={alertModalOpen}
            message={msg}
            onClose={handleClose}
            type={type}
          />
          <ConfirmModal
            isOpen={confirmModalOpen}
            message={"공지를 삭제하시겠습니까?"}
            onCancel={handleClose}
            onConfirm={() => {
              setConfirmModalOpen(false);
              handleDelete(target);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default NoticeDataPage;
