import React, { useState } from "react";
import { multiUploadUsers } from "../../api/adminUserApi"; // api 연결
import Loading from "../../components/Loading";

const AdminUserMultiUploadPage = ({ onSuccess, onClose }) => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMsg("❌ 엑셀 파일을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsLoading(true);
      const res = await multiUploadUsers(formData);
      setResult(res.data);
      setErrorMsg("");

      onSuccess();

      if (res.data.failureCount === 0) {
        onClose();
      }
    } catch (err) {
      const errData = err.response?.data;
      setResult(errData);
      setErrorMsg("❌ 업로드 중 서버 오류가 발생했습니다.");
      onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      {isLoading && <Loading />}
      <h2 className="text-2xl font-bold text-center mb-6">
        학생/교수 일괄 등록
      </h2>
      {/* 파일 선택 */}
      <label className="block mb-1 text-sm font-medium text-gray-700">
        엑셀 파일 (.xlsx)
      </label>
      <div className="mb-4">
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 border rounded file:bg-blue-600 file:text-white file:px-4 file:py-2 file:rounded file:border-0 file:text-sm file:font-semibold hover:file:bg-blue-800"
        />
      </div>
      {/* 업로드 버튼 */}
      <div className="mb-6">
        <button
          onClick={handleUpload}
          className="w-full bg-blue-600 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition"
        >
          등록
        </button>
      </div>
      {/* 결과 표시 */}
      {errorMsg && <p className="text-red-600 mb-4">{errorMsg}</p>}
      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">등록 결과</h3>
          <p>✅ 성공: {result.successCount}건</p>
          <p>❌ 실패: {result.failureCount}건</p>

          {result.failureDetails && result.failureDetails.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">실패 목록</h4>
              <ul className="list-disc list-inside text-sm text-red-600">
                {result.failureDetails.map((fail, idx) => (
                  <li key={idx}>{fail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUserMultiUploadPage;
