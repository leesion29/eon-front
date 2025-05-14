import React, { useState, useEffect, useRef } from "react";
import {
  createUser,
  getDepartments,
  uploadProfileImage,
} from "../../api/adminUserApi";
import { useDispatch } from "react-redux";
import { showModal } from "../../slices/modalSlice"; // Redux 액션

const initialForm = {
  userId: "",
  userName: "",
  userPassword: "",
  userEmail: "",
  userPhone: "",
  userBirth: "",
  userRole: "STUDENT",
  departmentId: null,
  userImgUrl: "",
};

const AdminUserCreatePage = ({ onSuccess }) => {
  const [form, setForm] = useState(initialForm);
  const [departments, setDepartments] = useState([]);
  const dispatch = useDispatch();
  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("@naver.com");
  const [customEmailDomain, setCustomEmailDomain] = useState("");
  const [uploadMsg, setUploadMsg] = useState("");
  const [phoneParts, setPhoneParts] = useState({
    part1: "010",
    part2: "",
    part3: "",
  });
  const [userIdMessage, setUserIdMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getDepartments()
      .then((res) => setDepartments(res.data))
      .catch(() => setDepartments([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "userId") {
        setUserIdMessage(
          /^[0-9]{9}$/.test(value)
            ? "✔ 올바른 형식입니다."
            : "❌ 숫자 9자리여야 합니다."
        );
      }
      if (name === "userBirth" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const formatted =
          value.slice(2, 4) + value.slice(5, 7) + value.slice(8, 10);
        updated.userPassword = `${formatted}!`;
      }
      return updated;
    });
  };

  const handleEmailIdChange = (e) => {
    const emailId = e.target.value;
    setEmailId(emailId);
    const domain = emailDomain === "custom" ? customEmailDomain : emailDomain;
    setForm((prev) => ({
        ...prev,
        userEmail: emailId ? (domain ? emailId + domain : null) : null,
    }));
};

  const handleEmailDomainChange = (e) => {
    const selected = e.target.value;
    setEmailDomain(selected);
    const domain = selected === "custom" ? customEmailDomain : selected;
    setForm((prev) => ({ ...prev, userEmail: emailId + domain }));
  };

  const handleCustomDomainChange = (e) => {
    const value = e.target.value;
    setCustomEmailDomain(value);
    setForm((prev) => ({ ...prev, userEmail: emailId + "@" + value }));
  };

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    setPhoneParts((prev) => {
      const updated = { ...prev, [name]: value };
      const phone = `${updated.part1}-${updated.part2}-${updated.part3}`;
      setForm((prevForm) => ({ ...prevForm, userPhone: phone }));
      return updated;
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!form.userId) {
      setUploadMsg("❌ 먼저 ID를 입력해주세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", form.userId);

      const res = await uploadProfileImage(formData);
      setForm((prev) => ({ ...prev, userImgUrl: res.data }));
      setUploadMsg("✔ 이미지 업로드에 성공하였습니다.");
    } catch (err) {
      setUploadMsg("❌ 이미지 업로드에 실패하였습니다.");
    }
  };
  
  const cleanFormBeforeSubmit = () => {
    const newForm = { ...form };
    if (!emailId) newForm.userEmail = null;
    if (!phoneParts.part2 || !phoneParts.part3) newForm.userPhone = null;
    return newForm;
  };
  

  const handleSubmit = async () => {
    try {
      const finalForm = cleanFormBeforeSubmit(); 
      const response = await createUser(finalForm);
      const msg =
        typeof response.data === "string"
          ? response.data
          : response.data.message ?? "응답 메시지를 확인할 수 없습니다.";

      dispatch(
        showModal({
          message: msg,
          type: "success",
        })
      );

      onSuccess();

      setForm(initialForm);
      setPhoneParts({ part1: "010", part2: "", part3: "" });
      setEmailDomain("@naver.com");
      setCustomEmailDomain("");
      setEmailId("");
      setUserIdMessage("");
      setUploadMsg("");
      fileInputRef.current.value = "";
    } catch (err) {
      const errorData = err.response?.data;
      let message = "알 수 없는 에러가 발생했습니다.";
      if (typeof errorData === "string") message = errorData;
      else if (typeof errorData === "object" && errorData.message)
        // message = errorData.message;
        console.log(errorData.message);

      dispatch(
        showModal({
          message,
          type: "error",
        })
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">학생 / 교수 등록</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 사용자 구분 */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            사용자 구분 *
          </label>
          <select
            name="userRole"
            className="w-full p-2 border rounded"
            value={form.userRole}
            onChange={handleChange}
          >
            <option value="STUDENT">학생</option>
            <option value="PROFESSOR">교수</option>
          </select>
        </div>

        {/* ID */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            학번 또는 ID *
          </label>
          <input
            name="userId"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            value={form.userId}
            placeholder="예: 202500101"
          />
          <p className="text-sm mt-1 text-gray-600">{userIdMessage}</p>
        </div>

        {/* 이름 */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            이름 *
          </label>
          <input
            name="userName"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            value={form.userName}
            placeholder="예: 홍길동"
          />
        </div>

        {/* 생년월일 */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            생년월일 *
          </label>
          <input
            name="userBirth"
            type="date"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            value={form.userBirth}
          />
        </div>

        {/* 비밀번호 */}
        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            비밀번호 *
          </label>
          <div className="relative">
            <input
              name="userPassword"
              type={showPassword ? "text" : "password"}
              className="w-full p-2 border rounded pr-12"
              placeholder="기본값 : 생년월일 6자리 + !"
              value={form.userPassword}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:text-blue-800"
            >
              {showPassword ? "🔓" : "🔒"}
            </button>
          </div>
        </div>

        {/* 학과 */}
        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            소속 학과 *
          </label>
          <select
            name="departmentId"
            className="w-full p-2 border rounded"
            value={form.departmentId !== null ? String(form.departmentId) : ""}
            onChange={(e) => {
              const selected = e.target.value;
              setForm((prev) => ({
                ...prev,
                departmentId: selected !== "" ? parseInt(selected, 10) : null,
              }));
            }}
          >
            <option value="">학과 선택</option>
            {departments.map((d) => (
              <option key={d.departmentId} value={String(d.departmentId)}>
                {d.departmentName}
              </option>
            ))}
          </select>
        </div>

        {/* 이미지 업로드 */}
        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            프로필 이미지
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 border rounded file:bg-blue-600 file:text-white file:px-4 file:py-2 file:rounded file:border-0 file:text-sm file:font-semibold hover:file:bg-blue-800"
            ref={fileInputRef}
          />
          {uploadMsg && <p className="text-sm mt-1">{uploadMsg}</p>}
        </div>

        {/* 등록 버튼 */}
        <div className="md:col-span-2">
          <button
            onClick={handleSubmit}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition"
          >
            등록
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUserCreatePage;
