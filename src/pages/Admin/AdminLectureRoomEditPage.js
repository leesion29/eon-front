import React, { useState, useEffect } from "react";
import { updateLectureRoom } from "../../api/adminLectureRoomApi";
import { useDispatch } from "react-redux";
import { showModal } from "../../slices/modalSlice";

const AdminLectureRoomEditPage = ({ roomId, rooms, onSuccess }) => {
  const [form, setForm] = useState({
    roomName: "",
    newName: "",
    newStatus: "",
  });
  const dispatch = useDispatch();

  useEffect(() => {
    if (roomId && rooms) {
      // roomId를 숫자로 변환해서 비교
      const room = rooms.find((r) => Number(r.roomId) === Number(roomId));
      if (room) {
        setForm({
          roomName: room.roomName,
          newName: room.roomName,
          newStatus: room.status,
        });
      } else {
        dispatch(
          showModal({ message: "강의실을 찾을 수 없습니다.", type: "error" })
        );
      }
    }
  }, [roomId, rooms, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      // roomId를 숫자로 변환해서 전달
      await updateLectureRoom(Number(roomId), form.newName, form.newStatus);
      dispatch(
        showModal({
          message: "강의실이 성공적으로 수정되었습니다.",
          type: "success",
        })
      );
      onSuccess(form.newName);
    } catch (err) {
      dispatch(
        showModal({
          message: err?.response?.data || "강의실 수정 중 오류가 발생했습니다.",
          type: "error",
        })
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6">강의실 수정</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 강의실 이름 */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            강의실 이름 *
          </label>
          <input
            name="newName"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            value={form.newName}
            placeholder="예: 101호"
          />
        </div>

        {/* 상태 선택 */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            상태 *
          </label>
          <select
            name="newStatus"
            className="w-full p-2 border rounded"
            value={form.newStatus}
            onChange={handleChange}
          >
            <option value="AVAILABLE">사용 가능</option>
            <option value="UNAVAILABLE">사용 불가</option>
          </select>
        </div>

        {/* 수정 버튼 */}
        <div className="md:col-span-2">
          <button
            onClick={handleSubmit}
            className="w-full mt-4 bg-green-600 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition"
          >
            수정
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLectureRoomEditPage;
