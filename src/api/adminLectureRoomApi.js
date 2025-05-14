import axios from "axios";
import { getAuthHeader } from "../util/authHeader";

export const API_SERVER_HOST = "http://localhost:8080";
const prefix = `${API_SERVER_HOST}/api/admin/lecture-rooms`;

//  특정 건물(buildingId)의 강의실 목록 조회
export const getLectureRoomsByBuilding = (buildingId) => {
  return axios.get(
    `${prefix}/buildings/${buildingId}/lecture-rooms`,
    getAuthHeader()
  );
};

//  특정 강의실(roomId)의 사용 현황 조회
export const getLectureRoomUsage = (roomId) => {
  return axios.get(
    `${prefix}/${roomId}/usage`,
    getAuthHeader()
  );
};

//  전체 건물 목록 조회
export const getAllBuildings = () => {
  return axios.get(
    `${prefix}/buildings`,
    getAuthHeader()
  );
};

export const createLectureRoom = ( roomName, buildingId ) => {
    return axios.post(
      `${prefix}`,
      null, // body 없음, 쿼리 파라미터 사용
      {
        params: { roomName, buildingId },
        ...getAuthHeader(),
      }
    );
  };
  

// 강의실 정보 수정
export const updateLectureRoom = (roomId, newName, newStatus) => {
    return axios.put(
      `${prefix}/${roomId}`,
      null,
      {
        params: { newName, newStatus }, 
        ...getAuthHeader(),
      }
    );
  };
  
  // 강의실 삭제
  export const deleteLectureRoom = (roomId) => {
    return axios.delete(`${prefix}/${roomId}`, getAuthHeader()); 
  };