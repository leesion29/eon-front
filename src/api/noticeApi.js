import axios from "axios";
import { getAuthHeader } from "../util/authHeader";

const API_SERVER_HOST = "https://www.eonuniversity.co.kr";
const prefix = `${API_SERVER_HOST}/api/notice`;

// 공지사항 글 작성
export const writeNotice = async (adminId, data) => {
  const config = getAuthHeader();
  config.headers["Content-Type"] = "application/json";

  const res = await axios.post(
    `${prefix}/write?adminId=${adminId}`,
    data,
    config
  );

  return res.data;
};

// 공지사항 리스트 가져오기
export const getList = () => {
  return axios.get(`${prefix}/list`, getAuthHeader());
};

// 공지사항 데이터 가져오기
export const getData = (noticeId) => {
  return axios.get(`${prefix}/${noticeId}`,getAuthHeader());
}

// 공지사항 조회수 증가
export const increaseViewCount = (noticeId) => {
  return axios.put(
    `${prefix}/${noticeId}`,
    null,
    getAuthHeader()
  );
};

// 공지사항 데이터 수정
export const updateNotice = async (noticeId, data) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(), 
  };

  const res = await axios.put(
    `${prefix}/edit/${noticeId}`,
    data,
    headers
  );

  return res.data;
}

// 공지사항 데이터 삭제
export const deleteData = (noticeId) => {
  return axios.delete(`${prefix}/delete/${noticeId}`, getAuthHeader());
};