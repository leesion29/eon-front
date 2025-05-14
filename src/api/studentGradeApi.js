import axios from "axios";
import { getAuthHeader } from "../util/authHeader";

const API_SERVER_HOST = "https://www.eonuniversity.co.kr";
const prefix = `${API_SERVER_HOST}/api/students`;

// 현재 학기 과목별 성적 조회
export const fetchStudentGrades = () => {
  return axios.get(`${prefix}/grade`, getAuthHeader());
};

// 현재 학기 총합 성적 조회
export const fetchStudentRecord = () => {
  return axios.get(`${prefix}/grade/record`, getAuthHeader());
};

// 선택한 학기 과목별 성적 조회
export const fetchStudentGradesBySemester = (semesterId) => {
  return axios.get(`${prefix}/grade/semester?semesterId=${semesterId}`, getAuthHeader());
};

// 전체 학기 총합 성적 조회 
export const fetchAllStudentRecords = () => {
  return axios.get(`${prefix}/grade/all-records`, getAuthHeader());
};

// 전체 누적 총합 성적 조회
export const fetchTotalRecord = () => {
  return axios.get(`${prefix}/grade/total-record`, getAuthHeader());
};