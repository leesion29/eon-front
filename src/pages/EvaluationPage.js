import React, { useEffect, useState } from "react";
import "../../src/EvaluationPage.css";
import { getAuthHeader } from "../util/authHeader";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AlertModal from "../components/AlertModal";
import {
  getQuestions,
  getStatus,
  submitEvaluation,
} from "../api/evaluationAPI";

const EvaluationPage = () => {
  const userId = useSelector((state) => state.auth?.userId);
  const [questions, setQuestions] = useState([]);
  const [scores, setScores] = useState([]);
  const [evaluationStatus, setEvaluationStatus] = useState([]);
  const [comments, setComments] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [goTarget, setGoTarget] = useState(null);
  const [type, setType] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const setAlertData = (modalType, modalMsg, target) => {
    setType(modalType);
    setMsg(modalMsg);
    setGoTarget(target);
    setAlertModalOpen(true);
  };

  const { state } = useLocation();
  const classId = state.classId;
  const courseName = state.name;

  useEffect(() => {
    if(!userId || !classId) return;
    const fetchData = async () => {
      try {
        const questionData = await getQuestions();
        setQuestions(questionData);
        const statusData = await getStatus(userId);
        setEvaluationStatus(statusData);
      } catch (error) {
        console.error("데이터 조회 실패:", error);
        setQuestions([]);
        setEvaluationStatus([]);
      }
    };
    fetchData();
  }, [userId, classId]);

  useEffect(() => {
    if (!Array.isArray(evaluationStatus) || evaluationStatus.length === 0 || !classId) return;
    const isAlreadyEvaluated = evaluationStatus.some(
      (stat) => stat.classId === classId
    );
    if (isAlreadyEvaluated) {
      setAlertData("error", "이미 평가한 강의입니다.", "/main/evaluationlist");
    }
  }, [evaluationStatus, classId]);

  useEffect(() => {
    setScores(questions.map(() => 3));
  }, [questions]);

  const handleSliderChange = (index, value) => {
    const newScores = [...scores];
    newScores[index] = Number(value);
    setScores(newScores);
  };

  const handleCommentChange = (questionId, value) => {
    setComments((prev) => ({
      ...prev,
      [String(questionId)]: value,
    }));
  };

  const handleReset = () => {
    setScores(questions.map(() => 3));
    setComments({});
  };

  const handleClose = () => {
    setAlertModalOpen(false);
    if (goTarget) {
      navigate(goTarget);
      setGoTarget(null);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const createdAt = new Date().toISOString();

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const questionId = q.question_id;
        const isSubjective = q.isSubjective;
        const choice = isSubjective ? null : String(scores[i]);
        const text = isSubjective
          ? comments[String(questionId)]?.trim() || " "
          : null;

        await submitEvaluation(
          userId,
          questionId,
          classId,
          createdAt,
          choice,
          text
        );
      }

      setAlertData(
        "success",
        "성공적으로 강의 평가가\n 제출되었습니다.",
        "/main/evaluationlist"
      );
      handleReset();
    } catch (error) {
      console.error("제출 실패", error);
      setAlertData("error", "강의 평가 제출에\n 실패했습니다.", "");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 md:mt-10 p-4 sm:p-6 md:p-8 lg:p-12 bg-white shadow-md rounded-lg relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-3 md:pb-4 mb-4 md:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-700 mb-2 sm:mb-0">
          강의 평가
        </h2>
        <span className="text-xs sm:text-sm text-gray-500 sm:pt-2 md:pt-0">
          과목명 : {courseName}
        </span>
      </div>
      

      {questions.map((q, index) => (
        <div className="my-8 md:my-12" key={q.question_id || index}>
          <label className="block mb-2 text-left text-sm md:text-base">
            <span className="font-bold text-blue-700 text-base md:text-lg">
              질문 {index + 1}:
            </span>
            <br /> {q.questionText}
          </label>

          {q.isSubjective ? (
            <textarea
              rows="4"
              placeholder="의견을 적어주세요"
              value={comments[q.question_id] || ""}
              onChange={(e) =>
                handleCommentChange(q.question_id, e.target.value)
              }
              disabled={isLoading}
              className="w-full p-2 text-sm md:text-base mt-2 resize-y border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          ) : (
            <div className="w-full sm:w-[85%] mx-auto mt-2">
              <input
                type="range"
                min="1"
                max="5"
                value={scores[index] ?? 3}
                onChange={(e) => handleSliderChange(index, e.target.value)}
                disabled={isLoading}
                className="custom-slider w-full appearance-none h-2 rounded bg-gradient-to-r from-blue-600 to-teal-300 outline-none mb-1"
              />
              <div className="flex justify-between text-xs md:text-sm px-1 text-gray-600">
                {[1, 2, 3, 4, 5].map((num) => (
                  <span key={num}>{num}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* 버튼 영역 수정 */}
      <div className="mt-8 flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3">
        <button
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold py-2 px-4 rounded transition disabled:opacity-50"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          제출
        </button>
        <button
          className="w-full sm:w-auto bg-gray-400 hover:bg-gray-600 text-white text-xs sm:text-sm font-semibold py-2 px-4 rounded transition disabled:opacity-50"
          onClick={handleReset}
          disabled={isLoading}
        >
          리셋
        </button>
      </div>

      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full bg-white/80 flex justify-center items-center z-50">
          <div className="text-lg md:text-xl font-semibold text-blue-700 animate-pulse">
            제출 중입니다...
          </div>
        </div>
      )}

      <AlertModal
        isOpen={alertModalOpen}
        message={msg}
        onClose={() => handleClose(goTarget)} 
        type={type}
      />
    </div>
  );
};

export default EvaluationPage;