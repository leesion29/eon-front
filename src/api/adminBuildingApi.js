import axios from "axios";
import { getAuthHeader } from "../util/authHeader";

const API_SERVER_HOST = "https://www.eonuniversity.co.kr";
const prefix = `${API_SERVER_HOST}/api/admin/buildings`;

// 전체 건물 목록 조회
export const getAllBuildings = () => {
  return axios.get(prefix, getAuthHeader());
};

// 건물 생성
export const createBuilding = (name, status) => {
  return axios.post(
    prefix,
    null, // body 없이 query param
    {
      params: { name, status },
      ...getAuthHeader(),
    }
  );
};

// 건물 수정
export const updateBuilding = (buildingId, newName, newStatus) => {
  return axios.put(
    `${prefix}/${buildingId}`,
    null,
    {
      params: { newName, newStatus },
      ...getAuthHeader(),
    }
  );
};

// 건물 삭제
export const deleteBuilding = (buildingId) => {
  return axios.delete(`${prefix}/${buildingId}`, getAuthHeader());
};