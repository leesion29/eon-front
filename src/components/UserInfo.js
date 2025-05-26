import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { fetchUserInfo } from "../api/memberApi";
import { fetchStudentStatus } from "../api/studentApi";
import {
  seeMyLeaveRequest,
  seeMyReturnRequest,
} from "../api/studentLeaveReturnApi";
import { getCurrentSemester } from "../api/adminGradeApi";
import { getAllSemesters } from "../api/adminScheduleApi";

const UserInfo = () => {
  const { userId, userRole } = useSelector((state) => state.auth);
  const [userInfo, setUserInfo] = useState(null);
  const [statusInfo, setStatusInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const idToUse = userId || localStorage.getItem("id");
    if (!idToUse || idToUse === "null" || idToUse === "undefined") return;
    getUserInfo(idToUse);
  }, [userId]);

  useEffect(() => {
    if (statusInfo?.status) {
      sessionStorage.setItem("studentStatus", statusInfo.status);
    }
  }, [statusInfo]);
  
  const getUserInfo = async (id) => {
    try {
      const response = await fetchUserInfo(id);
      setUserInfo(response.data);

      if (userRole === "STUDENT") {
        const statusRes = await fetchStudentStatus(id);
        const leaveData = await seeMyLeaveRequest(id);
        const returnData = await seeMyReturnRequest(id);
        const currentSemesterRes = await getCurrentSemester();
        const allSemestersRes = await getAllSemesters();

        const currentSemester = currentSemesterRes.data;
        const allSemesters = allSemestersRes.data;

        const latestLeave = leaveData
          .filter((l) => l.status === "승인")
          .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))[0];

        const latestReturn = returnData
          .filter((r) => r.status === "승인")
          .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))[0];

        const expectedSemesterDetail = latestLeave
          ? allSemesters.find((s) => s.semesterId === latestLeave.expectedSemester)
          : null;

        const isExpectedSemesterStillFuture = expectedSemesterDetail && (
          expectedSemesterDetail.year > currentSemester.year ||
          (expectedSemesterDetail.year === currentSemester.year &&
            expectedSemesterDetail.term === "SECOND" &&
            currentSemester.term === "FIRST")
        );

        let finalAcademicStatus = statusRes.data.status || "ENROLLED"; // 기본값은 백엔드에서 받은 값 또는 재학

        if (latestLeave && latestLeave.status === "승인") {
          if (isExpectedSemesterStillFuture) {
            // 아직 휴학 기간 중이어야 함
            let hasReturnedEffectively = false;
            if (latestReturn && latestReturn.status === "승인") {
              const returnSemesterInfo = allSemesters.find(s => s.semesterId === latestReturn.semester);
              if (returnSemesterInfo && (
                returnSemesterInfo.year < currentSemester.year ||
                (returnSemesterInfo.year === currentSemester.year && (
                    returnSemesterInfo.term === currentSemester.term ||
                    (currentSemester.term === "SECOND" && returnSemesterInfo.term === "FIRST")
                ))
              )) {
                hasReturnedEffectively = true;
              }
            }
            if (!hasReturnedEffectively) {
              finalAcademicStatus = "LEAVE";
            } else {
              // 휴학 기간 중이지만, 유효한 복학 기록이 있으면 백엔드 상태 그대로
              finalAcademicStatus = statusRes.data.status || "ENROLLED";
            }
          } else {
            // 휴학으로 인한 예상 복학 시기가 도래했거나 지난 경우
            let hasReturnedEffectively = false;
            if (latestReturn && latestReturn.status === "승인") {
              const returnSemesterInfo = allSemesters.find(s => s.semesterId === latestReturn.semester);
              if (returnSemesterInfo && (
                returnSemesterInfo.year < currentSemester.year ||
                (returnSemesterInfo.year === currentSemester.year && (
                    returnSemesterInfo.term === currentSemester.term ||
                    (currentSemester.term === "SECOND" && returnSemesterInfo.term === "FIRST")
                ))
              )) {
                hasReturnedEffectively = true;
              }
            }

            if (hasReturnedEffectively) {
              finalAcademicStatus = "ENROLLED";
            } else {
              finalAcademicStatus = "LEAVE"; // 복학 신청/승인 없이는 휴학 상태 유지
            }
          }
        } else {
          // 승인된 휴학 기록이 없는 경우, 백엔드에서 제공하는 현재 학적 상태를 사용
          finalAcademicStatus = statusRes.data.status || "ENROLLED";
        }

        const statusPayload = {
          ...statusRes.data,
          status: finalAcademicStatus,
        };

        setStatusInfo(statusPayload);
      }
    } catch (error) {
      console.error("Error fetching user info or status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processedUserInfo = useMemo(() => {
    if (!userInfo) return null;
    return {
      userId: userInfo.userId,
      userName: userInfo.userName,
      departmentName: userInfo.departmentName,
    };
  }, [userInfo]);

  if (isLoading || !processedUserInfo) {
    return <div className="text-gray-400 text-xs sm:text-sm">불러오는 중...</div>;
  }

  return (
    <div className="text-xs sm:text-sm text-gray-600 flex flex-wrap items-center">
      <img
        src={`https://www.eonuniversity.co.kr${userInfo.userImgUrl}`}
        alt="프로필 이미지"
        className="w-[45px] h-[45px] object-cover rounded-full mr-3 sm:mr-4 border border-gray-400"
      />

      <span>
        <span className="font-semibold">성명:</span>{" "}
        {processedUserInfo.userName} ({processedUserInfo.userId})
      </span>

      {(userRole === "STUDENT" || userRole === "PROFESSOR") && (
        <span className="hidden sm:inline">
          <span className="mx-2 sm:mx-3 text-gray-400">|</span>
          <span>
            <span className="font-semibold">학과:</span>{" "}
            {processedUserInfo.departmentName || "N/A"}
          </span>
        </span>
      )}

      {userRole === "STUDENT" && (
        <span>
          <span className="mx-2 sm:mx-3 text-gray-400 hidden sm:inline">|</span>
          <span className="hidden sm:inline">
            <span className="font-semibold">학적상태:</span>{" "}
            {isLoading
              ? "불러오는 중..."
              : statusInfo?.graduationEligible
              ? "졸업"
              : statusInfo?.status === "LEAVE"
              ? "휴학"
              : statusInfo?.studentYear
              ? `재학 (${statusInfo.studentYear}학년)`
              : "정보 없음"}
          </span>
        </span>
      )}
    </div>
  );
};

export default UserInfo;