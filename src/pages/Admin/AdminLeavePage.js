import React, { useState, useEffect } from "react";
import AlertModal from "../../components/AlertModal";
import BaseModal from "../../components/BaseModal";
import {
  findStudentName,
  responseLeave,
  seeLeaveList,
} from "../../api/adminLeaveReturnApi";
import { getAllSemesters } from "../../api/adminScheduleApi";
import PageComponent from "../../components/PageComponent";

const AdminLeavePage = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [denialReason, setDenialReason] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const paginatedLeaveRequests = leaveRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const data = await seeLeaveList();
      setLeaveRequests(data);
      setLoading(false);
    } catch (error) {
      console.error("휴학 신청 목록 불러오기 오류:", error);
      showAlert("데이터를 불러오는 데 실패했습니다.", "error");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const getReasonLabel = (reason) => {
    const map = {
      MILITARY: "군대",
      FAMILY: "가정사",
      ILLNESS: "질병",
      PERSONAL: "개인사정",
      STUDY_ABROAD: "유학",
      OTHER: "기타",
    };
    return map[reason] || reason;
  };

  const getStatusLabel = (status) => {
    const map = {
      PENDING: "대기",
      APPROVED: "승인",
      DENIED: "거절",
    };
    return map[status] || status;
  };

  const handlePrintSemester = async (semesterId) => {
    try {
      const res = await getAllSemesters();
      const currentSemester = res.data.filter(
        (s) => s.semesterId === semesterId
      );
      if (!currentSemester || currentSemester.length === 0) return "-";
      return (
        currentSemester[0].year +
        "년도 " +
        (currentSemester[0].term === "FIRST" ? 1 : 2) +
        "학기"
      );
    } catch (error) {
      console.error("학기 데이터 불러오기 실패", error);
      return "-";
    }
  };

  const handleApprove = async (request) => {
    try {
      await responseLeave(request.leaveId, {
        status: "APPROVED",
        denialReason: null,
      });
      showAlert("휴학 신청이 승인되었습니다.", "success");
      fetchLeaveRequests();
    } catch (error) {
      console.error("승인 오류:", error);
      showAlert("승인 처리 중 오류가 발생했습니다.", "error");
    }
  };

  const openRejectModal = (request) => {
    const nameElement =
      document.getElementById(request.leaveId) ||
      document.getElementById(`${request.leaveId}-mobile`);
    const name = nameElement ? nameElement.innerText : "";
    setCurrentRequest({ ...request, studentName: name });
    setDenialReason("");
    setRejectModalOpen(true);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!denialReason.trim()) {
      showAlert("거절 사유를 입력해주세요.", "error");
      return;
    }
    try {
      await responseLeave(currentRequest?.leaveId, {
        status: "DENIED",
        denialReason: denialReason || null,
      });
      setRejectModalOpen(false);
      showAlert("휴학 신청이 거절되었습니다.", "success");
      fetchLeaveRequests();
    } catch (error) {
      console.error("거절 처리 중 오류 발생:", error);
      showAlert("거절 처리 중 오류가 발생했습니다.", "error");
    }
  };

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertOpen(true);
  };

  const handleStudentName = async (leaveId, type) => {
    if (!leaveId || leaveId.length === 0) return "";
    const data = await findStudentName(leaveId, type);
    return data;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">로딩 중...</div>
    );

  return (
    <div className="w-4/5 mx-auto sm:w-full mt-4 sm:mt-6 md:mt-10">
      <div className="w-full sm:max-w-5xl sm:mx-auto bg-white shadow-md rounded-md p-4 md:p-6 lg:p-8 mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-6">
          🔍 휴학 신청 관리
        </h2>

        {paginatedLeaveRequests.length === 0 && !loading ? (
          <p className="py-4 text-center text-gray-400">
            처리할 휴학 신청 내역이 없습니다.
          </p>
        ) : (
          <>
            <div className="md:hidden space-y-3">
              {paginatedLeaveRequests.map((req, idx) => (
                <div
                  key={`${req.leaveId}-mobile-card`}
                  className="py-3 border-b border-gray-200 last:border-b-0"
                >
                  <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                    <span className="font-medium text-gray-500 text-xs col-span-1">
                      No:
                    </span>
                    <span className="text-xs text-gray-800 col-span-2">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                    <span className="font-medium text-gray-500 text-xs col-span-1">
                      학번:
                    </span>
                    <span className="text-xs text-gray-800 col-span-2">
                      {req.student}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                    <span className="font-medium text-gray-500 text-xs col-span-1">
                      이름:
                    </span>
                    <span
                      id={`${req.leaveId}-mobile`}
                      className="text-xs text-gray-800 col-span-2"
                    >
                      불러오는 중...
                    </span>
                    {
                      void requestAnimationFrame(() =>
                        handleStudentName(req.leaveId, "leave").then((n) => {
                          const element = document.getElementById(
                            `${req.leaveId}-mobile`
                          );
                          if (element) element.innerText = n;
                        })
                      )
                    }
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                    <span className="font-medium text-gray-500 text-xs col-span-1">
                      신청사유:
                    </span>
                    <span className="text-xs text-gray-800 col-span-2">
                      {getReasonLabel(req.reason)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                    <span className="font-medium text-gray-500 text-xs col-span-1">
                      상세사유:
                    </span>
                    <span className="text-xs text-gray-800 col-span-2 break-all truncate">
                      {req.reasonDetail}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                    <span className="font-medium text-gray-500 text-xs col-span-1">
                      신청일:
                    </span>
                    <span className="text-xs text-gray-800 col-span-2">
                      {new Date(req.requestDate).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                    <span className="font-medium text-gray-500 text-xs col-span-1">
                      복학예정:
                    </span>
                    <span
                      id={`semester-${req.leaveId}-mobile`}
                      className="text-xs text-gray-800 col-span-2"
                    >
                      불러오는 중...
                    </span>
                    {
                      void requestAnimationFrame(() =>
                        handlePrintSemester(req.expectedSemester).then(
                          (label) => {
                            const element = document.getElementById(
                              `semester-${req.leaveId}-mobile`
                            );
                            if (element) element.innerText = label;
                          }
                        )
                      )
                    }
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                    <span className="font-medium text-gray-500 text-xs col-span-1">
                      상태:
                    </span>
                    <span
                      className={`w-1/4 text-xs col-span-2 px-2 py-1 rounded font-semibold ${
                        req.status === "승인"
                          ? "bg-green-100 text-green-800"
                          : req.status === "거절"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {getStatusLabel(req.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 mb-1 items-center">
                    <span className="font-medium text-gray-500 text-xs col-span-1">
                      처리일:
                    </span>
                    <span className="text-xs text-gray-800 col-span-2">
                      {req.approvedDate
                        ? new Date(req.approvedDate).toLocaleDateString("ko-KR")
                        : "-"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 mb-2 items-center">
                    <span className="font-medium text-gray-500 text-xs col-span-1">
                      거절사유:
                    </span>
                    <span className="text-xs text-gray-800 col-span-2 break-all truncate">
                      {req.denialReason || "-"}
                    </span>
                  </div>
                  {req.status === "PENDING" && (
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        onClick={() => handleApprove(req)}
                        className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-700 transition"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => openRejectModal(req)}
                        className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-700 transition"
                      >
                        거절
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-300 rounded text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase">
                  <tr className="text-center h-12">
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">학번</th>
                    <th className="py-3 px-4">이름</th>
                    <th className="py-3 px-4">신청 사유</th>
                    <th className="py-3 px-4">상세 사유</th>
                    <th className="py-3 px-4">신청일</th>
                    <th className="py-3 px-4">복학 예정 학기</th>
                    <th className="py-3 px-4">처리 상태</th>
                    <th className="py-3 px-4">처리일</th>
                    <th className="py-3 px-4">거절 사유</th>
                    <th className="py-3 px-4">관리</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-center">
                  {paginatedLeaveRequests.map((req, idx) => (
                    <tr
                      key={req.leaveId}
                      className="border-t h-14 hover:bg-gray-50"
                    >
                      <td className="py-2 px-4">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="py-2 px-4">{req.student}</td>
                      <td className="py-2 px-4">
                        {
                          void requestAnimationFrame(() =>
                            handleStudentName(req.leaveId, "leave").then(
                              (n) => {
                                const element = document.getElementById(
                                  req.leaveId
                                );
                                if (element) element.innerText = n;
                              }
                            )
                          )
                        }
                        <span id={req.leaveId}>불러오는 중...</span>
                      </td>
                      <td className="py-2 px-4">
                        {getReasonLabel(req.reason)}
                      </td>
                      <td className="py-2 px-4 max-w-xs truncate">
                        {req.reasonDetail}
                      </td>
                      <td className="py-2 px-4">
                        {new Date(req.requestDate).toLocaleDateString("ko-KR")}
                      </td>
                      <td className="py-2 px-4">
                        {
                          void requestAnimationFrame(() =>
                            handlePrintSemester(req.expectedSemester).then(
                              (label) => {
                                const element = document.getElementById(
                                  `semester-${req.leaveId}`
                                );
                                if (element) element.innerText = label;
                              }
                            )
                          )
                        }
                        <span id={`semester-${req.leaveId}`}>
                          불러오는 중...
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-1 rounded text-sm font-semibold ${
                            req.status === "승인"
                              ? "bg-green-100 text-green-800"
                              : req.status === "거절"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`} 
                        >
                          {getStatusLabel(req.status)}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        {req.approvedDate
                          ? new Date(req.approvedDate).toLocaleDateString(
                              "ko-KR"
                            )
                          : "-"}
                      </td>
                      <td className="py-2 px-4 max-w-xs truncate">
                        {req.denialReason || "-"}
                      </td>
                      <td className="py-2 px-4">
                        {req.status === "PENDING" && (
                          <div className="flex space-x-1 justify-center">
                            <button
                              onClick={() => handleApprove(req)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => openRejectModal(req)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700 transition"
                            >
                              거절
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <PageComponent
          currentPage={currentPage}
          totalPage={Math.ceil(leaveRequests.length / itemsPerPage)}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      <BaseModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
      >
        <form onSubmit={handleReject} className="space-y-6 p-4 md:p-6">
          <h2 className="text-xl font-bold text-center">❌ 휴학 신청 거절</h2>
          <div>
            <div className="mb-4 text-sm">
              <p>
                <span className="font-semibold">학번:</span>{" "}
                {currentRequest?.student}
              </p>
              <p>
                <span className="font-semibold">이름:</span>{" "}
                {currentRequest?.studentName}
              </p>
            </div>
            <label className="block mb-1 font-medium text-sm">
              거절 사유 *
            </label>
            <textarea
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              className="w-full border rounded p-2.5 text-sm"
              rows={4}
              placeholder="거절 사유를 입력해주세요"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition text-sm font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium"
            >
              거절 확인
            </button>
          </div>
        </form>
      </BaseModal>

      <AlertModal
        isOpen={alertOpen}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
        type={alertType}
      />
    </div>
  );
};

export default AdminLeavePage;
