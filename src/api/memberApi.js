import axios from "axios";
import { getAuthHeader } from "../util/authHeader";

export const API_SERVER_HOST = "https://www.eonuniversity.co.kr";
const prefix = `${API_SERVER_HOST}/api/user`;

// 로그인 (인증 필요 없음)
export const loginPost = async (loginParam) => {
  try {
    const res = await axios.post(`${prefix}/login`, loginParam, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (error) {
    console.error("로그인 요청 실패:", error);
    return { error: "로그인 실패. 다시 시도해주세요." };
  }
};

// 사용자 정보 조회 (인증 필요)
export const fetchUserInfo = (id) => {
  // console.log("id: ", id);
  return axios.get(`${prefix}/${id}`, getAuthHeader());
};

// 사용자 정보 수정 (인증 필요 + 예외 처리 보완)
export const updateUserInfo = async (userData) => {
  try {
    if (!userData?.userId) throw new Error("Invalid userId!");

    const headers = getAuthHeader();
    const res = await axios.put(
      `${prefix}/${userData.userId}/update`,
      userData,
      headers
    );
    return res.data;
  } catch (error) {
    console.error("유저 정보 업데이트 실패:", error);
    throw error; 
  }
};
// 학번 찾기 (인증 필요 없음)
export const findUserId = async (formData) => {
  try {
    const res = await axios.post(`${prefix}/finduserId`, formData, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (error) {
    console.error("학번 찾기 실패:", error);
    return { error: "학번 찾기에 실패했습니다." };
  }
};

export const findUserPw = async (formData) => {
  try {
    const res = await axios.post(`${prefix}/finduserPassword`, formData, {
      headers: { "Content-Type": "application/json" },
    });
    console.log("✅ 응답 데이터:", res.data); // 반드시 나와야 함
    return res.data;
  } catch (error) {
    console.error("❌ axios 요청 실패");
    console.error("🔸 error.response:", error.response);
    console.error("🔸 error.message:", error.message);
    throw new Error(error.response?.data?.error || "비밀번호 찾기 오류 발생");
  }
};
