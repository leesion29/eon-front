import { useEffect, useState } from "react";
import { findUserId } from "../api/memberApi";

const images = [
  "/images/u1.jpg",
  "/images/u2.jpg",
  "/images/u3.jpg",
  "/images/u4.jpg",
  "/images/u5.jpg",
];

function FindidPage() {
  const [formData, setFormData] = useState({
    userName: "",
    userPhone: "",
    userEmail: "",
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const sliderInterval = 3000;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, sliderInterval);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFindUserId = async (e) => {
    e.preventDefault();
    if (!formData.userName || !formData.userPhone || !formData.userEmail) {
      alert("이름, 전화번호, 이메일을 입력해주세요");
      return;
    }
    console.log("요청 데이터:", formData);

    try {
      const data = await findUserId(formData);
      console.log("응답데이터 :", data);
      alert(data.message || "학번 찾기 결과: " + data);
    } catch (error) {
      console.error("요청중 오류 발생 !:", error);
      alert("학번 찾기에 실패했습니다.");
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            className="absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700"
            alt={`배경 이미지 ${index + 1}`}
            style={{ opacity: index === currentIndex ? 1 : 0 }}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-40">
        <div className="w-full max-w-md bg-white bg-opacity-90 p-6 rounded-lg shadow-md flex flex-col items-center">
          <img
            src="/images/eonLogo.jpg"
            alt="학교 로고"
            className="w-20 h-20 rounded-full mb-4"
          />

          <form onSubmit={handleFindUserId} className="space-y-3">
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="이름"
              className="w-full p-2 border rounded"
              required
            />

            <input
              type="email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleChange}
              placeholder="이메일"
              className="w-full p-2 border rounded"
              required
            />

            <input
              type="text"
              name="userPhone"
              value={formData.userPhone}
              onChange={handleChange}
              placeholder="010-0000-0000"
              className="w-full p-2 border rounded"
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700"
            >
              학번 찾기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FindidPage;
