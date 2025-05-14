import axios from "axios";
import { getAuthHeader } from "../util/authHeader";

export const API_SERVER_HOST = "https://www.eonuniversity.co.kr";
const prefix = `${API_SERVER_HOST}/api/students/enrollment`;

// 필터 정보 불러오기
export const getFilters = () => {
  return Promise.all([
    axios.get(`${prefix}/courseTypes`, getAuthHeader()),
    axios.get(`${prefix}/classDays`, getAuthHeader()),
    axios.get(`${prefix}/classTimes`, getAuthHeader()),
    axios.get(`${prefix}/credits`, getAuthHeader()),
  ]);
};

// 수강 신청 가능한 강의 목록 (검색)
export const searchCourses = (userId, params) => {
  return axios.get(`${prefix}/${userId}/enrollment`, {
    params,
    ...getAuthHeader(), // headers 포함
  });
};

// 수강 신청 (담기)
export const enrollCourse = (userId, data) => {
  return axios.post(`${prefix}/${userId}/enrollment`, data, getAuthHeader());
};

// 수강 신청 내역 조회
export const getEnrolledCourses = (userId) => {
  return axios.get(`${prefix}/${userId}/history`, getAuthHeader());
};

// 수강 신청 내역에서 강의 삭제
export const deleteCourse = (userId, classId) => {
  return axios.delete(`${prefix}/${userId}/course/${classId}`, getAuthHeader());
};

// 수강신청 기간 확인
export const checkEnrollPeriod = async () => {
  try {
    const response = await axios.get(`${prefix}/is-enroll-open`, getAuthHeader());
    return response.data;  // true 또는 false
  } catch (error) {
    console.error("수강신청 기간 확인 실패:", error);
    return false;
  }
};

// 수강신청용 학기 정보 조회
export const getEnrollmentSemesterInfo = async () => {
  try {
    const response = await axios.get(`${prefix}/enrollment-semester-info`, getAuthHeader());
    return response.data;  // { year: xxxx, term: "FIRST" 또는 "SECOND" }
  } catch (error) {
    console.error("수강신청 학기 정보 조회 실패:", error);
    return null;
  }
};