import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { getData, updateNotice } from "../../api/noticeApi";
import AlertModal from "../../components/AlertModal";


const AdminNoticeEditPage = () => {
  const location = useLocation();
  const noticeId = location.state?.noticeId;
  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth?.userId);

  const [message, setMessage] = useState("");
  const [contentData, setContentData] = useState({
    title: "",
    content: "",
    noticeId,
  });

  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [type, setType] = useState("");
  const [goTarget, setGoTarget] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await getData(noticeId);
        console.log("getData 응답:", res);
        const notice = res.data;
        setContentData({
          noticeId: notice.noticeId,
          title: notice.title,
          content: notice.content,
          pin: notice.pin,
          viewCount: notice.viewCount,
          noticeDate: notice.noticeDate,
        });
        console.log(contentData);
      } catch (err) {
        setMessage("공지를 불러올 수 없습니다.");
      }
    };

    if (userId) {
      fetchContent();
    }
  }, [userId, noticeId]);

  // 공지 상단 고정 여부를 결정하는 함수 (체크하면 위에 고정되게 함)
  const handlePinned = () => {
    const isPinned = document.getElementById("pin").checked;
    return isPinned ? 1 : 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContentData((prev) => ({ ...prev, [name]: value }));
  };

  const setAlertData = (modalType, modalMsg, targetPath = null) => {
    setType(modalType);
    setMsg(modalMsg);
    setGoTarget(targetPath);
    setAlertModalOpen(true);
  };

  const handleClose = () => {
    setAlertModalOpen(false);
    if (goTarget) {
      navigate(goTarget, { state: { noticeId } });
      setGoTarget(null);
    }
  };

  const handleSubmit = async () => {
    if (!contentData.title.trim() || !contentData.content.trim()) {
      setAlertData("error", "제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      const updatedPin = handlePinned(contentData.pin);
      await updateNotice(noticeId, { ...contentData, pin: updatedPin });
      setAlertData("success", "성공적으로 수정되었습니다.", "/main/noticedata");
    } catch (err) {
      setAlertData("error", "수정에 실패했습니다.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white shadow-md rounded-md mt-10">
      <h1 className="text-md font-bold text-left mb-6">공지 수정</h1>
      <hr />
      <br />
      {message && <p className="text-red-500 text-center">{message}</p>}
      <table className="table-auto border-collapse border border-gray-400 w-full">
        <thead className="bg-blue-800">
          <tr>
            <th className="border border-gray-400 px-4 py-2 text-white">
              제목
            </th>
            <td className="border border-gray-400 px-4 py-2 bg-white">
              <input
                name="title"
                className="w-full focus-visible:outline-none"
                onChange={handleChange}
                value={contentData.title}
              />
            </td>
          </tr>
          <tr>
            <th className="border border-gray-400 px-4 py-2 text-white">
              작성자
            </th>
            <td className="border border-gray-400 px-4 py-2 bg-white">
              {"관리자"}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-400 px-4 py-2 text-white">
              작성일
            </th>
            <td className="border border-gray-400 px-4 py-2 bg-white">
              {contentData.noticeDate}
            </td>
          </tr>
        </thead>
        <tbody>
          <tr className="w-full h-96 flex-auto shadow-md">
            <td colSpan={2} className="p-4">
              <textarea
                placeholder="공지사항을 수정하세요."
                name="content"
                className="w-full h-96 focus-visible:outline-none resize-none"
                maxLength={255}
                onChange={handleChange}
                value={contentData.content}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div className="mt-4">
        <label>
          <input type="checkbox" id="pin" /> 고정📌
        </label>
        <div className="flex float-right mb-10">
          <button
            onClick={handleSubmit}
            className="text-green-500 hover:text-green-700 text-lg font-semibold px-3 rounded transition"
          >
            📗 수정하기
          </button>
        </div>
        <br />
      </div>
      <AlertModal
        isOpen={alertModalOpen}
        message={msg}
        type={type}
        onClose={handleClose}
      />
    </div>
  );
};

export default AdminNoticeEditPage;
