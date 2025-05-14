import axios from "axios";
import { getAuthHeader } from "../util/authHeader";

const API_SERVER_HOST = "https://www.eonuniversity.co.kr";
const prefix = `${API_SERVER_HOST}/api/students/request`;

/* 휴학 및 복학 신청 */

// 휴학 신청
export const requestLeave = async (studentId, data) => {
    const res = await axios.post(
        `${prefix}/leave?studentId=${studentId}`,
        data,
        getAuthHeader()
    );
    return res.data
}

// 복학 신청
export const requestReturn = async (studentId, data) => {
    const res = await axios.post(
        `${prefix}/return?studentId=${studentId}`,
        data,
        getAuthHeader()
    );
    return res.data
}

/* 휴학 및 복학 내역 조회 */

// 내 휴학 내역 조회
export const seeMyLeaveRequest = async (studentId) => {
    const res = await axios.get(`${prefix}/leave/list?studentId=${studentId}`, getAuthHeader());
    return res.data;
};

// 내 복학 내역 조회
export const seeMyReturnRequest = async (studentId) => {
    const res = await axios.get(`${prefix}/return/list?studentId=${studentId}`, getAuthHeader());
    return res.data;
};