import "../../../src/EvaluationPage.css";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { findAnswer, getQuestions } from "../../api/evaluationAPI";

/* 강의 평가 데이터 조회 페이지(evaluationdata) - 강의 평가 내용을 조회하는 페이지*/
const ProfessorEvaluationDataPage = () => {
  const [questions, setQuestions] = useState([]);
  const [answer, setAnswer] = useState([]);
  const navigate = useNavigate();

  // state로 이전 페이지에서 받은 값을 불러옴
  const { state } = useLocation();
  const userId = useSelector((state) => state.auth?.userId);
  const evaluationId = state.evaluationId;
  const courseName = state.courseName;
  const classId = state.classId;
  const number = state.num;

  // 데이터 불러오기
  useEffect(() => {
    const fetchQuestionInfo = async () => {
      const data = await getQuestions();
      setQuestions(data);
    }
    const fetchAnswer = async () => {
      const data = await findAnswer(evaluationId);
      setAnswer(data);
    }
    fetchQuestionInfo();
    fetchAnswer();
    
  }, [userId, evaluationId]);

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 p-8 sm:p-10 lg:p-12 bg-white shadow-md rounded-lg relative">
      <p className="font-bold text-3xl text-blue-700">
          No.{number+1}
        <span className="font-normal text-sm float-right text-gray-400 pt-8">
          과목명 : {courseName}
        </span>
      </p>
      <hr className="mt-7" />

      {questions.map((q, index) => (
        <div className="my-12" key={q.question_id || index}>
          <label className="block mb-2 text-left">
            <span className="font-bold text-blue-700 text-lg">
              질문 {index + 1}:
            </span>
            <br /> {q.questionText}
          </label>

          {q.isSubjective && answer[7]?.subjectiveText !== undefined ? (
            <textarea
              rows="4"
              placeholder="의견을 적어주세요"
              value={answer[7].subjectiveText || ""}
              className="w-full p-2 text-base mt-2 resize-y border rounded-md caret-transparent focus:outline-none focus:ring-0"
              readOnly
            />
          ) : (
            <div className="w-[85%] mx-auto">
              <input
                type="range"
                min="1"
                max="5"
                value={answer[index]?.answerChoice ?? 3}
                className="custom-slider w-full appearance-none h-2 rounded bg-gradient-to-r from-blue-800 to-teal-200 outline-none mb-1"
                readOnly
              />
              <div className="flex justify-between text-sm px-1 text-gray-600">
                {[1, 2, 3, 4, 5].map((num) => (
                  <span key={num}>{num}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
            <button
        onClick={() => {
          navigate("/main/professor/evaluationlist", {state : {courseName : courseName, classId : classId}});
        }}
        className="text-blue-500 hover:text-blue-700 text-lg font-semibold px-3 pt-10 rounded transition"
      >
        ← 이전으로
      </button>
    </div>
  );
};

export default ProfessorEvaluationDataPage;
