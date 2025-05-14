import React, { useState, useEffect } from "react";
import AlertModal from "../../components/AlertModal";
import BaseModal from "../../components/BaseModal";
import axios from "axios";
import {
  findStudentName,
  responseReturn,
  seeReturnList,
} from "../../api/adminLeaveReturnApi";
import { getAllSemesters } from "../../api/adminScheduleApi";
import PageComponent from "../../components/PageComponent";

const AdminReturnPage = () => {
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [denialReason, setDenialReason] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedReturnRequests = returnRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchReturnRequests = async () => {
    try {
      setLoading(true);
      const data = await seeReturnList();
      setReturnRequests(data);
      setLoading(false);
    } catch (error) {
      console.error("복학 신청 목록을 불러오는 중 오류 발생:", error);
      showAlert("데이터를 불러오는 데 실패했습니다.", "error");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnRequests();
  }, []);

  const getStatusLabel = (status) => {
    const statusMap = {
      PENDING: "대기",
      APPROVED: "승인",
      DENIED: "거절",
    };
    return statusMap[status] || status;
  };

  const handleApprove = async (request) => {
    try {
      await responseReturn(request.returnId, {
        status: "APPROVED",
        denialReason: null,
      });
      showAlert("복학 신청이 승인되었습니다.", "success");
      fetchReturnRequests();
    } catch (error) {
      console.error("승인 처리 중 오류 발생:", error);
      showAlert("승인 처리 중 오류가 발생했습니다.", "error");
    }
  };

  const openRejectModal = (request) => {
    const nameElement = document.getElementById(request.returnId);
    const name = nameElement ? nameElement.innerText : "";
    setCurrentRequest({
      ...request,
      studentName: name,
    });
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
      await responseReturn(currentRequest?.returnId, {
        status: "DENIED",
        denialReason: denialReason || null,
      });
      setRejectModalOpen(false);
      showAlert("복학 신청이 거절되었습니다.", "success");
      fetchReturnRequests();
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

  const handleStudentName = async (leaveId, type) => {
    if (!leaveId || leaveId.length === 0) return "";
    const data = await findStudentName(leaveId, type);
    return data;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">로딩 중...</div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto p-12">
      <div className="bg-white shadow rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          🔍 복학 신청 관리
        </h2>

        <table className="min-w-full table-fixed border border-gray-300 rounded text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase">
            <tr className="text-center h-16">
              <th className="py-3 px-4">NO</th>
              <th className="py-3 px-4">학번</th>
              <th className="py-3 px-4">이름</th>
              <th className="py-3 px-4">신청일</th>
              <th className="py-3 px-4">복학 학기</th>
              <th className="py-3 px-4">처리 상태</th>
              <th className="py-3 px-4">처리일</th>
              <th className="py-3 px-4">거절 사유</th>
              <th className="py-3 px-4">관리</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {paginatedReturnRequests.length > 0 ? (
              paginatedReturnRequests.map((req, index) => (
                <tr key={req.returnId} className="border-t h-16">
                  <td className="py-3 px-4">
                    <div className="h-full flex items-center justify-center">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-full flex items-center justify-center">
                      {req.student}
                    </div>
                  </td>
                  <td>
                    {
                      void requestAnimationFrame(() =>
                        handleStudentName(req.returnId, "return").then((n) => {
                          const element = document.getElementById(req.returnId);
                          if (element) element.innerText = n;
                        })
                      )
                    }
                    <span
                      id={req.returnId}
                      className="h-full flex items-center justify-center"
                    >
                      불러오는 중...
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-full flex items-center justify-center">
                      {req.requestDate}
                    </div>
                  </td>
                  <td>
                    {
                      void requestAnimationFrame(() =>
                        handlePrintSemester(req.semester).then((label) => {
                          const element = document.getElementById(
                            `semester-${req.returnId}`
                          );
                          if (element) element.innerText = label;
                        })
                      )
                    }
                    <span
                      id={`semester-${req.returnId}`}
                      className="h-full flex items-center justify-center"
                    >
                      불러오는 중...
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-full flex items-center justify-center">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
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
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-full flex items-center justify-center">
                      {req.approvedDate || "-"}
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate">
                    <div className="h-full flex items-center justify-center">
                      {req.denialReason || "-"}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {req.status === "대기" && (
                      <div className="flex space-x-2 justify-center h-full items-center">
                        <button
                          onClick={() => handleApprove(req)}
                          className="h-full flex items-center justify-center px-3 py-0 text-xl"
                        >
                          ✔️
                        </button>
                        <button
                          onClick={() => openRejectModal(req)}
                          className="h-full flex items-center justify-center px-3 py-0 text-xl"
                        >
                          ❌
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t h-16">
                <td colSpan={9} className="py-4 text-gray-400 text-center">
                  처리할 복학 신청 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <PageComponent
          currentPage={currentPage}
          totalPage={Math.ceil(returnRequests.length / itemsPerPage)}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      <BaseModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
      >
        <form onSubmit={handleReject} className="space-y-6 p-4">
          <h2 className="text-xl font-bold">❌ 복학 신청 거절</h2>
          <div>
            <div className="mb-4">
              <p>
                <span className="font-semibold">학번:</span>{" "}
                {currentRequest?.student}
              </p>
              <p>
                <span className="font-semibold">이름:</span>{" "}
                {currentRequest?.studentName}
              </p>
            </div>
            <label className="block mb-2 font-medium">거절 사유</label>
            <textarea
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              className="w-full border rounded p-3"
              rows={4}
              placeholder="거절 사유를 입력해주세요"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
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

export default AdminReturnPage;
