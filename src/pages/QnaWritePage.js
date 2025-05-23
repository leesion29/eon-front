import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { writeQna } from "../api/qnaApi";
import AlertModal from "../components/AlertModal";
import { fetchUserInfo } from "../api/memberApi";

// 날짜 데이터 포맷팅
let date = new Date();
let year = date.getFullYear();
let month =
  date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
let today = year + "-" + month + "-" + day;
const QnaWritePage = () => {
  const navigate = useNavigate();
  // 모달 데이터 정의(useState)
  const [goTarget, setGoTarget] = useState(null);
  // 모달 종료 후 이동할 곳 정의
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [userName, setUserName] = useState(null);
  const [type, setType] = useState(""); // 모달 스타일 정의
  const [msg, setMsg] = useState("");
  // 모달 메시지

  // 유저 데이터 불러오기 및 작성할 데이터 형식 정의
  const userId = useSelector((state) => state.auth?.userId);
  useEffect(() => {
    if (userId) {
      fetchStudentInfo(userId);
    }
  }, [userId]);
  const fetchStudentInfo = async (userId) => {
    try {
      const res = await fetchUserInfo(userId);
      setUserName(res.data.userName);
    } catch (error) {
      console.log("정보를 불러올 수 없습니다.");
    }
  };
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    status: "OPEN",
    viewCount: 0,
  });
  // 모달 일괄 정의를 위한 함수
  const setAlertData = (modalType, modalMsg, target) => {
    setType(modalType);
    setMsg(modalMsg);
    setGoTarget(target);
    setAlertModalOpen(true);
  };

  const handleClose = () => {
    setAlertModalOpen(false);
    if (goTarget) {
      navigate(goTarget);
      setGoTarget(null);
    }
  };
  const handleSecret = (title) => {
    const isSecret = document.getElementById("secret").checked;
    return isSecret
      ? `🔒 ${title.replace(/^🔒\s*/, "")}`
      : title.replace(/^🔒\s*/, "");
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClickAdd = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setAlertData("error", "제목 혹은 내용을 입력해주세요", null);
      return;
    }

    const data = {
      ...formData,
      title: handleSecret(formData.title),
      userId,
      userName,
      createdAt: today,
    };
    try {
      await writeQna(userId, data);
      setAlertData("success", "질문이 등록되었습니다", "/main/qnalist");
    } catch (error) {
      setAlertData("error", "질문 등록에 실패했습니다.", null);
    }
  };
  return (
    <div className="max-w-7xl mx-auto p-8 bg-white shadow-md rounded-md mt-10 max-md:p-4 max-md:mt-6">
      <h1 className="text-md font-bold text-left mb-6 max-md:mb-4">Q&A</h1>
      <hr />
      <br />
      <table className="table-auto border-collapse border border-gray-400 w-full">
        <thead className="bg-blue-800">
          <tr>
            <th className="border border-gray-400 px-4 py-2 text-white max-md:px-2 max-md:py-2 max-md:text-sm">
              제목
            </th>
            <td className="border border-gray-400 px-4 py-2 bg-white max-md:px-2 max-md:py-2">
              <input
                placeholder="제목을 작성하세요"
                name="title"
                className="w-full focus-visible:outline-none max-md:text-sm"
                onChange={handleChange}
                value={formData.title}
              />
            </td>
          </tr>
          <tr>
            <th className="border border-gray-400 px-4 py-2 text-white max-md:px-2 max-md:py-2 max-md:text-sm">
              작성자
            </th>
            <td className="border border-gray-400 px-4 py-2 bg-white max-md:px-2 max-md:py-2">
              <input
                readOnly
                className="w-full focus-visible:outline-none max-md:text-sm"
                value={userName || ""}
              />
            </td>
          </tr>
          <tr>
            <th className="border border-gray-400 px-4 py-2 text-white max-md:px-2 max-md:py-2 max-md:text-sm">
              작성일
            </th>
            <td className="border border-gray-400 px-4 py-2 bg-white max-md:px-2 max-md:py-2">
              <input
                value={today}
                readOnly
                className="w-full focus-visible:outline-none max-md:text-sm"
              />
            </td>
          </tr>
        </thead>
        <tbody>
          <tr className="w-full h-96 flex-auto shadow-md">
            <td colSpan={2} className="p-4 max-md:p-2">
              <textarea
                placeholder="질문 내용을 작성하세요."
                name="content"
                className="w-full h-96 focus-visible:outline-none resize-none max-md:h-64 max-md:text-sm"
                maxLength={255}
                onChange={handleChange}
                value={formData.content}
              ></textarea>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="mt-4 max-md:mt-6">
        <p
          title="비밀글을 작성하고 싶다면 체크하세요"
          className="max-md:text-sm max-md:mb-4"
        >
          <input type="checkbox" id="secret" /> 비밀글
        </p>
        <div className="flex float-right mb-10 max-md:float-none max-md:w-full max-md:mt-2">
          <Link
            to="/main/qnalist"
            className="text-blue-500 hover:text-blue-700 text-lg font-semibold px-3 rounded transition max-md:text-base max-md:font-semibold max-md:px-3 max-md:py-2 max-md:flex-1 max-md:text-center"
          >
            ← 돌아가기
          </Link>
          &nbsp;
          <button
            className="text-green-500 hover:text-green-700 text-lg font-semibold px-3 rounded transition max-md:text-base max-md:font-semibold max-md:px-3 max-md:py-2 max-md:flex-1 max-md:text-center"
            onClick={handleClickAdd}
          >
            📗 작성하기
          </button>
        </div>
        <br />
      </div>
      {/* 모달 */}
      <AlertModal
        isOpen={alertModalOpen}
        message={msg}
        onClose={() => handleClose(goTarget)}
        type={type}
      />
    </div>
  );
};

export default QnaWritePage;
