import React, { useState } from "react";
import AlertModal from "../../components/AlertModal";
import { sendMessage } from "../../api/msgAPi";

function ProfessorMsgSendPage() {
  const [msgLength, setMsgLength] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [type, setType] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [message, setMessage] = useState("");
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  const handleSendMessage = async () => {
    if (!phoneNumber.trim() || !message.trim()) {
      setError("전화번호와 메시지를 모두 입력해주세요.");
      return;
    }

    try {
      await sendMessage(phoneNumber, message);
      setError("");
      setAlertData("success", "메시지 전송에 성공했습니다.");
    } catch (error) {
      setAlertData(
        "error",
        "메시지 전송에 실패했습니다.\n 번호와 메시지를 올바르게\n 입력했는지 확인하세요!"
      );
    }
  };

  // 글자 수 카운트
  const handleMsg = () => {
    setMsgLength(document.getElementById("msg").value.length);
    if (msgLength > 46) {
      setError("글자 수는 45자가 최대입니다.");
    }
  };

  // 모달 닫기
  const handleClose = () => {
    setAlertModalOpen(false);
  };

  // 모달을 일괄 설정하기 위한 메서드(함수)
  const setAlertData = (modalType, modalMsg) => {
    setType(modalType);
    setAlertMsg(modalMsg);
    setAlertModalOpen(true);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md mt-10 space-y-6">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          휴대전화 번호
        </label>
        <input
          type="text"
          placeholder="-를 뺀 학생 전화번호 입력하세요. 예> 01098761234"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          메시지 내용
        </label>
        <textarea
          placeholder="45자 이하의 메시지를 입력하세요."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleMsg();
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-md h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={45}
          id="msg"
        />
        {error && <p className="text-red-500 text-left">{error}</p>}
        <p className="text-right text-gray-400">{msgLength} / 45</p>
      </div>

      <button
        onClick={handleSendMessage}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition"
      >
        메시지 전송
      </button>

      {/* 메시지 모달 */}
      <AlertModal
        isOpen={alertModalOpen}
        message={alertMsg}
        onClose={handleClose}
        type={type}
      />
    </div>
  );
}

export default ProfessorMsgSendPage;
