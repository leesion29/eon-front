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

  const fetchSemeaterInfo = async () => {
    const res = await getAllSemesters();
    const currentDate = new Date();
    console.log("현재 날짜" + currentDate);

    // 복학 가능 학기 필터링
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
        console.log(data);
      };
      fetchSemeaterInfo();
      fetchLeaveList();
      fetchReturnList();
    } catch (error) {
      console.log("fetchError : ", error);
    }
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
    <div className="max-w-8xl mx-auto p-12 space-y-12">
      {/* 휴학 박스 */}
      <div className="bg-white shadow rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          📄 휴학 신청 내역
        </h2>
        <table className="w-full text-base text-center border border-gray-200">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="py-3 px-6">NO.</th>
              <th className="py-3 px-6">사유</th>
              <th className="py-3 px-6">상세 사유</th>
              <th className="py-3 px-6">접수 날짜</th>
              <th className="py-3 px-6">예정 학기</th>
              <th className="py-3 px-6">처리 상태</th>
              <th className="py-3 px-6">처리 날짜</th>
              <th className="py-3 px-6">미승인 사유</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {leaveList && leaveList.length > 0 ? (
              leaveList.map((l, i) => (
                <tr className="border-t" key={i}>
                  <td className="py-3 px-6">{i + 1}</td>
                  <td className="py-3 px-6">{l.reason}</td>
                  <td className="py-3 px-6">{l.reasonDetail}</td>
                  <td className="py-3 px-6">{l.requestDate}</td>
                  <td className="py-3 px-6">
                    {handlePrintSemester(l.expectedSemester) || ""}
                  </td>
                  <td className="py-3 px-6">{l.status}</td>
                  <td className="py-3 px-6">{l.approvedDate || "-"}</td>
                  <td className="py-3 px-6">{l.denialReason || "-"}</td>
                </tr>
              ))
            ) : (
              <tr className="border-t">
                <td colSpan={8} className="py-4 text-gray-400">
                  휴학 신청 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setLeaveModalOpen(true)}
            className="px-8 py-4 text-lg bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700"
          >
            ☑️ 휴학 신청
          </button>
        </div>
      </div>

      {/* 복학 박스 */}
      <div className="bg-white shadow rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          📄 복학 신청 내역
        </h2>
        <table className="w-full text-base text-center border border-gray-200">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="py-3 px-6">NO.</th>
              <th className="py-3 px-6">접수 날짜</th>
              <th className="py-3 px-6">복학 학기</th>
              <th className="py-3 px-6">처리 상태</th>
              <th className="py-3 px-6">처리 날짜</th>
              <th className="py-3 px-6">거절 사유</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {returnList && returnList.length > 0 ? (
              returnList.map((r, i) => (
                <tr className="border-t" key={i}>
                  <td className="py-3 px-6">{i + 1}</td>
                  <td className="py-3 px-6">{r.requestDate}</td>
                  <td className="py-3 px-6">
                    {handlePrintSemester(r.semester) || ""}
                  </td>
                  <td className="py-3 px-6">{r.status}</td>
                  <td className="py-3 px-6">{r.approvedDate || "-"}</td>
                  <td className="py-3 px-6">{r.denialReason || "-"}</td>
                </tr>
              ))
            ) : (
              <tr className="border-t">
                <td colSpan={7} className="py-4 text-gray-400">
                  복학 신청 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-end mt-6">
          <button
            onClick={() => {
              try {
                const firstStatus = leaveList?.[0]?.status;

                if (firstStatus !== "승인") {
                  setAlertOpen(true);
                  return;
                }

                setReturnModalOpen(true);
              } catch (err) {
                console.error("복학 신청 오류:", err);
                setAlertOpen(true); // 혹시나 예외 있어도 막아줌
              }
            }}
            className="px-8 py-4 text-lg bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700"
          >
            ✅ 복학 신청
          </button>
        </div>
      </div>

      <BaseModal
        isOpen={leaveModalOpen}
        onClose={() => {
          setLeaveModalOpen(false);
          setMessage(false);
        }}
      >
        <form onSubmit={handleLeaveSubmit} className="space-y-7 p-3 text-base">
          <h2 className="text-xl font-bold">✈️ 휴학 신청</h2>
          <div className="text-base font-bold text-red-500 mt-4 text-left mb-1">
            * 휴학이 승인되면 수강중인 모든 과목은 자동 취소되며, 성적이
            부여되지 않습니다.
          </div>
          <div>
            <label className="block mb-2 font-medium">휴학 사유</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full border rounded p-3"
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
            <label className="block mb-2 font-medium">상세 사유</label>
            <textarea
              value={leaveDetail}
              onChange={(e) => setLeaveDetail(e.target.value)}
              className="w-full border rounded p-3"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">복학 예정 학기</label>
            <select
              value={expectedSemesterId}
              onChange={(e) => setExpectedSemesterId(e.target.value)}
              className="border p-3 rounded w-full text-base"
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
            {message && <p className="text-red-500 pt-3">{message}</p>}
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-base"
            >
              ☑️ 신청하기
            </button>
          </div>
        </form>
      </BaseModal>

      <BaseModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
      >
        <form onSubmit={handleReturnSubmit} className="space-y-6 p-4">
          <h2 className="text-xl font-bold">✅ 복학 신청</h2>
          <div>
            <label className="block mb-2 font-medium">복학할 학기</label>
            <select
              value={returnSemesterId}
              onChange={(e) => setReturnSemesterId(e.target.value)}
              className="w-full border rounded p-3"
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
            {message && <p className="text-red-500 pt-3">{message}</p>}
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 text-base"
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
