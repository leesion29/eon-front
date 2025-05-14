import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyClasses,
  deleteClass,
  isClassScheduleOpen,
} from "../../api/professorClassApi";
import { getAllSemesters } from "../../api/adminScheduleApi";
import { setUserId } from "../../slices/authSlice";
import { showModal } from "../../slices/modalSlice";
import PageComponent from "../../components/PageComponent";
import BaseModal from "../../components/BaseModal";
import ProfessorClassCreatePage from "./ProfessorClassCreatePage";
import ProfessorClassEditPage from "./ProfessorClassEditPage";
import useConfirmModal from "../../hooks/useConfirmModal";

const ProfessorClassPage = () => {
  const { openConfirm, ConfirmModalComponent } = useConfirmModal();
  const [isClassRegPeriod, setIsClassRegPeriod] = useState(true);

  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.userId);

  const [classes, setClasses] = useState({
    dtoList: [],
    totalPage: 0,
    current: 1,
    totalCount: 0,
  });
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editClass, setEditClass] = useState(null);

  useEffect(() => {
    const localId = localStorage.getItem("id");
    if (!userId && localId) {
      dispatch(setUserId(localId));
    }
  }, [userId, dispatch]);

  const fetchClasses = async (page = 1, semesterId = null) => {
    try {
      const res = await getMyClasses(page, 10, "id", "asc", semesterId);
      setClasses(res.data);
      setCurrentPage(page);
    } catch (err) {
      dispatch(
        showModal({
          message: "강의 목록을 불러오지 못했습니다.",
          type: "error",
        })
      );
    }
  };

  useEffect(() => {
    if (userId) {
      fetchClasses(1);
      isClassScheduleOpen()
        .then((res) => setIsClassRegPeriod(res.data))
        .catch(() => setIsClassRegPeriod(false));
      getAllSemesters()
        .then((res) => setSemesters(res.data))
        .catch(() => setSemesters([]));
    }
  }, [userId]);

  const handleDelete = (classData) => {
    openConfirm(
      `과목: ${classData.courseName}\n학기: ${classData.semester}\n\n삭제하시겠습니까?`,
      async () => {
        try {
          await deleteClass(classData.classId);
          dispatch(showModal("강의가 성공적으로 삭제되었습니다."));
          fetchClasses(currentPage, selectedSemesterId);
        } catch (err) {
          dispatch(showModal({ message: "삭제 중 오류 발생", type: "error" }));
        }
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white shadow-md rounded-md mt-10">
      <div className="flex justify-between items-center border-b pb-3 mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">내 강의 관리</h2>
        {isClassRegPeriod && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
          >
            강의 등록
          </button>
        )}
      </div>

      <div className="mb-6">
        <select
          value={selectedSemesterId || ""}
          onChange={(e) => {
            const semesterId = e.target.value;
            setSelectedSemesterId(semesterId);
            fetchClasses(1, semesterId);
          }}
          className="px-3 py-2 w-64 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        >
          <option value="">전체 학기</option>
          {semesters.map((s) => (
            <option key={s.semesterId} value={s.semesterId}>
              {s.year}년 {s.term === "FIRST" ? "1학기" : "2학기"}
            </option>
          ))}
        </select>
      </div>

      <table className="min-w-full table-auto shadow-sm border border-gray-200 rounded-md">
        <thead className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
          <tr>
            <th className="py-3 px-4">과목명</th>
            <th className="py-3 px-4">구분</th>
            <th className="py-3 px-4">학년</th>
            <th className="py-3 px-4">학기</th>
            <th className="py-3 px-4">요일</th>
            <th className="py-3 px-4">시간</th>
            <th className="py-3 px-4">강의실</th>
            <th className="py-3 px-4">수강인원</th>
            <th className="py-3 px-4">관리</th>
          </tr>
        </thead>
        <tbody className="text-gray-700 text-sm text-center">
          {classes.dtoList.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-6 text-gray-400">
                {selectedSemesterId
                  ? "해당 학기의 강의가 없습니다."
                  : "강의 정보가 없습니다."}
              </td>
            </tr>
          ) : (
            classes.dtoList.map((c) => (
              <tr key={c.classId} className="hover:bg-gray-100 border-b">
                <td className="py-3 px-4">{c.courseName}</td>
                <td className="py-3 px-4">
                  {c.courseType === "MAJOR" ? "전공" : "교양"}
                </td>
                <td className="py-3 px-4">{c.courseYear}학년</td>
                <td className="py-3 px-4">{c.semester}</td>
                <td className="py-3 px-4">{c.day}</td>
                <td className="py-3 px-4">{`${c.startTime} ~ ${c.endTime}교시`}</td>
                <td className="py-3 px-4">{`${c.buildingName} ${c.lectureRoomName}`}</td>
                <td className="py-3 px-4">{`${c.enrolled} / ${c.capacity}`}</td>
                <td className="py-3 px-4 space-x-2">
                  {c.isCurrentSemester ? (
                    <>
                      <button
                        onClick={() => setEditClass(c)}
                        className="text-white bg-green-600 px-2 py-1 rounded hover:bg-green-700"
                      >
                        수정
                      </button>
                      {isClassRegPeriod && (
                        <button
                          onClick={() => handleDelete(c)}
                          className="text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                        >
                          삭제
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <PageComponent
        currentPage={classes.current}
        totalPage={classes.totalPage}
        onPageChange={(page) => fetchClasses(page, selectedSemesterId)}
      />

      <BaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ProfessorClassCreatePage
          professorId={userId}
          onSuccess={() => fetchClasses(currentPage, selectedSemesterId)}
        />
      </BaseModal>

      <BaseModal isOpen={!!editClass} onClose={() => setEditClass(null)}>
        <ProfessorClassEditPage
          classData={editClass}
          onSuccess={() => fetchClasses(currentPage, selectedSemesterId)}
          onClose={() => setEditClass(null)}
        />
      </BaseModal>

      {ConfirmModalComponent}
    </div>
  );
};

export default ProfessorClassPage;
