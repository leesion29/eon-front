import axios from "axios";
import { getAuthHeader } from "../util/authHeader";

const API_SERVER_HOST = "http://localhost:8080";
const prefix = `${API_SERVER_HOST}/api/admin/response`;

/* 학생 데이터 처리*/
export const findStudentName = async (id, type) => {
  const res = await axios.get(
    `${prefix}/find/username?type=${type}&id=${id}`,
    getAuthHeader()
  );
  return res.data;
};

/* 휴학 및 복학 신청 처리 */

// 휴학 처리
export const responseLeave = async (leaveId, data) => {
  return await axios.put(`${prefix}/leave/${leaveId}`, data, getAuthHeader());
};

// 복학 처리
export const responseReturn = async (returnId, data) => {
  const res = await axios.put(
    `${prefix}/return/${returnId}`,
    data,
    getAuthHeader()
  );
  return res.data;
};

/* 휴학 및 복학 내역 전체 조회 */

// 휴학 내역 전체 조회
export const seeLeaveList = async () => {
  const res = await axios.get(`${prefix}/leave/list`, getAuthHeader());
  return res.data;
};

// 복학 내역 전체 조회
export const seeReturnList = async () => {
  const res = await axios.get(`${prefix}/return/list`, getAuthHeader());
  return res.data;
};
