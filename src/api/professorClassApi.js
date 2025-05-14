import axios from "axios";
import { getAuthHeader } from "../util/authHeader"; // ✅ 인증 헤더 유틸 임포트

export const API_SERVER_HOST = "http://localhost:8080";
const prefix = `${API_SERVER_HOST}/api/professor`;

// 교수의 강의 목록 조회
export const getMyClasses = (page = 1, size = 10, sortField = "id", sortDir = "asc", semesterId = null) => {
  const params = { page, size, sortField, sortDir };
  if (semesterId !== null && semesterId !== undefined) {
    params.semesterId = semesterId;
  }
  return axios.get(`${prefix}/classes`, {
    params,
    ...getAuthHeader(), // 여기에 Authorization: Bearer 토큰 포함됨
  });
};


// 강의 등록
export const createClass = (classData) => {
  return axios.post(`${prefix}/classes`, classData, getAuthHeader());
};

// 강의 수정
export const updateClass = (classData) => {
  return axios.put(`${prefix}/classes`, classData, getAuthHeader());
};

// 강의 삭제
export const deleteClass = (classId) => {
  return axios.delete(`${prefix}/classes/${classId}`, getAuthHeader());
};

// 과목 목록 조회
export const getCourses = () => {
  return axios.get(`${prefix}/courses`, getAuthHeader());
};

// 현재 날짜 기준으로 빈 강의실 조회 (semesterId 제거)
export const getLectureRooms = ({ day, startTime, endTime }) => {
  return axios.get(`${prefix}/lecture-rooms`, {
    params: { day, startTime, endTime },
    ...getAuthHeader(),
  });
};

// 강의 등록 가능 여부 확인
export const isClassScheduleOpen = () => {
  return axios.get(`${prefix}/is-class-open`, getAuthHeader());
};