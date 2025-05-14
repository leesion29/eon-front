import axios from "axios";
import { getAuthHeader } from "../util/authHeader";

const API_SERVER_HOST = "http://localhost:8080";
const prefix = `${API_SERVER_HOST}/api/students/info`;

// 학적 상태 + 학년 정보 조회
export const fetchStudentStatus = () => {
  return axios.get(`${prefix}/status`, getAuthHeader());
};