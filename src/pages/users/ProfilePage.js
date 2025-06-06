import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { updateUserInfo } from "../../api/memberApi";
import { getAuthHeader } from "../../util/authHeader";
import { showModal } from "../../slices/modalSlice";

const ProfilePage = () => {
  const { userId, userRole } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [studentInfo, setStudentInfo] = useState(null);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    userName: "",
    userId: "",
    userBirth: "",
    userEmail: "",
    userPhone: "",
    userImgUrl: "",
    departmentName: "",
  });
  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("change");
  const [customEmailDomain, setCustomEmailDomain] = useState("");
  const [phoneParts, setPhoneParts] = useState({
    part1: "010",
    part2: "",
    part3: "",
  });

  const emailDomainList = [
    "naver.com",
    "gmail.com",
    "hanmail.net",
    "daum.net",
    "nate.com",
    "hotmail.com",
    "icloud.com",
    "kakao.com",
  ];

  useEffect(() => {
    if (userId) fetchStudentInfo(userId);
  }, [userId]);

  const fetchStudentInfo = async (userId) => {
    try {
      const res = await axios.get(
        `https://www.eonuniversity.co.kr/api/user/${userId}`,
        getAuthHeader()
      );
      const data = res.data;
      setStudentInfo(data);
      setFormData({
        userName: data.userName,
        userId: data.userId,
        userBirth: data.userBirth,
        userEmail: data.userEmail,
        userPhone: data.userPhone,
        userImgUrl: data.userImgUrl,
        departmentName: data.departmentName || "",
      });
      if (data.userEmail) {
        const [idPart, domainPart] = data.userEmail.split("@");
        setEmailId(idPart || "");
        setCustomEmailDomain(domainPart || "");
        setEmailDomain("change");
      }
      if (data.userPhone) {
        const parts = data.userPhone.split("-");
        setPhoneParts({
          part1: parts[0] || "010",
          part2: parts[1] || "",
          part3: parts[2] || "",
        });
      }
    } catch {
      setMessage("정보를 불러올 수 없습니다.");
    }
  };

  const handleSave = async () => {
    try {
      const finalEmail = `${emailId}@${customEmailDomain}`;
      const finalPhone = `${phoneParts.part1}-${phoneParts.part2}-${phoneParts.part3}`;
      await updateUserInfo({
        userId: formData.userId,
        userEmail: finalEmail,
        userPhone: finalPhone,
      });
      dispatch(
        showModal({
          message: "정보가 성공적으로 수정되었습니다.",
          type: "success",
        })
      );
    } catch {
      dispatch(
        showModal({ message: "정보 수정에 실패했습니다.", type: "error" })
      );
    }
  };

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    setPhoneParts((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailIdChange = (e) => setEmailId(e.target.value);
  const handleEmailDomainChange = (e) => {
    const selected = e.target.value;
    setEmailDomain(selected);
    if (selected === "custom") setCustomEmailDomain("");
    else if (selected !== "change") setCustomEmailDomain(selected);
  };
  const handleCustomDomainChange = (e) => setCustomEmailDomain(e.target.value);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 bg-white shadow-md rounded-md mt-10 md:mt-12">
      <div className="flex justify-between items-center border-b pb-4 mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-700">내 프로필</h2>
      </div>

      {message && (
        <div className="text-center mb-6 text-red-500 text-sm">{message}</div>
      )}

      {studentInfo ? (
        <form className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          <div className="hidden md:flex flex-col items-center gap-6">
            <img
              src={
                formData.userImgUrl
                  ? `https://www.eonuniversity.co.kr${formData.userImgUrl}`
                  : "/default-profile.jpg"
              }
              alt="Profile"
              className="w-40 h-52 object-cover border rounded-md shadow-sm"
            />
            <div className="w-full max-w-[10rem]">
              <label className="block mb-1 text-sm font-semibold text-gray-700">
                성명
              </label>
              <input
                type="text"
                value={formData.userName}
                readOnly
                className="w-full p-2 border rounded bg-gray-100 text-gray-700 text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 md:gap-x-8 gap-y-4">
            <div className="sm:col-span-2 md:hidden">
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                    성명
                </label>
                <input
                    type="text"
                    value={formData.userName}
                    readOnly
                    className="w-full p-2 border rounded bg-gray-100 text-gray-700 text-sm"
                />
            </div>

            {[
              {
                label: userRole === "STUDENT" ? "학번" : "ID",
                value: formData.userId,
              },
              { label: "학과", value: formData.departmentName || "-" },
            ].map((item, idx) => (
              <div key={idx}>
                <label className="block mb-1 text-sm font-semibold text-gray-700">
                  {item.label}
                </label>
                <input
                  type="text"
                  value={item.value}
                  readOnly
                  className="w-full p-2 border rounded bg-gray-100 text-gray-700 text-sm"
                />
              </div>
            ))}
            
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">
                생년월일
              </label>
              <input
                type="text"
                value={formData.userBirth}
                readOnly
                className="w-full p-2 border rounded bg-gray-100 text-gray-700 text-sm"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">
                전화번호
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {["part1", "part2", "part3"].map((part, idx) => (
                  <div
                    key={part}
                    className="flex items-center gap-1 flex-1 min-w-[calc(33.333%-0.5rem)] sm:min-w-[6rem]" 
                  >
                    <input
                      name={part}
                      maxLength={part === "part1" ? 3 : 4}
                      className="w-full p-2 border rounded text-center text-sm 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={phoneParts[part]}
                      onChange={handlePhoneChange}
                    />
                    {idx < 2 && <span className="text-gray-600">-</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* 이메일 섹션 수정 */}
            <div className="col-span-1 sm:col-span-2">
              <label className="block mb-1 text-sm font-semibold text-gray-700">
                이메일
              </label>
              {/* 모바일에서는 flex-wrap으로 자동 줄바꿈, sm 이상에서는 가로로 최대한 붙도록 */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  aria-label="이메일 아이디"
                  className="p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition 
                             flex-grow min-w-[80px] w-auto sm:flex-none sm:w-auto" // 너비 조정
                  value={emailId}
                  onChange={handleEmailIdChange}
                  placeholder="이메일"
                />
                <span className="text-gray-600">@</span>
                <input
                  aria-label="이메일 도메인"
                  className="p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition 
                             flex-grow min-w-[80px] w-auto sm:flex-none sm:w-auto" // 너비 조정
                  value={customEmailDomain}
                  onChange={handleCustomDomainChange}
                  placeholder="도메인 입력"
                />
                <select
                  aria-label="이메일 도메인 선택"
                  className="p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition 
                             flex-grow min-w-[90px] w-auto sm:flex-none sm:w-auto" // 너비 조정
                  value={emailDomain}
                  onChange={handleEmailDomainChange}
                >
                  <option value="change">직접입력/선택</option>
                  {emailDomainList.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                  <option value="custom">직접 입력</option>
                </select>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-3 flex justify-end mt-6 md:mt-8">
            <button
              type="button"
              onClick={handleSave}
              className="px-6 sm:px-8 py-2 bg-green-600 text-white font-semibold text-sm rounded hover:bg-green-700 transition"
            >
              수정
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center text-gray-500 py-10 text-sm">
          정보를 불러오는 중...
        </div>
      )}
    </div>
  );
};

export default ProfilePage;