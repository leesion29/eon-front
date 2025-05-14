import axios from "axios";
import { getAuthHeader } from "../util/authHeader";

const API_SERVER_HOST = "http://localhost:8080";
const prefix = `${API_SERVER_HOST}/api`;

// Q&A 게시글 작성
export const writeQna = async (userId, data) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
  };

  const res = await axios.post(
    `${prefix}/user/qna/write?userId=${userId}`,
    data,
    headers
  );

  return res.data;
};

// Q&A 답변 등록
export const writeAns = async (data) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
  };

  const res = await axios.post(`${prefix}/admin/ans/write`, data, headers);

  return res.data;
};

// Q&A 답변 삭제
export const deleteAns = async (qno) => {
  return axios.delete(`${prefix}/admin/ans/delete/${qno}`, getAuthHeader());
};

// Q&A 전체 목록 가져오기
export const getQnaList = async () => {
  const res = await axios.get(`${prefix}/user/qna/list`, getAuthHeader());
  return res.data;
};

// Q&A 작성자 확인
export const getWriterId = async (questionId) => {
  const res = await axios.get(
    `${prefix}/user/qna/find/${questionId}`,
    getAuthHeader()
  );
  return res.data;
};

// Q&A 게시글 상세조회
export const getQnaDetail = async (questionId) => {
  const res = await axios.get(
    `${prefix}/user/qna/${questionId}`,
    getAuthHeader()
  );
  return res.data;
};

// Q&A 작성자 Id 가져오기
export const getQnaWriterId = async (questionId) => {
  const res = await axios.get(
    `${prefix}/user/qna/find/${questionId}`,
    getAuthHeader()
  );
  return res.data;
};

// Q&A 조회수 증가
export const increaseViewCount = async (questionId) => {
  return await axios.put(
    `${prefix}/user/qna/${questionId}/update`,
    null,
    getAuthHeader()
  );
};

// Q&A 데이터 삭제
export const deleteQna = async (questionId) => {
  return await axios.delete(
    `${prefix}/user/qna/delete/${questionId}`,
    getAuthHeader()
  );
};

// Q&A 게시글 수정
export const updateQna = async (questionId, data) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
  };

  const res = await axios.put(
    `${prefix}/user/qna/edit/${questionId}`,
    data,
    headers
  );

  return res.data;
};
