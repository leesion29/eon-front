import { useEffect, useState } from "react";

const images = [
  "/images/u1.jpg",
  "/images/u2.jpg",
  "/images/u3.jpg",
  "/images/u4.jpg",
  "/images/u5.jpg",
];

async function findUserPw(formData) {
  try {
    const response = await fetch(
      "http://localhost:8080/api/user/finduserPassword",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();
    console.log("서버 응답:", data);

    if (!response.ok) {
      throw new Error(data.error || "서버 오류 발생");
    }

    return data;
  } catch (error) {
    console.error("비밀번호 찾기 요청 실패:", error);
    throw error;
  }
}

function FindpwPage() {
  const [formData, setFormData] = useState({
    userId: "",
    userEmail: "",
  });

  const [message, setMessage] = useState(""); // ✅ 메시지 상태 추가
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

  const handleFindPassword = async (e) => {
    e.preventDefault();
    if (!formData.userId || !formData.userEmail) {
      setMessage("학번과 이메일을 입력해주세요.");
      return;
    }

    try {
      const data = await findUserPw(formData);
      if (data.message) {
        setMessage(data.message); // 서버 응답 메시지 표시
      } else if (data.password) {
        setMessage(`비밀번호: ${data.password}`);
      } else {
        setMessage("비밀번호 찾기에 실패했습니다.");
      }
    } catch (error) {
      setMessage(error.message || "비밀번호 찾기 요청 중 오류 발생");
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 배경 이미지 */}
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

      {/* 로그인 폼 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-40">
        <div className="w-full max-w-md bg-white bg-opacity-90 p-6 rounded-lg shadow-md flex flex-col items-center">
          <img
            src="/images/eonLogo.jpg"
            alt="학교 로고"
            className="w-20 h-20 rounded-full mb-4"
          />

          {/* 메시지 출력 */}
          {message && (
            <div className="text-white bg-blue-600 p-2 rounded mt-4 text-center w-full">
              {message}
            </div>
          )}

          <form onSubmit={handleFindPassword} className="space-y-3 mt-4 w-full">
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="학번"
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
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700"
            >
              비밀번호 찾기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FindpwPage;
