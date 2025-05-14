import axios from "axios";
import { getAuthHeader } from "../util/authHeader";
const API_SERVER_HOST = "http://localhost:8080";
const prefix = `${API_SERVER_HOST}/api/students/evaluation`;
const prefix2 = `${API_SERVER_HOST}/api/professor/evaluation`;

/* 학생 */

// 강의 평가 질문 불러오기
export const getQuestions = async () => {
  try {
    const res = await axios.get(`${prefix}/quelist`, getAuthHeader());
    return res.data;
  } catch (error) {
    console.log("질문을 불러올 수 없습니다!", error);
  }
};

// 강의 평가 할 리스트 불러오기
export const getList = async (id) => {
  try {
    const res = await axios.get(
      `${prefix}/courselist?studentId=${id}`,
      getAuthHeader()
    );
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log("평가 대상을 불러올 수 없습니다!", error);
  }
};

// 강의 평가 제출
export const submitEvaluation = async (
  userId,
  questionId,
  classId,
  createdAt,
  choice,
  text
) => {
  const config = getAuthHeader();

  const data = {
    lectDto: { evaluationId: null, createdAt },
    dto: {
      answerId: null,
      answerChoice: choice,
      subjectiveText: text,
    },
  };

  const url = `${prefix}/savedata?userId=${userId}&questionId=${questionId}&classId=${classId}`;
  return await axios.post(url, data, config);
};


// 강의 평가 참여 상태 불러오기
export const getStatus = async (id) => {
  try {
    const res = await axios.get(
      `${prefix}/lecturelist?studentId=${id}`,
      getAuthHeader()
    );
    return res.data;
  } catch (error) {
    console.log("데이터 상태를 불러올 수 없습니다!");
  }
};


/* 교수 */

// 강의 평가 기록 리스트 불러오기
export const findProfessorLectureList = async () => {
  try {
    const res = await axios.get(`${prefix2}/list`, getAuthHeader());
    return res.data;
  } catch (error) {
    console.log("평가 기록을 불러올 수 없습니다!", error);
  }
};

// 강의 평가 내용 불러오기
export const findAnswer = async (evaluationId) => {
  try {
    const auth = getAuthHeader();

    const res = await axios.get(`${prefix2}/answer`, {
      ...auth,
      params: { evaluationId },
    });
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log("평가 내용 데이터를 불러올 수 없습니다!", error);
  }
};
