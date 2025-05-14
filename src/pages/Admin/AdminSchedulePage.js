import React, { useEffect, useState } from "react";
import {
  getAllSemesters,
  createSemester,
  deleteSemester,
  saveSchedule,
  getScheduleByTypeAndSemester,
  updateSemester,
} from "../../api/adminScheduleApi";
import { useDispatch } from "react-redux";
import { showModal } from "../../slices/modalSlice";
import BaseModal from "../../components/BaseModal";
import useConfirmModal from "../../hooks/useConfirmModal";

const SCHEDULE_TYPES = [
  { type: "ENROLL", label: "수강신청 기간" },
  { type: "CLASS", label: "강의등록 기간" },
  { type: "GRADE", label: "성적입력 기간" },
];

const AdminSchedulePage = () => {
  const dispatch = useDispatch();
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [editSchedule, setEditSchedule] = useState(null);
  const { openConfirm, ConfirmModalComponent } = useConfirmModal();
  const [newSemester, setNewSemester] = useState({
    year: new Date().getFullYear(),
    term: "FIRST",
    startDate: "",
    endDate: "",
  });

  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const fetchSemesters = async () => {
    try {
      const res = await getAllSemesters();
      setSemesters(res.data);
    } catch {
      dispatch(
        showModal({ message: "학기 목록 불러오기 실패", type: "error" })
      );
    }
  };

  const fetchSchedules = async (semesterId) => {
    const results = await Promise.all(
      SCHEDULE_TYPES.map(async ({ type }) => {
        try {
          const res = await getScheduleByTypeAndSemester(type, semesterId);
          return res.data;
        } catch {
          return {
            scheduleType: type,
            semesterId,
            startDate: "",
            endDate: "",
            description: "",
          };
        }
      })
    );
    setSchedules(results);
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (selectedSemesterId) fetchSchedules(selectedSemesterId);
  }, [selectedSemesterId]);

  const handleCreateSemester = async () => {
    try {
      await createSemester(newSemester);
      dispatch(showModal("학기가 등록되었습니다."));
      setIsSemesterModalOpen(false);
      setNewSemester({
        year: new Date().getFullYear(),
        term: "FIRST",
        startDate: "",
        endDate: "",
      });
      fetchSemesters();
    } catch {
      dispatch(showModal({ message: "학기 등록 실패", type: "error" }));
    }
  };

  const handleSaveSchedule = async () => {
    try {
      await saveSchedule({ ...editSchedule, semesterId: selectedSemesterId });
      dispatch(showModal("일정이 저장되었습니다."));
      setIsScheduleModalOpen(false);
      fetchSchedules(selectedSemesterId);
    } catch {
      dispatch(showModal({ message: "일정 저장 실패", type: "error" }));
    }
  };

  const [editSemester, setEditSemester] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleUpdateSemester = async () => {
    try {
      const res = await updateSemester(editSemester.semesterId, editSemester);
      if (res.status === 200) {
        dispatch(showModal("학기 수정 완료"));
        setIsEditModalOpen(false);
        fetchSemesters();
      }
    } catch (err) {
      const message = err.response?.data || "학기 수정 실패";
      dispatch(showModal({ message, type: "error" }));
    }
  };


  const handleDeleteSemester = async (semester) => {
    openConfirm(
      `${semester.year}년 ${
        semester.term === "FIRST" ? "1학기" : "2학기"
      } \n\n 이 학기를 삭제하시겠습니까?`,
      async () => {
        try {
          await deleteSemester(semester.semesterId);
          dispatch(showModal("학기가 삭제되었습니다."));
          fetchSemesters();
        } catch (err) {
          dispatch(
            showModal({
              message: err.response?.data || "학기 삭제 실패",
              type: "error",
            })
          );
        }
      }
    );
  };


  const getLabel = (type) =>
    SCHEDULE_TYPES.find((t) => t.type === type)?.label || type;

  return (
    <div className="max-w-7xl mx-auto space-y-12 p-8">
      {/* 학기 설정 영역 */}
      <div className="bg-white shadow-md rounded-md p-8">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-700">학기 설정</h2>
          <button
            onClick={() => setIsSemesterModalOpen(true)}
            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
          >
            학기 등록
          </button>
        </div>

        <table className="min-w-full table-auto border border-gray-200 text-sm rounded">
          {/* 학기 목록 테이블 내용 그대로 */}
          <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
            <tr>
              <th className="py-3 px-4">년도</th>
              <th className="py-3 px-4">학기</th>
              <th className="py-3 px-4">학기 시작일</th>
              <th className="py-3 px-4">학기 종료일</th>
              <th className="py-3 px-4">관리</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-center">
            {/* 학기 목록 rows 그대로 */}
            {semesters.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-gray-400">
                  등록된 학기가 없습니다.
                </td>
              </tr>
            ) : (
              semesters.map((s) => (
                <tr key={s.semesterId} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{s.year}</td>
                  <td className="py-3 px-4">
                    {s.term === "FIRST" ? "1학기" : "2학기"}
                  </td>
                  <td className="py-3 px-4">
                    {s.startDate
                      ? new Date(s.startDate).toLocaleDateString("ko-KR")
                      : "-"}
                  </td>
                  <td className="py-3 px-4">
                    {s.endDate
                      ? new Date(s.endDate).toLocaleDateString("ko-KR")
                      : "-"}
                  </td>
                  <td className="py-3 px-4 space-x-2">
                    <button
                      onClick={() => {
                        setEditSemester(s);
                        setIsEditModalOpen(true);
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteSemester(s)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 기간 설정 영역 */}
      <div className="bg-white shadow-md rounded-md p-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">기간 설정</h2>

        <div className="mb-6">
          <select
            value={selectedSemesterId || ""}
            onChange={(e) => setSelectedSemesterId(Number(e.target.value))}
            className="px-3 py-2 w-64 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="">학기 선택</option>
            {semesters.map((s) => (
              <option key={s.semesterId} value={s.semesterId}>
                {s.year}년 {s.term === "FIRST" ? "1학기" : "2학기"}
              </option>
            ))}
          </select>
        </div>

        <table className="min-w-full table-auto border border-gray-200 text-sm rounded">
          {/* 일정 테이블 */}
          <thead className="bg-gray-50 text-gray-600 uppercase text-sm">
            <tr>
              <th className="py-3 px-4">일정 종류</th>
              <th className="py-3 px-4">일정 시작시간</th>
              <th className="py-3 px-4">일정 종료시간</th>
              <th className="py-3 px-4">비고</th>
              <th className="py-3 px-4">관리</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-center">
            {selectedSemesterId && schedules.length > 0 ? (
              schedules.map((s) => (
                <tr key={s.scheduleType} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{getLabel(s.scheduleType)}</td>
                  <td className="py-3 px-4">
                    {s.startDate
                      ? new Date(s.startDate).toLocaleString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td className="py-3 px-4">
                    {s.endDate
                      ? new Date(s.endDate).toLocaleString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td className="py-3 px-4">{s.description || "-"}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        setEditSchedule(s);
                        setIsScheduleModalOpen(true);
                      }}
                      className="bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800 transition"
                    >
                      설정
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-4 text-gray-400">
                  {selectedSemesterId
                    ? "설정된 일정이 없습니다."
                    : "학기를 선택해주세요."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 모달: 학기 등록 */}
      <BaseModal
        isOpen={isSemesterModalOpen}
        onClose={() => setIsSemesterModalOpen(false)}
      >
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">학기 등록</h3>
          <input
            type="number"
            placeholder="연도 (예: 2025)"
            className="w-full border px-3 py-2 rounded"
            value={newSemester.year}
            onChange={(e) =>
              setNewSemester((prev) => ({ ...prev, year: e.target.value }))
            }
          />
          <select
            className="w-full border px-3 py-2 rounded"
            value={newSemester.term}
            onChange={(e) =>
              setNewSemester((prev) => ({ ...prev, term: e.target.value }))
            }
          >
            <option value="FIRST">1학기</option>
            <option value="SECOND">2학기</option>
          </select>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            value={newSemester.startDate}
            onChange={(e) =>
              setNewSemester((prev) => ({ ...prev, startDate: e.target.value }))
            }
          />
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            value={newSemester.endDate}
            onChange={(e) =>
              setNewSemester((prev) => ({ ...prev, endDate: e.target.value }))
            }
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsSemesterModalOpen(false)}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              취소
            </button>
            <button
              onClick={handleCreateSemester}
              className="px-4 py-2 bg-blue-700 text-white rounded"
            >
              등록
            </button>
          </div>
        </div>
      </BaseModal>

      {/* 모달: 일정 수정 */}
      <BaseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      >
        {editSemester && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">학기 수정</h3>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={editSemester.year}
              onChange={(e) =>
                setEditSemester((prev) => ({ ...prev, year: e.target.value }))
              }
            />
            <select
              className="w-full border px-3 py-2 rounded"
              value={editSemester.term}
              onChange={(e) =>
                setEditSemester((prev) => ({ ...prev, term: e.target.value }))
              }
            >
              <option value="FIRST">1학기</option>
              <option value="SECOND">2학기</option>
            </select>
            <input
              type="date"
              className="w-full border px-3 py-2 rounded"
              value={editSemester.startDate}
              onChange={(e) =>
                setEditSemester((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
            />
            <input
              type="date"
              className="w-full border px-3 py-2 rounded"
              value={editSemester.endDate}
              onChange={(e) =>
                setEditSemester((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                취소
              </button>
              <button
                onClick={handleUpdateSemester}
                className="px-4 py-2 bg-blue-700 text-white rounded"
              >
                저장
              </button>
            </div>
          </div>
        )}
      </BaseModal>

      <BaseModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
      >
        {editSchedule && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              {getLabel(editSchedule.scheduleType)} 수정
            </h3>
            <input
              type="datetime-local"
              className="w-full border px-3 py-2 rounded"
              value={editSchedule.startDate}
              onChange={(e) =>
                setEditSchedule((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
            />
            <input
              type="datetime-local"
              className="w-full border px-3 py-2 rounded"
              value={editSchedule.endDate}
              onChange={(e) =>
                setEditSchedule((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
            />
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              placeholder="비고"
              value={editSchedule.description}
              onChange={(e) =>
                setEditSchedule((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                취소
              </button>
              <button
                onClick={handleSaveSchedule}
                className="px-4 py-2 bg-blue-700 text-white rounded"
              >
                저장
              </button>
            </div>
          </div>
        )}
      </BaseModal>
      {ConfirmModalComponent}
    </div>
  );
};

export default AdminSchedulePage;
