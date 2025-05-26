import React, { useEffect, useState } from "react";
import BaseModal from "../components/BaseModal";
import AlertModal from "../components/AlertModal";
import { getAllSemesters } from "../api/adminScheduleApi";
import {
  requestLeave,
  requestReturn,
  seeMyLeaveRequest,
  seeMyReturnRequest,
} from "../api/studentLeaveReturnApi";
import { useSelector } from "react-redux";

const LeavePage = () => {
  const userId = useSelector((state) => state.auth?.userId);
  const [message, setMessage] = useState("");
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const [leaveType, setLeaveType] = useState("MILITARY");
  const [leaveDetail, setLeaveDetail] = useState("");
  const [expectedSemesterId, setExpectedSemesterId] = useState("");
  const [returnSemesterId, setReturnSemesterId] = useState("");

  const [allSemester, setAllSemester] = useState(null);
  const [returnSemester, setReturnSemester] = useState(null);
  const [leaveList, setLeaveList] = useState(null);
  const [returnList, setReturnList] = useState(null);

  const fetchSemesterInfo = async () => {
    const res = await getAllSemesters();
    const currentDate = new Date();
    const filteredReturnSemester = res.data.filter((s) => {
      const start = new Date(s.startDate);
      const end = new Date(s.endDate);
      const isCurrentSemester = currentDate >= start && currentDate <= end;
      return !isCurrentSemester && start > currentDate;
    });
    setAllSemester(res.data);
    setReturnSemester(filteredReturnSemester);
  };

  useEffect(() => {
    try {
      const fetchLeaveList = async () => {
        const data = await seeMyLeaveRequest(userId);
        setLeaveList(data);
      };
      const fetchReturnList = async () => {
        const data = await seeMyReturnRequest(userId);
        setReturnList(data);
      };
      fetchSemesterInfo();
      fetchLeaveList();
      fetchReturnList();
    } catch (error) {}
  }, [userId]);

  const leaveReasons = [
    { value: "MILITARY", label: "군대" },
    { value: "FAMILY", label: "가정사" },
    { value: "ILLNESS", label: "질병" },
    { value: "PERSONAL", label: "개인사정" },
    { value: "STUDY_ABROAD", label: "유학" },
    { value: "OTHER", label: "기타" },
  ];

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    const record = {
      leaveId: null,
      student: userId,
      reason: leaveType,
      reasonDetail: leaveDetail,
      requestDate: new Date().toISOString().split("T")[0],
      expectedSemester: expectedSemesterId,
      status: "PENDING",
      approvedDate: null,
      denialReason: null,
    };
    try {
      await requestLeave(userId, record);
      setLeaveModalOpen(false);
      window.location.reload();
    } catch (error) {
      setMessage(
        "⚠️ 네트워크 상태가 좋지 않거나 혹은 이미 해당 학기의 신청이 존재합니다."
      );
      setLeaveModalOpen(true);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!Array.isArray(leaveList) || leaveList.length === 0) {
      setAlertOpen(true);
      return;
    } else if (leaveList[0]?.status !== "승인") {
      setAlertOpen(true);
      return;
    }

    const record = {
      requestDate: new Date().toISOString().split("T")[0],
      semester: returnSemesterId,
      status: "대기",
      approvedDate: null,
      denialReason: null,
    };
    try {
      await requestReturn(userId, record);
      setReturnModalOpen(false);
      window.location.reload();
    } catch (error) {
      setMessage(
        "⚠️ 네트워크 상태가 좋지 않거나 혹은 이미 해당 학기의 신청이 존재합니다."
      );
      setReturnModalOpen(true);
    }
  };

  const handlePrintSemester = (semesterId) => {
    if (!allSemester) return "";
    const currentSemester = allSemester.filter(
      (s) => s.semesterId === semesterId
    );
    if (!currentSemester || currentSemester.length === 0) return "";
    return (
      currentSemester[0].year +
      "년도 " +
      (currentSemester[0].term === "FIRST" ? 1 : 2) +
      "학기"
    );
  };
  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-3 md:p-6 lg:p-8 space-y-5 sm:space-y-6 md:space-y-8">
      <div className="bg-white shadow rounded-md sm:rounded-lg p-2.5 sm:p-4 md:p-6">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 mb-2 sm:mb-3 md:mb-4">
          📄 휴학 신청 내역
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full w-full text-[9px] sm:text-[10px] md:text-sm text-center border border-gray-200 table-auto">
            <colgroup>
              <col className="w-[10%] sm:w-[8%] md:w-[5%]" />
              <col className="w-[15%] sm:w-[12%] md:w-[10%]" />
              <col className="w-auto min-w-[80px] sm:min-w-[100px] md:min-w-[150px]" />
              <col className="w-[20%] sm:w-[18%] md:w-[12%]" />
              <col className="w-[20%] sm:w-[18%] md:w-[15%]" />
              <col className="w-[15%] sm:w-[12%] md:w-[10%]" />
              <col className="hidden md:table-cell md:w-[12%]" />
              <col className="hidden md:table-cell md:min-w-[150px] md:w-auto" />
            </colgroup>
            <thead className="bg-gray-50 text-gray-500 text-[8px] sm:text-[9px] md:text-xs uppercase">
              <tr>
                <th className="py-1 px-0.5 sm:py-1.5 sm:px-1 md:py-3 md:px-6">
                  NO.
                </th>
                <th className="py-1 px-0.5 sm:py-1.5 sm:px-1 md:py-3 md:px-6">
                  사유
                </th>
                <th className="py-1 px-0.5 sm:py-1.5 sm:px-1 md:py-3 md:px-6">
                  상세사유
                </th>
                <th className="py-1 px-0.5 sm:py-1.5 sm:px-1 md:py-3 md:px-6 whitespace-nowrap">
                  접수일
                </th>
                <th className="py-1 px-0.5 sm:py-1.5 sm:px-1 md:py-3 md:px-6 whitespace-nowrap">
                  예정학기
                </th>
                <th className="py-1 px-0.5 sm:py-1.5 sm:px-1 md:py-3 md:px-6">
                  상태
                </th>
                <th className="hidden md:table-cell py-1.5 px-1 md:py-3 md:px-6 whitespace-nowrap">
                  처리일
                </th>
                <th className="hidden md:table-cell py-1.5 px-1 md:py-3 md:px-6">
                  미승인사유
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {leaveList && leaveList.length > 0 ? (
                leaveList.map((l, i) => (
                  <tr className="border-t hover:bg-gray-50" key={i}>
                    <td className="py-1.5 px-0.5 sm:py-2 sm:px-1 md:py-3 md:px-6 align-middle">
                      {i + 1}
                    </td>
                    <td className="py-1.5 px-0.5 sm:py-2 sm:px-1 md:py-3 md:px-6 align-middle whitespace-nowrap">
                      {l.reason}
                    </td>
                    <td className="py-1.5 px-0.5 sm:py-2 sm:px-1 md:py-3 md:px-6 align-middle text-center break-words">
                      {l.reasonDetail}
                    </td>
                    <td className="py-1.5 px-0.5 sm:py-2 sm:px-1 md:py-3 md:px-6 align-middle whitespace-nowrap">
                      {l.requestDate}
                    </td>
                    <td className="py-1.5 px-0.5 sm:py-2 sm:px-1 md:py-3 md:px-6 align-middle whitespace-nowrap">
                      {handlePrintSemester(l.expectedSemester) || ""}
                    </td>
                    <td className="py-1.5 px-0.5 sm:py-2 sm:px-1 md:py-3 md:px-6 align-middle whitespace-nowrap">
                      {l.status}
                    </td>
                    <td className="hidden md:table-cell py-2 px-1 md:py-3 md:px-6 align-middle whitespace-nowrap">
                      {l.approvedDate || "-"}
                    </td>
                    <td className="hidden md:table-cell py-2 px-1 md:py-3 md:px-6 align-middle text-center break-words">
                      {l.denialReason || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t">
                  <td
                    colSpan={8}
                    className="py-2.5 sm:py-3 md:py-4 text-gray-400 text-[8px] sm:text-[9px] md:text-xs"
                  >
                    휴학 신청 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-end mt-2 sm:mt-3 md:mt-6">
            <button
              onClick={() => {
                setMessage("");
                setLeaveModalOpen(true);
              }}
              className="px-3 py-1.5 text-[9px] sm:text-xs sm:px-4 sm:py-2 md:text-sm md:px-8 md:py-4 lg:text-lg bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition-colors"
            >
              ☑️ 휴학 신청
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-md sm:rounded-lg p-2.5 sm:p-4 md:p-6">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 mb-2 sm:mb-3 md:mb-4">
          📄 복학 신청 내역
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full w-full text-[9px] sm:text-[10px] md:text-sm text-center border border-gray-200 table-auto">
            <colgroup>
              <col className="w-[8%] sm:w-[7%] md:w-[5%]" />
              <col className="w-[25%] sm:w-[22%] md:w-[15%]" />
              <col className="w-[27%] sm:w-[25%] md:w-[20%]" />
              <col className="w-[20%] sm:w-[18%] md:w-[15%]" />
              <col className="hidden md:table-cell md:w-[15%]" />
              <col className="w-auto min-w-[70px] sm:min-w-[80px] md:min-w-[150px]" />
            </colgroup>
            <thead className="bg-gray-50 text-gray-500 text-[8px] sm:text-[9px] md:text-xs uppercase">
              <tr>
                <th className="py-1.5 px-0.5 sm:py-2 sm:px-1 md:py-3 md:px-6">
                  NO.
                </th>
                <th className="py-1.5 px-0.5 sm:py-2 sm:px-1 md:py-3 md:px-6 whitespace-nowrap">
                  접수일
                </th>
                <th className="py-1.5 px-0.5 sm:py-2 sm:px-1 md:py-3 md:px-6 whitespace-nowrap">
                  복학학기
                </th>
                <th className="py-1.5 px-0.5 sm:py-2 sm:px-1 md:py-3 md:px-6">
                  상태
                </th>
                <th className="hidden md:table-cell py-1.5 px-1 md:py-3 md:px-6 whitespace-nowrap">
                  처리일
                </th>
                <th className="py-1.5 px-0.5 sm:py-2 sm:px-1 md:py-3 md:px-6">
                  거절사유
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {returnList && returnList.length > 0 ? (
                returnList.map((r, i) => (
                  <tr className="border-t hover:bg-gray-50" key={i}>
                    <td className="py-1.5 px-0.5 sm:py-2 sm:px-1 md:py-3 md:px-6 align-middle">
                      {i + 1}
                    </td>
                    <td className="py-1.5 px-0.5 sm:py-2 sm:px-1 md:py-3 md:px-6 align-middle whitespace-nowrap">
                      {r.requestDate}
                    </td>
                    <td className="py-1.5 px-0.5 sm:py-2 sm:px-1 md:py-3 md:px-6 align-middle whitespace-nowrap">
                      {handlePrintSemester(r.semester) || ""}
                    </td>
                    <td className="py-1.5 px-0.5 sm:py-2 sm:px-1 md:py-3 md:px-6 align-middle whitespace-nowrap">
                      {r.status}
                    </td>
                    <td className="hidden md:table-cell py-2 px-1 md:py-3 md:px-6 align-middle whitespace-nowrap">
                      {r.approvedDate || "-"}
                    </td>
                    <td className="py-1.5 px-0.5 sm:py-2 sm:px-1 md:py-3 md:px-6 align-middle text-center break-words">
                      {r.denialReason || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t">
                  <td
                    colSpan={8}
                    className="py-2.5 sm:py-3 md:py-4 text-gray-400 text-[8px] sm:text-[9px] md:text-xs"
                  >
                    복학 신청 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-end mt-2 sm:mt-3 md:mt-6">
            <button
              onClick={() => {
                setMessage("");
                try {
                  const firstStatus = leaveList?.[0]?.status;
                  if (firstStatus !== "승인") {
                    setAlertOpen(true);
                    return;
                  }
                  setReturnModalOpen(true);
                } catch (err) {
                  console.error("복학 신청 오류:", err);
                  setAlertOpen(true);
                }
              }}
              className="px-3 py-1.5 text-[9px] sm:text-xs sm:px-4 sm:py-2 md:text-sm md:px-8 md:py-4 lg:text-lg bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700 transition-colors"
            >
              ✅ 복학 신청
            </button>
          </div>
        </div>
      </div>

      <BaseModal
        isOpen={leaveModalOpen}
        onClose={() => {
          setLeaveModalOpen(false);
          setMessage("");
        }}
      >
        <form
          onSubmit={handleLeaveSubmit}
          className="space-y-3 sm:space-y-4 md:space-y-6 p-2 sm:p-3 text-[9px] sm:text-[10px] md:text-sm"
        >
          <h2 className="text-sm sm:text-base md:text-lg font-bold">
            ✈️ 휴학 신청
          </h2>
          <div className="text-[8px] sm:text-[9px] md:text-xs font-bold text-red-500 mt-1 sm:mt-1.5 md:mt-2 text-left mb-0.5 sm:mb-1">
            * 휴학이 승인되면 수강중인 모든 과목은 자동 취소되며, 성적이
            부여되지 않습니다.
          </div>
          <div>
            <label className="block mb-0.5 sm:mb-1 font-medium text-[8px] sm:text-[9px] md:text-xs">
              휴학 사유
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full border rounded p-1 sm:p-1.5 md:p-2 text-[8px] sm:text-[9px] md:text-xs"
              required
            >
              {leaveReasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-0.5 sm:mb-1 font-medium text-[8px] sm:text-[9px] md:text-xs">
              상세 사유
            </label>
            <textarea
              value={leaveDetail}
              onChange={(e) => setLeaveDetail(e.target.value)}
              className="w-full border rounded p-1 sm:p-1.5 md:p-2 text-[8px] sm:text-[9px] md:text-xs"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block mb-0.5 sm:mb-1 font-medium text-[8px] sm:text-[9px] md:text-xs">
              복학 예정 학기
            </label>
            <select
              value={expectedSemesterId}
              onChange={(e) => setExpectedSemesterId(e.target.value)}
              className="border p-1 sm:p-1.5 md:p-2 rounded w-full text-[8px] sm:text-[9px] md:text-xs"
              required
            >
              <option value="">예정 복학 학기 선택</option>
              {returnSemester &&
                returnSemester.map((s) => (
                  <option key={s.semesterId} value={s.semesterId}>
                    {s.year}년도 {s.term === "FIRST" ? 1 : 2}학기
                  </option>
                ))}
            </select>
            {message && (
              <p className="text-red-500 pt-1 sm:pt-1.5 md:pt-2 text-[8px] sm:text-[9px]">
                {message}
              </p>
            )}
          </div>
          <div className="text-right pt-1 sm:pt-2">
            <button
              type="submit"
              className="px-3 py-1.5 text-[9px] sm:px-4 sm:py-2 sm:text-xs md:px-6 md:py-3 bg-blue-600 text-white rounded hover:bg-blue-700 md:text-sm transition-colors"
            >
              ☑️ 신청하기
            </button>
          </div>
        </form>
      </BaseModal>

      <BaseModal
        isOpen={returnModalOpen}
        onClose={() => {
          setReturnModalOpen(false);
          setMessage("");
        }}
      >
        <form
          onSubmit={handleReturnSubmit}
          className="space-y-3 sm:space-y-4 md:space-y-6 p-2 sm:p-3 text-[9px] sm:text-[10px] md:text-sm"
        >
          <h2 className="text-sm sm:text-base md:text-lg font-bold">
            ✅ 복학 신청
          </h2>
          <div>
            <label className="block mb-0.5 sm:mb-1 font-medium text-[8px] sm:text-[9px] md:text-xs">
              복학할 학기
            </label>
            <select
              value={returnSemesterId}
              onChange={(e) => setReturnSemesterId(e.target.value)}
              className="w-full border rounded p-1 sm:p-1.5 md:p-2 text-[8px] sm:text-[9px] md:text-xs"
              required
            >
              <option value="">복학할 학기 선택</option>
              {returnSemester &&
                returnSemester.map((s) => (
                  <option key={s.semesterId} value={s.semesterId}>
                    {s.year}년도 {s.term === "FIRST" ? 1 : 2}학기
                  </option>
                ))}
            </select>
            {message && (
              <p className="text-red-500 pt-1 sm:pt-1.5 md:pt-2 text-[8px] sm:text-[9px]">
                {message}
              </p>
            )}
          </div>
          <div className="text-right pt-1 sm:pt-2">
            <button
              type="submit"
              className="px-3 py-1.5 text-[9px] sm:px-4 sm:py-2 sm:text-xs md:px-6 md:py-3 bg-green-600 text-white rounded hover:bg-green-700 md:text-sm transition-colors"
            >
              신청하기
            </button>
          </div>
        </form>
      </BaseModal>

      <AlertModal
        isOpen={alertOpen}
        message="휴학생만 복학 신청이 가능합니다."
        onClose={() => setAlertOpen(false)}
        type="error"
      />
    </div>
  );
};

export default LeavePage;
