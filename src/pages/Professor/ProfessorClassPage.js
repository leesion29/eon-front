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
    <div className="max-w-7xl mx-auto p-3 sm:p-6 md:p-8 bg-white shadow-md rounded-md mt-4 sm:mt-6 md:mt-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2 sm:mb-0">
          내 강의 관리
        </h2>
        {isClassRegPeriod && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition text-sm"
          >
            강의 등록
          </button>
        )}
      </div>

      <div className="mb-4 sm:mb-6">
        <select
          value={selectedSemesterId || ""}
          onChange={(e) => {
            const semesterId = e.target.value;
            setSelectedSemesterId(semesterId);
            fetchClasses(1, semesterId);
          }}
          className="px-3 py-2 w-full sm:w-64 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm text-gray-700 
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

      <div>
        <table className="w-full sm:table-auto sm:shadow-sm sm:border sm:border-gray-200 sm:rounded-md sm:border-collapse">
          <thead className="hidden sm:table-header-group bg-gray-50 text-gray-600 uppercase text-xs leading-normal">
            <tr>
              <th className="sm:py-3 sm:px-4 text-center">과목명</th>
              <th className="sm:py-3 sm:px-4 text-center">구분</th>
              <th className="sm:py-3 sm:px-4 text-center">학년</th>
              <th className="sm:py-3 sm:px-4 text-center">학기</th>
              <th className="sm:py-3 sm:px-4 text-center">요일</th>
              <th className="sm:py-3 sm:px-4 text-center">시간</th>
              <th className="sm:py-3 sm:px-4 text-left">강의실</th>
              <th className="sm:py-3 sm:px-4 text-center">수강인원</th>
              <th className="sm:py-3 sm:px-4 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="block sm:table-row-group text-gray-700">
            {classes.dtoList.length === 0 ? (
              <tr className="block sm:table-row">
                <td colSpan={9} className="block sm:table-cell py-6 text-center text-gray-400 text-xs sm:text-sm">
                  {selectedSemesterId
                    ? "해당 학기의 강의가 없습니다."
                    : "강의 정보가 없습니다."}
                </td>
              </tr>
            ) : (
              classes.dtoList.map((c) => (
                <tr
                  key={c.classId}
                  className="block sm:table-row mb-4 sm:mb-0 p-3 sm:p-0 border rounded-lg sm:rounded-none shadow-md sm:shadow-none hover:bg-gray-50 sm:hover:bg-gray-100 sm:border-b sm:border-gray-200"
                >
                  <td
                    data-label="과목명"
                    className="block order-first sm:order-none font-bold text-blue-800 pb-2 mb-2 border-b sm:border-b-0 sm:pb-0 sm:mb-0 sm:table-cell sm:h-12 sm:py-0 sm:px-4 sm:items-center sm:justify-center sm:text-center sm:text-sm sm:font-normal sm:text-gray-700"
                  >
                    {c.courseName}
                  </td>
                  <td
                    data-label="구분"
                    className="block text-xs text-gray-600 pt-1 pb-0.5 sm:table-cell sm:h-12 sm:py-0 sm:px-4 sm:items-center sm:justify-center sm:text-center sm:text-sm sm:text-gray-700"
                  >
                    <span className="font-medium sm:hidden mr-2 text-gray-800">
                      구분:
                    </span>
                    {c.courseType === "MAJOR" ? "전공" : "교양"}
                  </td>
                  <td
                    data-label="학년"
                    className="block text-xs text-gray-600 pt-0.5 pb-0.5 sm:table-cell sm:h-12 sm:py-0 sm:px-4 sm:flex sm:items-center sm:justify-center sm:text-center sm:text-sm sm:text-gray-700"
                  >
                    <span className="font-medium sm:hidden mr-2 text-gray-800">
                      학년:
                    </span>
                    {c.courseYear}학년
                  </td>
                  <td
                    data-label="학기"
                    className="block text-xs text-gray-600 pt-0.5 pb-0.5 sm:table-cell sm:h-12 sm:py-0 sm:px-4 sm:flex sm:items-center sm:justify-center sm:text-center sm:text-sm sm:text-gray-700"
                  >
                    <span className="font-medium sm:hidden mr-2 text-gray-800">
                      학기:
                    </span>
                    {c.semester}
                  </td>
                  <td
                    data-label="요일"
                    className="block text-xs text-gray-600 pt-0.5 pb-0.5 sm:table-cell sm:h-12 sm:py-0 sm:px-4 sm:flex sm:items-center sm:justify-center sm:text-center sm:text-sm sm:text-gray-700"
                  >
                    <span className="font-medium sm:hidden mr-2 text-gray-800">
                      요일:
                    </span>
                    {c.day}
                  </td>
                  <td
                    data-label="시간"
                    className="block text-xs text-gray-600 pt-0.5 pb-0.5 sm:table-cell sm:h-12 sm:py-0 sm:px-4 sm:flex sm:items-center sm:justify-center sm:text-center sm:text-sm sm:text-gray-700"
                  >
                    <span className="font-medium sm:hidden mr-2 text-gray-800">
                      시간:
                    </span>
                    {`${c.startTime} ~ ${c.endTime}교시`}
                  </td>
                  <td
                    data-label="강의실"
                    className="block text-xs text-gray-600 pt-0.5 pb-0.5 sm:table-cell sm:h-12 sm:py-0 sm:px-4 sm:flex sm:items-center sm:justify-start sm:text-left sm:text-sm sm:text-gray-700"
                  >
                    <span className="font-medium sm:hidden mr-2 text-gray-800">
                      강의실:
                    </span>
                    {`${c.buildingName} ${c.lectureRoomName}`}
                  </td>
                  <td
                    data-label="수강인원"
                    className="block text-xs text-gray-600 pt-0.5 pb-0.5 sm:table-cell sm:h-12 sm:py-0 sm:px-4 sm:flex sm:items-center sm:justify-center sm:text-center sm:text-sm sm:text-gray-700"
                  >
                    <span className="font-medium sm:hidden mr-2 text-gray-800">
                      수강인원:
                    </span>
                    {`${c.enrolled} / ${c.capacity}`}
                  </td>
                  <td
                    data-label="관리"
                    className="block text-left pt-2 sm:table-cell sm:h-12 sm:py-0 sm:px-4 sm:flex sm:items-center sm:justify-center"
                  >
                    {c.isCurrentSemester ? (
                      <div className="flex flex-row items-center justify-start space-x-1 sm:justify-center sm:space-x-1 pt-1 sm:pt-0">
                        <button
                          onClick={() => setEditClass(c)}
                          className="w-14 sm:w-auto text-white bg-green-600 px-2 py-1 rounded hover:bg-green-700 text-xs"
                        >
                          수정
                        </button>
                        {isClassRegPeriod && (
                          <button
                            onClick={() => handleDelete(c)}
                            className="w-14 sm:w-auto text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700 text-xs"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-row items-center justify-start sm:justify-center pt-1 sm:pt-0 sm:h-full">
                        <span className="hidden sm:inline-flex sm:items-center sm:justify-center sm:w-14 sm:h-7 text-gray-400 text-xs rounded">
                          -
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
