import axios from "axios";
import { getAuthHeader } from "../util/authHeader"; 

export const API_SERVER_HOST = "http://localhost:8080";
const prefix = `${API_SERVER_HOST}/api/professor/grades`;

// 강의별 성적 조회
export const getGradesByClass = (classId, page = 1, size = 10) => {
  return axios.get(`${prefix}/class/${classId}`, {
    params: { page, size },
    ...getAuthHeader(),
  });
};

// 성적 등록
export const registerGrade = (gradeData) => {
  return axios.post(`${prefix}`, gradeData, getAuthHeader());
};

// 성적 수정
export const updateGrade = (gradeData) => {
  return axios.put(`${prefix}`, gradeData, getAuthHeader());
};

// 성적 삭제
export const deleteGrade = (gradeId) => {
  return axios.delete(`${prefix}/${gradeId}`, getAuthHeader());
};

export const isGradeScheduleOpen = () => {
  return axios.get(`${prefix}/is-grade-open`, getAuthHeader());
};