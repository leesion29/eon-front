import axios from "axios";
import { getAuthHeader } from "../util/authHeader";

export const API_SERVER_HOST = "http://localhost:8080";
const prefix = `${API_SERVER_HOST}/api/admin/schedule`;

// 학사일정 관련 API
export const getScheduleByTypeAndSemester = (type, semesterId) => {
  return axios.get(`${prefix}/${semesterId}/${type}`, getAuthHeader());
};


export const saveSchedule = (scheduleData) => {
  return axios.post(`${prefix}`, scheduleData, getAuthHeader());
};

// 학기 관련 API
export const getAllSemesters = () => {
  return axios.get(`${prefix}/semester`, getAuthHeader());
};

export const createSemester = (semesterData) => {
  return axios.post(`${prefix}/semester`, semesterData, getAuthHeader());
};

export const updateSemester = (semesterId, semesterData) => {
  return axios.put(`${prefix}/semester/${semesterId}`, semesterData, getAuthHeader());
};


export const deleteSemester = (semesterId) => {
  return axios.delete(`${prefix}/semester/${semesterId}`, getAuthHeader());
};