import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { writeNotice } from "../../api/noticeApi";
import AlertModal from "../../components/AlertModal";

// 날짜 데이터 포맷팅
let date = new Date();
let year = date.getFullYear();
let month =
  date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
let today = year + "-" + month + "-" + day;
const AdminNoticeWritePage = () => {
  const navigate = useNavigate();
  // 모달 데이터
  const [goTarget, setGoTarget] = useState(null);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [type, setType] = useState("");
  const [msg, setMsg] = useState("");
  // 관리자 아이디 불러오기
  const adminId = useSelector((state) => state.auth?.userId);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    pin: 0,
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
  // 공지 상단 고정 여부를 결정하는 함수 (체크하면 위에 고정되게 함)
  const handlePinned = () => {
    const isPinned = document.getElementById("pin").checked;
    return isPinned ? 1 : 0;
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
      pin: handlePinned(),
      noticeDate: today,
      noticeId: null,
      adminId: adminId,
    };
    try {
      console.log(data);
      await writeNotice(adminId, data);
      setAlertData("success", "공지가 등록되었습니다", "/main/noticelist");
    } catch (error) {
      console.error("에러 내용:", error.response?.data || error.message);
      setAlertData("error", "공지 등록에 실패했습니다.", null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white shadow-md rounded-md mt-10 max-md:p-4 max-md:mt-6">
      <h1 className="text-md font-bold text-left mb-6 max-md:mb-4">공지사항</h1>
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
                value={"관리자"}
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
                placeholder="공지 내용을 작성하세요."
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
          title="공지를 상단에 고정하고 싶다면 체크하세요"
          className="max-md:text-sm max-md:mb-4"
        >
          <input type="checkbox" id="pin" /> 고정📌
        </p>
        <div className="flex float-right mb-10 max-md:float-none max-md:w-full max-md:mt-2">
          <Link
            to="/main/noticelist"
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

export default AdminNoticeWritePage;
