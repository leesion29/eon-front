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

        const isExpectedSemesterAfterCurrent = expectedSemesterDetail && (
          expectedSemesterDetail.year > currentSemester.year ||
          (expectedSemesterDetail.year === currentSemester.year &&
            expectedSemesterDetail.term === "SECOND" &&
            currentSemester.term === "FIRST")
        );

        const isOnLeave =
          latestLeave &&
          latestLeave.status === "승인" &&
          isExpectedSemesterAfterCurrent;

        const statusPayload = {
          ...statusRes.data,
          status: isOnLeave ? "LEAVE" : "ENROLLED",
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
    return <div className="text-gray-400 text-sm">불러오는 중...</div>;
  }

  return (
    <div className="text-sm text-gray-600 flex flex-wrap items-center">
      <img
        src={`http://localhost:8080${userInfo.userImgUrl}`}
        alt="프로필 이미지"
        className="w-[45px] h-[45px] object-cover rounded-full mr-4 border border-gray-400"
      />

      <span>
        <span className="font-semibold">성명:</span>{" "}
        {processedUserInfo.userName} ({processedUserInfo.userId})
      </span>

      {(userRole === "STUDENT" || userRole === "PROFESSOR") && (
        <>
          <span className="mx-3 text-gray-400">|</span>
          <span>
            <span className="font-semibold">학과:</span>{" "}
            {processedUserInfo.departmentName || "N/A"}
          </span>
        </>
      )}

      {userRole === "STUDENT" && (
        <>
          <span className="mx-3 text-gray-400">|</span>
          <span>
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
        </>
      )}
    </div>
  );
};

export default UserInfo;
