import axios from "axios";
import { getAuthHeader } from "../util/authHeader";

export const API_SERVER_HOST = "https://www.eonuniversity.co.kr";
const prefix = `${API_SERVER_HOST}/api/admin`;

// 사용자 생성
export const createUser = (userData) => {
  return axios.post(`${prefix}/users`, userData, getAuthHeader());
};

// 부서 목록 조회
export const getDepartments = () => {
  return axios.get(`${prefix}/departments`, getAuthHeader());
};

// 프로필 이미지 업로드
export const uploadProfileImage = (formData) => {
  return axios.post(`${prefix}/profile`, formData, getAuthHeader());
};

// 전체 사용자 목록 조회
export const getAllUsers = (
  page = 1,
  size = 10,
  keyword = "",
  sortField = "userId",
  sortDir = "asc"
) => {
  const safeSize = isNaN(Number(size)) || Number(size) <= 0 ? 10 : Number(size);
  return axios.get(`${prefix}/users`, {
    params: {
      page,
      size: safeSize,
      keyword,
      sortField,
      sortDir,
    },
    ...getAuthHeader(), // headers 병합
  });
};

// 사용자 삭제
export const deleteUser = (userId) =>
  axios.delete(`${prefix}/users/${userId}`, getAuthHeader());

// 사용자 수정
export const updateUser = (userData) => {
  return axios.put(`${prefix}/users`, userData, getAuthHeader());
};

// 비밀번호 초기화
export const resetPassword = (userId) => {
  return axios.put(
    `${prefix}/users/${userId}/reset-password`,
    null,
    getAuthHeader()
  );
};

export const multiUploadUsers = (formData) => {
  return axios.post(`${prefix}/users/multi-upload`, formData, getAuthHeader());
};
