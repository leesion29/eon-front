import React, { useEffect, useState } from "react";
import {
  getAllSemesters,
  createSemester,
  deleteSemester,
  saveSchedule,
  getScheduleByTypeAndSemester,
  updateSemester,
} from "../../api/adminScheduleApi";
import { useDispatch, useSelector } from "react-redux";
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

  /* 테스트 아이디 권한 제약을 위한 코드 추가 */

  // 테스트 유저 여부 체크를 위한 상수 선언
  const yourUserId = useSelector((state) => state.auth.userId) || "000000000";
  const [isTester, setIstester] = useState(true);
  useEffect(() => {
    if (yourUserId == "000000000") {
      setIstester(true);
      console.log("테스트 유저", isTester);
    } else {
      setIstester(false);
      console.log("일반 유저", isTester);
    }
  }, []);

  return (
    <div className="w-4/5 mx-auto sm:w-full mt-4 sm:mt-6 md:mt-10">
      <div className="w-full sm:max-w-5xl sm:mx-auto bg-white shadow-md rounded-md p-4 md:p-6 lg:p-8 mb-8">
        <div className="mb-12">
          {/* 테스터인 경우, 안내 메시지 추가 */}
          <p
            className={`text-red-500 sm:text-right pb-3 sm:text-base text-xs ${
              !isTester ? "hidden" : ""
            }`}
          >
            테스트 유저로 접속하셨습니다. 일부 권한이 제한됩니다.
          </p>
          <div className="flex justify-between items-center border-b pb-3 mb-6">
            <h2 className="text-2xl font-semibold text-gray-700">학기 설정</h2>
            <button
              onClick={() => {
                if (!isTester) {
                  setIsSemesterModalOpen(true);
                }
              }}
              className={`px-4 py-2 text-white rounded transition text-sm font-medium ${
                !isTester
                  ? "bg-blue-700 hover:bg-blue-800"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              학기 등록
            </button>
          </div>

          {semesters.length === 0 ? (
            <p className="py-4 text-center text-gray-400">
              등록된 학기가 없습니다.
            </p>
          ) : (
            <>
              <div className="md:hidden space-y-3 shadow-md sm:shadow-none p-5 sm:p-0">
                {semesters.map((s) => (
                  <div
                    key={`${s.semesterId}-mobile`}
                    className="py-3 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                      <span className="font-medium text-gray-500 text-xs col-span-1">
                        년도:
                      </span>
                      <span className="text-xs text-gray-800 col-span-2">
                        {s.year}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                      <span className="font-medium text-gray-500 text-xs col-span-1">
                        학기:
                      </span>
                      <span className="text-xs text-gray-800 col-span-2">
                        {s.term === "FIRST" ? "1학기" : "2학기"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                      <span className="font-medium text-gray-500 text-xs col-span-1">
                        시작일:
                      </span>
                      <span className="text-xs text-gray-800 col-span-2">
                        {s.startDate
                          ? new Date(s.startDate).toLocaleDateString("ko-KR")
                          : "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 mb-2 items-center">
                      <span className="font-medium text-gray-500 text-xs col-span-1">
                        종료일:
                      </span>
                      <span className="text-xs text-gray-800 col-span-2">
                        {s.endDate
                          ? new Date(s.endDate).toLocaleDateString("ko-KR")
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        onClick={() => {
                          setEditSemester(s);
                          setIsEditModalOpen(true);
                        }}
                        className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-700 transition"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteSemester(s)}
                        className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-700 transition"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full table-auto border border-gray-200 text-sm rounded">
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
                    {semesters.map((s) => (
                      <tr
                        key={s.semesterId}
                        className="border-t hover:bg-gray-50"
                      >
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
                              if (!isTester) {
                                setEditSemester(s);
                                setIsEditModalOpen(true);
                              }
                            }}
                            className={`text-white px-3 py-1 rounded text-xs font-medium transition ${
                              !isTester
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                          >
                            수정
                          </button>
                          <button
                            onClick={() => {
                              if (!isTester) {
                                handleDeleteSemester(s);
                              }
                            }}
                            className={`text-white px-3 py-1 rounded text-xs font-medium transition ${
                              !isTester
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="shadow-md sm:shadow-none p-5 sm:p-0">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-3">
            기간 설정
          </h2>
          <div className="mb-6">
            <select
              value={selectedSemesterId || ""}
              onChange={(e) =>
                setSelectedSemesterId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="px-3 py-2 w-full sm:w-64 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="">학기 선택</option>
              {semesters.map((s) => (
                <option key={s.semesterId} value={s.semesterId}>
                  {s.year}년 {s.term === "FIRST" ? "1학기" : "2학기"}
                </option>
              ))}
            </select>
          </div>

          {selectedSemesterId &&
            schedules.length === 0 &&
            !semesters.find((s) => s.semesterId === selectedSemesterId) && (
              <p className="py-4 text-center text-gray-400">
                선택한 학기 정보를 찾을 수 없습니다. 목록을 새로고침 해주세요.
              </p>
            )}

          {(selectedSemesterId && schedules.length > 0) ||
          (selectedSemesterId &&
            semesters.find((s) => s.semesterId === selectedSemesterId) &&
            schedules.length === 0) ? (
            <>
              <div className="md:hidden space-y-3">
                {schedules.map((s) => (
                  <div
                    key={`${s.scheduleType}-mobile`}
                    className="py-3 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                      <span className="font-medium text-gray-500 text-xs col-span-1">
                        일정 종류:
                      </span>
                      <span className="text-xs text-gray-800 col-span-2">
                        {getLabel(s.scheduleType)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                      <span className="font-medium text-gray-500 text-xs col-span-1">
                        시작시간:
                      </span>
                      <span className="text-xs text-gray-800 col-span-2">
                        {s.startDate
                          ? new Date(s.startDate).toLocaleString("ko-KR", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                      <span className="font-medium text-gray-500 text-xs col-span-1">
                        종료시간:
                      </span>
                      <span className="text-xs text-gray-800 col-span-2">
                        {s.endDate
                          ? new Date(s.endDate).toLocaleString("ko-KR", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 mb-2 items-center">
                      <span className="font-medium text-gray-500 text-xs col-span-1">
                        비고:
                      </span>
                      <span className="text-xs text-gray-800 col-span-2 break-all">
                        {s.description || "-"}
                      </span>
                    </div>
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        onClick={() => {
                          setEditSchedule(s);
                          setIsScheduleModalOpen(true);
                        }}
                        className="bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-800 transition"
                      >
                        설정
                      </button>
                    </div>
                  </div>
                ))}
                {schedules.length === 0 && selectedSemesterId && (
                  <p className="py-4 text-center text-gray-400">
                    설정된 일정이 없습니다.
                  </p>
                )}
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full table-auto border border-gray-200 text-sm rounded">
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
                    {schedules.length > 0 ? (
                      schedules.map((s) => (
                        <tr
                          key={s.scheduleType}
                          className="border-t hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            {getLabel(s.scheduleType)}
                          </td>
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
                          <td className="py-3 px-4 break-all">
                            {s.description || "-"}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                if (!isTester) {
                                  setEditSchedule(s);
                                  setIsScheduleModalOpen(true);
                                }
                              }}
                              className={`text-white px-3 py-1 rounded text-xs font-medium transition ${
                                !isTester
                                  ? "bg-blue-700 hover:bg-blue-800"
                                  : "bg-gray-400 cursor-not-allowed"
                              }`}
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
            </>
          ) : (
            !selectedSemesterId && (
              <p className="py-4 text-center text-gray-400">
                학기를 선택해주세요.
              </p>
            )
          )}
        </div>
      </div>

      <BaseModal
        isOpen={isSemesterModalOpen}
        onClose={() => setIsSemesterModalOpen(false)}
      >
        <div className="space-y-4 p-1">
          <h3 className="text-xl font-semibold text-center">학기 등록</h3>
          <input
            type="number"
            placeholder="연도 (예: 2025)"
            className="w-full border px-3 py-2 rounded"
            value={newSemester.year}
            onChange={(e) =>
              setNewSemester((prev) => ({
                ...prev,
                year: parseInt(e.target.value) || "",
              }))
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              학기 시작일
            </label>
            <input
              type="date"
              className="w-full border px-3 py-2 rounded"
              value={newSemester.startDate}
              onChange={(e) =>
                setNewSemester((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              학기 종료일
            </label>
            <input
              type="date"
              className="w-full border px-3 py-2 rounded"
              value={newSemester.endDate}
              onChange={(e) =>
                setNewSemester((prev) => ({ ...prev, endDate: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setIsSemesterModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              취소
            </button>
            <button
              onClick={handleCreateSemester}
              className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
            >
              등록
            </button>
          </div>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      >
        {editSemester && (
          <div className="space-y-4 p-1">
            <h3 className="text-xl font-semibold text-center">학기 수정</h3>
            <input
              type="number"
              className="w-full border px-3 py-2 rounded"
              value={editSemester.year}
              onChange={(e) =>
                setEditSemester((prev) => ({
                  ...prev,
                  year: parseInt(e.target.value) || "",
                }))
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                학기 시작일
              </label>
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                학기 종료일
              </label>
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
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                취소
              </button>
              <button
                onClick={handleUpdateSemester}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
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
          <div className="space-y-4 p-1">
            <h3 className="text-xl font-semibold text-center">
              {getLabel(editSchedule.scheduleType)} 수정
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작 시간
              </label>
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료 시간
              </label>
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
            </div>
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
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                취소
              </button>
              <button
                onClick={handleSaveSchedule}
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
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
