import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const images = [
  "/images/u1.jpg",
  "/images/u2.jpg",
  "/images/u3.jpg",
  "/images/u4.jpg",
  "/images/u5.jpg",
];

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("비밀번호가 일치하지 않습니다 ❌ ");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8080/api/user/reset-password",
        {
          token,
          password,
        }
      );
      setMessage("비밀번호가 성공적으로 재설정되었습니다.");
    } catch (err) {
      setMessage(
        "비밀번호 재설정 실패: " +
          (err.response?.data?.error || "오류가 발생했습니다.")
      );
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 배경 이미지 */}
      <div className="absolute top-0 left-0 w-screen h-screen z-0">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            className="absolute top-0 left-0 object-cover w-screen h-screen transition-opacity duration-700"
            alt={`bg-${index}`}
            style={{ opacity: index === currentIndex ? 1 : 0 }}
          />
        ))}
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />
      </div>

      {/* 상단 로고 + 학교명 */}
      <div className="fixed top-8 left-8 z-20">
        <div className="flex items-center space-x-4">
          <img
            src="/images/eonLogo.jpg"
            alt="EON Logo"
            className="w-20 h-20 rounded-full"
          />
          <div>
            <h1 className="text-white text-3xl font-bold">이온대학교</h1>
            <p className="text-white text-base">EON UNIVERSITY</p>
          </div>
        </div>
      </div>

      {/* 중앙 비밀번호 재설정 박스 */}
      <div className="absolute inset-0 flex items-center justify-center z-30">
        <div className="w-full max-w-md bg-white bg-opacity-90 p-8 rounded-lg shadow-md">
          <h2 className="text-left text-3xl font-bold text-blue-900 mb-8">
            Reset password
          </h2>

          {message && (
            <div className="mb-4 text-sm text-center text-red-600 font-medium">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 새 비밀번호 */}
            <div className="relative mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                새 비밀번호
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="새 비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-[45px] transform -translate-y-1/2"
              >
                <img
                  src={
                    showPassword ? "/images/showPw.png" : "/images/HidePw.png"
                  }
                  alt="비밀번호 보기 토글"
                  className="w-5 h-5 opacity-70 hover:opacity-100"
                />
              </button>
            </div>

            {/* 비밀번호 확인 */}
            <div className="relative mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                새 비밀번호 확인
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="비밀번호 다시 입력"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-[45px] transform -translate-y-1/2"
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

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-800 mb-3"
            >
              비밀번호 재설정
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
