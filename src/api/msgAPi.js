import axios from "axios";
import { getAuthHeader } from "../util/authHeader";

const API_SERVER_HOST = "https://www.eonuniversity.co.kr";
const prefix = `${API_SERVER_HOST}/api/professor/msg`;

// 메시지 전송 api
export const sendMessage = async (to, text) => {
  const config = getAuthHeader();

  return await axios.post(`${prefix}/send`, null, {
    ...config,
    params: {
      to,
      text,
    },
  });
};
