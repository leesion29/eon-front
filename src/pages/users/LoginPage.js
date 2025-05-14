import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginPostAsync } from "../../slices/authSlice";
import { findUserId, findUserPw } from "../../api/memberApi";

const images = [
  "/images/Eon10.jpg",
  "/images/Eon11.jpg",
  "/images/Eon12.jpg",
  "/images/Eon13.jpg",
  "/images/Eon14.jpg",
];

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [user, setUser] = useState({
    userId: localStorage.getItem("savedUserId") || "",
    userPassword: "",
    remember: !!localStorage.getItem("savedUserId"),
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFindIdModal, setShowFindIdModal] = useState(false);
  const [showFindPwModal, setShowFindPwModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const [findIdForm, setFindIdForm] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
  });
  const [findPwForm, setFindPwForm] = useState({
    userId: "",
    userEmail: "",
  });

  const [activeTab, setActiveTab] = useState("tab_login1");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleChecked = async () => {
    const isChecked = document.getElementById("rememberId").checked;
    if (!isChecked){
      localStorage.removeItem("savedUserId");
    }
  }

  useEffect(() => {
    handleChecked();
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogin = async () => {
    setMessage("");
    try {
      const result = await dispatch(
        loginPostAsync({ userId: user.userId, userPassword: user.userPassword })
      ).unwrap();

      user.remember
        ? localStorage.setItem("savedUserId", user.userId)
        : localStorage.removeItem("savedUserId");

      navigate("/main");
    } catch (error) {
      console.error("로그인 실패:", error.message);
      setMessage("로그인에 실패했습니다.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  const handleFindIdSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await findUserId(findIdForm);
      setResultMessage(data.message || "학번: " + data);
      setShowResultModal(true);
      setShowFindIdModal(false);
    } catch {
      setResultMessage("학번 찾기에 실패했습니다.");
      setShowResultModal(true);
    }
  };

  const handleFindPwSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await findUserPw(findPwForm);
      setResultMessage(
        data.password
          ? "비밀번호: " + data.password
          : data.message || "비밀번호 찾기에 실패했습니다."
      );
      setShowResultModal(true);
      setShowFindPwModal(false);
    } catch (error) {
      setResultMessage(error.message);
      setShowResultModal(true);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
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

      {/* hidden [@media(max-width:1100)]:hidden xl:block 이부분 조절하면 창 줄어듬 */}
      <div className="fixed left-32 top-1/2 transform -translate-y-1/2 z-10 hidden [@media(max-width:1100)]:hidden xl:block">
        <p className="text-5xl font-extrabold leading-relaxed text-white text-opacity-90">
          <span className="block">기술이 아닌,</span>
          <span className="block">가능성을 설계합니다.</span>
          <span className="block">AI시대 배움의 기준이 되다.</span>
          <span className="block text-right">- At. EON</span>
        </p>
      </div>

      <div className="absolute inset-0 flex items-center justify-end pr-32 z-30">
        <div className="w-full max-w-md bg-white bg-opacity-90 p-6 rounded-lg shadow-md">
          <h2 className="text-left text-3xl font-bold text-blue-900 mb-8">
            EON Login
          </h2>

          <div className="relative mb-3">
            <ul className="flex mb-2">
              <li
                className={`px-6 py-2 rounded-t-lg border-2 border-blue-800 border-b-0 text-sm font-semibold cursor-pointer ${
                  activeTab === "tab_login1"
                    ? "text-blue-800"
                    : "text-gray-400 bg-gray-100"
                }`}
                onClick={() => setActiveTab("tab_login1")}
                style={{
                  borderBottom:
                    activeTab === "tab_login1" ? "none" : "1px solid #ccc",
                }}
              >
                <span>
                  이온<span className="text-red-500"> * </span>인
                </span>
              </li>
            </ul>

            <div
              className="absolute top-full h-0.5 bg-blue-800 w-72 z-0"
              style={{ left: "108px" }}
            />
          </div>

          {message && (
            <p className="text-red-500 text-center mb-2">{message}</p>
          )}

          <div className="bg-white border border-gray-300 rounded px-3 py-2 mb-3 flex items-center">
            <img
              src="/images/id.jpg"
              alt="User Icon"
              className="w-6 h-6 mr-2"
            />
            <input
              type="text"
              name="userId"
              placeholder="학번"
              value={user.userId}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
              className="w-3/4 outline-none bg-white"
            />
            <label className="flex items-center gap-2 whitespace-nowrap">
              <input
                type="checkbox"
                id = "rememberId"
                name="remember"
                className="w-4 h-3"
                checked={user.remember}
                onChange={handleChange}
                onClick={handleChecked}
              />
              <span className="text-sm text-gray-500">학번 저장</span>
            </label>
          </div>

          <div className="bg-white border border-gray-300 rounded px-3 py-2 mb-5 flex items-center relative">
            <img
              src="/images/pw.jpg"
              alt="Lock Icon"
              className="w-6 h-6 mr-2"
            />
            <input
              type={showPassword ? "text" : "password"}
              name="userPassword"
              placeholder="비밀번호"
              value={user.userPassword}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
              className="w-full outline-none bg-white pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <img
                src={showPassword ? "/images/showPw.png" : "/images/HidePw.png"}
                alt="비밀번호 보기 토글"
                className="w-5 h-5 opacity-70 hover:opacity-100"
              />
            </button>
          </div>

          <ul className="flex justify-end text-sm mb-5">
            <li className="px-3">
              <button
                onClick={() => setShowFindIdModal(true)}
                className="text-gray-400 hover:text-gray-800"
              >
                학번 찾기
              </button>
            </li>
            <li>
              <div className="text-gray-400">|</div>
            </li>
            <li className="px-3">
              <button
                onClick={() => setShowFindPwModal(true)}
                className="text-gray-400 hover:text-gray-800"
              >
                비밀번호 찾기
              </button>
            </li>
          </ul>

          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-800 mb-3"
          >
            로그인
          </button>

          <div className="text-xs text-gray-500 mt-4 text-left mb-3">
            <ul>
              <li>
                * 최초 로그인 시 반드시 비밀번호를 변경해 주시기 바랍니다.
              </li>
              <li>
                * 신입생의 경우, 초기 비밀번호는 생년월일 6자리 + ! 입니다.
              </li>
              <li>
                * 비밀번호를 분실한 경우에는 ‘비밀번호 찾기’를 이용하세요.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {showFindIdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
          <div className="bg-white bg-opacity-90 p-8 rounded-lg w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500"
              onClick={() => setShowFindIdModal(false)}
            >
              ✕
            </button>
            <form onSubmit={handleFindIdSubmit} className="space-y-5">
              <h2 className="text-2xl text-blue-800 font-bold text-center mb-2">
                학번 찾기
              </h2>
              <input
                name="userName"
                placeholder="이름"
                className="w-full p-2 border rounded focus:outline-none"
                required
                onChange={(e) =>
                  setFindIdForm({ ...findIdForm, userName: e.target.value })
                }
              />
              <input
                name="userPhone"
                placeholder="010-0000-0000"
                className="w-full p-2 border rounded focus:outline-none"
                required
                onChange={(e) =>
                  setFindIdForm({ ...findIdForm, userPhone: e.target.value })
                }
              />
              <input
                name="userEmail"
                placeholder="이메일"
                className="w-full p-2 border rounded focus:outline-none"
                required
                onChange={(e) =>
                  setFindIdForm({ ...findIdForm, userEmail: e.target.value })
                }
              />
              <button
                type="submit"
                className="w-full bg-blue-400 text-white py-2 rounded hover:bg-blue-800"
              >
                학번 찾기
              </button>
            </form>
          </div>
        </div>
      )}

      {showFindPwModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
          <div className="bg-white bg-opacity-90 p-6 rounded-lg w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500"
              onClick={() => setShowFindPwModal(false)}
            >
              ✕
            </button>
            <form onSubmit={handleFindPwSubmit} className="space-y-5">
              <h2 className="text-2xl text-blue-800 font-bold text-center mb-2">
                비밀번호 찾기
              </h2>
              <input
                name="userId"
                placeholder="학번"
                className="w-full p-2 border rounded focus:outline-none"
                required
                onChange={(e) =>
                  setFindPwForm({ ...findPwForm, userId: e.target.value })
                }
              />
              <input
                name="userEmail"
                placeholder="이메일"
                className="w-full p-2 border rounded focus:outline-none"
                required
                onChange={(e) =>
                  setFindPwForm({ ...findPwForm, userEmail: e.target.value })
                }
              />
              <button
                type="submit"
                className="w-full bg-blue-400 text-white py-2 rounded hover:bg-blue-800"
              >
                비밀번호 찾기
              </button>
            </form>
          </div>
        </div>
      )}

      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500"
              onClick={() => setShowResultModal(false)}
            >
              ✕
            </button>
            <p className="text-center text-gray-800">{resultMessage}</p>
            <button
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-700"
              onClick={() => setShowResultModal(false)}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
