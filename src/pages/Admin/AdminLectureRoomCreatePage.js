import React, { useState, useEffect } from "react";
import {
  createLectureRoom,
  getAllBuildings,
} from "../../api/adminLectureRoomApi";
import { useDispatch } from "react-redux";
import { showModal } from "../../slices/modalSlice"; 

const initialForm = {
  roomName: "",
  buildingId: "",
};

const AdminLectureRoomCreatePage = ({ onSuccess }) => {
  const [form, setForm] = useState(initialForm);
  const [buildings, setBuildings] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    getAllBuildings()
      .then((res) => setBuildings(res.data))
      .catch(() => setBuildings([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await createLectureRoom(form.roomName, form.buildingId);
      dispatch(
        showModal({
          message: "강의실이 성공적으로 등록되었습니다.",
          type: "success",
        })
      );
      onSuccess(); // 부모에서 갱신
      setForm(initialForm);
    } catch (err) {
      console.error("에러 발생:", err);

      const errorMessage =
        typeof err?.response?.data === "string"
          ? err.response.data
          : err?.response?.data?.message || "요청 처리 중 오류가 발생했습니다.";

      dispatch(
        showModal({
          message: errorMessage,
          type: "error",
        })
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">강의실 등록</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 건물 선택 */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            건물 선택 *
          </label>
          <select
            name="buildingId"
            className="w-full p-2 border rounded"
            value={form.buildingId}
            onChange={handleChange}
          >
            <option value="">선택</option>
            {buildings.map((building) => (
              <option key={building.buildingId} value={building.buildingId}>
                {building.buildingName}
              </option>
            ))}
          </select>
        </div>

        {/* 강의실 이름 */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            강의실 이름 *
          </label>
          <input
            name="roomName"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            value={form.roomName}
            placeholder="예: 101호"
          />
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

export default AdminLectureRoomCreatePage;
