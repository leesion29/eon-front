import axios from "axios";
import { getAuthHeader } from "../util/authHeader";

export const API_SERVER_HOST = "http://localhost:8080";
const prefix = `${API_SERVER_HOST}/api/admin/departments`;

// 전체 학과 목록 조회
export const getAllDepartments = () => {
  return axios.get(`${prefix}/all`, getAuthHeader());
};

// 학과 생성
export const createDepartment = (departmentName) => {
  return axios.post(
    `${prefix}`,
    { departmentName },
    getAuthHeader()
  );
};

// 학과 수정 (이름 및 상태)
export const updateDepartment = (departmentId, newName, newStatus) => {
  return axios.put(
    `${prefix}/${departmentId}`,
    { newName, newStatus },
    getAuthHeader()
  );
};

// 학과 삭제
export const deleteDepartment = (departmentId) => {
  return axios.delete(`${prefix}/${departmentId}`, getAuthHeader());
};
