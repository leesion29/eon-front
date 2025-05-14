import axios from "axios";
import { getAuthHeader } from "../util/authHeader";

export const API_SERVER_HOST = "http://localhost:8080";
const prefix = `${API_SERVER_HOST}/api/admin/courses`;

// 학과 필터로 과목 목록 조회 (공통 포함)
export const getCoursesByFilter = (departmentId) => {
  return axios.get(`${prefix}`, {
    params: { departmentId },
    ...getAuthHeader(),
  });
};

// 과목 생성
export const createCourse = (courseData) => {
  return axios.post(`${prefix}`, courseData, getAuthHeader());
};

// 과목 수정
export const updateCourse = (courseId, courseUpdateData) => {
  return axios.put(`${prefix}/${courseId}`, courseUpdateData, getAuthHeader());
};

// 과목 삭제
export const deleteCourse = (courseId) => {
  return axios.delete(`${prefix}/${courseId}`, getAuthHeader());
};
