import React, { useState, useEffect, useRef } from "react";
import {
  getDepartments,
  uploadProfileImage,
  updateUser,
  resetPassword,
} from "../../api/adminUserApi";
import { useDispatch } from "react-redux";
import { showModal } from "../../slices/modalSlice";
import ConfirmModal from "../../components/ConfirmModal";

const AdminUserEditPage = ({ user, onSuccess, onClose }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ ...user });
  const [departments, setDepartments] = useState([]);
  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("@naver.com");
  const [customEmailDomain, setCustomEmailDomain] = useState("");
  const [uploadMsg, setUploadMsg] = useState("");
  const [phoneParts, setPhoneParts] = useState({
    part1: "",
    part2: "",
    part3: "",
  });
  const fileInputRef = useRef(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    getDepartments()
      .then((res) => setDepartments(res.data))
      .catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    if (user) {
      if (user.userEmail) {
        const [idPart, domainPart] = user.userEmail.split("@");
        setEmailId(idPart);
        setEmailDomain(domainPart ? "@" + domainPart : "@naver.com"); 
      } else {
        setEmailId("");
        setEmailDomain("@naver.com");
      }
  
      if (user.userPhone) {
        const [part1, part2, part3] = user.userPhone.split("-");
        setPhoneParts({ part1, part2, part3 });
      } else {
        setPhoneParts({ part1: "010", part2: "", part3: "" });
      }
    }
  }, [user]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailIdChange = (e) => {
    const emailId = e.target.value;
    setEmailId(emailId);
    const domain = emailDomain === "custom" ? customEmailDomain : emailDomain;
    setForm((prev) => ({ ...prev, userEmail: emailId + domain }));
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

  const handleSubmit = async () => {
    try {
      const response = await updateUser(form);
      const msg =
        typeof response.data === "string"
          ? response.data
          : response.data.message ?? "응답 메시지를 확인할 수 없습니다.";

      dispatch(showModal({ message: msg }));
      onSuccess();
      onClose();
    } catch (err) {
      const errorData = err.response?.data;
      let message = "알 수 없는 에러가 발생했습니다.";
      if (typeof errorData === "string") message = errorData;
      else if (typeof errorData === "object" && errorData.message)
        message = errorData.message;

      dispatch(showModal({ message, type: "error" }));
    }
  };

  const handleResetPassword = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmResetPassword = async () => {
    try {
      const response = await resetPassword(form.userId);
      dispatch(showModal({ message: response.data }));
      setIsConfirmModalOpen(false);
    } catch (err) {
      const errorData = err.response?.data;
      let message = "알 수 없는 에러가 발생했습니다.";
      if (typeof errorData === "string") message = errorData;
      else if (typeof errorData === "object" && errorData.message)
        message = errorData.message;

      dispatch(showModal({ message, type: "error" }));
      setIsConfirmModalOpen(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">
        학생 / 교수 정보 수정
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            학번 또는 ID *
          </label>
          <input
            name="userId"
            className="w-full p-2 border rounded bg-gray-100"
            value={form.userId}
            disabled
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            이름 *
          </label>
          <input
            name="userName"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            value={form.userName}
          />
        </div>

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

        <div className="md:col-span-2">
          <button
            onClick={handleResetPassword}
            className="w-full mt-2 bg-yellow-600 hover:bg-yellow-800 text-white font-semibold py-3 rounded-lg transition"
          >
            비밀번호 초기화
          </button>
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            이메일 *
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              className="flex-1 min-w-[100px] p-2 border rounded"
              placeholder="아이디"
              value={emailId}
              onChange={handleEmailIdChange}
            />
            <span className="self-center">@</span>
            <select
              className="flex-1 min-w-[120px] p-2 border rounded"
              onChange={handleEmailDomainChange}
              value={emailDomain}
            >
              <option value="@naver.com">naver.com</option>
              <option value="@gmail.com">gmail.com</option>
              <option value="custom">직접 입력</option>
            </select>
            {emailDomain === "custom" && (
              <input
                className="flex-1 min-w-[120px] p-2 border rounded"
                placeholder="직접입력"
                value={customEmailDomain}
                onChange={handleCustomDomainChange}
              />
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            전화번호 *
          </label>
          <div className="flex space-x-2">
            <input
              name="part1"
              maxLength={3}
              className="w-1/3 p-2 border rounded"
              value={phoneParts.part1}
              onChange={handlePhoneChange}
            />
            <input
              name="part2"
              maxLength={4}
              className="w-1/3 p-2 border rounded"
              value={phoneParts.part2}
              onChange={handlePhoneChange}
            />
            <input
              name="part3"
              maxLength={4}
              className="w-1/3 p-2 border rounded"
              value={phoneParts.part3}
              onChange={handlePhoneChange}
            />
          </div>
        </div>

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

        <div className="md:col-span-2">
          <button
            onClick={handleSubmit}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition"
          >
            수정
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        message={`비밀번호를 초기화하시겠습니까?\n( 기본값 : 생년월일 6자리 + ! )`}
        onConfirm={handleConfirmResetPassword}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
};

export default AdminUserEditPage;
