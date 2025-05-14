import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterComponent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userId: "",
    userName: "",
    userPassword: "",
    userBirth: "",
    userEmail: "",
    userPhone: "",
    userRole: "STUDENT", // 기본값
    departmentId: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    setMessage("");

    try {
      const response = await fetch("http://localhost:8080/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("회원가입 실패");

      alert("회원가입이 완료되었습니다. 로그인 해주세요.");
      navigate("/member/login");
    } catch (error) {
      setMessage("회원가입에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">회원가입</h2>
        {message && <p className="text-red-500 mb-2">{message}</p>}

        <input
          type="text"
          name="userId"
          placeholder="학번"
          value={formData.userId}
          onChange={handleChange}
          className="input-style"
        />
        <input
          type="text"
          name="userName"
          placeholder="이름"
          value={formData.userName}
          onChange={handleChange}
          className="input-style"
        />
        <input
          type="password"
          name="userPassword"
          placeholder="비밀번호"
          value={formData.userPassword}
          onChange={handleChange}
          className="input-style"
        />
        <input
          type="date"
          name="userBirth"
          placeholder="생년월일"
          value={formData.userBirth}
          onChange={handleChange}
          className="input-style"
        />
        <input
          type="email"
          name="userEmail"
          placeholder="이메일"
          value={formData.userEmail}
          onChange={handleChange}
          className="input-style"
        />
        <input
          type="tel"
          name="userPhone"
          placeholder="전화번호"
          value={formData.userPhone}
          onChange={handleChange}
          className="input-style"
        />
        <select
          name="userRole"
          value={formData.userRole}
          onChange={handleChange}
          className="input-style"
        >
          <option value="STUDENT">학생</option>
          <option value="PROFESSOR">교수</option>
          <option value="ADMIN">관리자</option>
        </select>
        <input
          type="number"
          name="departmentId"
          placeholder="학과 ID"
          value={formData.departmentId}
          onChange={handleChange}
          className="input-style"
        />

        <button
          onClick={handleRegister}
          className="w-full bg-blue-500 text-white py-2 rounded mt-4 hover:bg-blue-700"
        >
          회원가입
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{" "}
          <button
            onClick={() => navigate("/member/login")}
            className="text-blue-500 hover:underline"
          >
            로그인
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterComponent;
