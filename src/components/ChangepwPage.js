import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAuthHeader } from "../util/authHeader";

const ChangepwPage = () => {
  const { userId } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_SERVER_HOST = "https://www.eonuniversity.co.kr";
  const prefix = `${API_SERVER_HOST}/api/user`;
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await axios.put(
        `${prefix}/${userId}/password`,
        {
          currentPassword,
          newPassword,
        },
        getAuthHeader()
      );

      setMessage("☑️ 비밀번호가 성공적으로 변경되었습니다.");
      // 배포한 사이트의 로컬보다 반응 속도가 느려, 버그 유발할 수 있으므로 주석 처리
      // setTimeout(() => {
      //   navigate("/main/profile");
      // }, 1500);
    } catch (error) {
      setMessage("비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인하세요.");
    }
  };

  /* 테스트 아이디 권한 제약을 위한 코드 추가 */

  // 테스트 유저 여부 체크를 위한 상수 선언
  const yourUserId = useSelector((state) => state.auth.userId) || "000000000";
  const [isTester, setIstester] = useState(true);
  useEffect(() => {
    if (
      yourUserId == "000000000" ||
      yourUserId == "100000001" ||
      yourUserId == "210000000"
    ) {
      setIstester(true);
      console.log("테스트 유저");
      setMessage("테스트 유저로 접속하셨습니다. 비밀번호 변경이 제한됩니다.");
    } else {
      setIstester(false);
      console.log("일반 유저");
    }
  }, []);

  return (
    <div className="flex justify-center items-start min-h-screen py-24">
      <div className="w-full max-w-xl b bg-white bg-opacity-90 p-10 shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-8 text-center text-black">
          비밀번호 변경
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div className="relative">
            <label className="block text-sm font-medium">현재 비밀번호</label>
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-blue-50 w-full border px-4 py-2 rounded mt-1 focus:outline-none focus:ring-1"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              className="absolute right-3 top-[2.8rem] transform -translate-y-1/2"
            >
              <img
                src={
                  showCurrentPassword
                    ? "/images/showPw.png"
                    : "/images/HidePw.png"
                }
                alt="비밀번호 보기 토글"
                className="w-5 h-5 opacity-70 hover:opacity-100"
              />
            </button>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium">새 비밀번호</label>
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-blue-50 w-full border px-4 py-2 rounded mt-1 focus:outline-none focus:ring-1"
              required
            />

            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-[2.8rem] transform -translate-y-1/2"
            >
              <img
                src={
                  showNewPassword ? "/images/showPw.png" : "/images/HidePw.png"
                }
                alt="비밀번호 보기 토글"
                className="w-5 h-5 opacity-70 hover:opacity-100"
              />
            </button>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium">
              새 비밀번호 확인
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-blue-50 w-full border px-4 py-2 rounded mt-1 focus:outline-none focus:ring-1"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-[2.8rem] transform -translate-y-1/2"
            >
              <img
                src={
                  showConfirmPassword
                    ? "/images/showPw.png"
                    : "/images/HidePw.png"
                }
                alt="비밀번호 보기 토글"
                className="w-5 h-5 opacity-70 hover:opacity-100"
              />
            </button>
          </div>

          {message && (
            <p className="text-sm text-center text-red-600">{message}</p>
          )}
          <button
            type={`${!isTester ? "submit" : "button"}`}
            className={`w-full text-white py-3 rounded font-semibold ${
              !isTester
                ? "bg-blue-400 hover:bg-blue-800"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            비밀번호 변경
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangepwPage;
