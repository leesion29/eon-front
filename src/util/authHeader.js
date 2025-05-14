// src/utils/authHeader.js
export const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  console.log("token:", token);
  if (!token) {
    throw new Error("Access token not found. 로그인 상태가 아닙니다.");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
