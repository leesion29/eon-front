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
    const fetchData = async () => {
      const questionData = await getQuestions();
      setQuestions(questionData);
      const statusData = await getStatus(userId);
      setEvaluationStatus(statusData);
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (!Array.isArray(evaluationStatus) || evaluationStatus.length === 0) return;
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
    <div className="w-full max-w-3xl mx-auto mt-10 p-8 sm:p-10 lg:p-12 bg-white shadow-md rounded-lg relative">
      <p className="font-bold text-3xl text-blue-700">
        강의 평가
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

          {q.isSubjective ? (
            <textarea
              rows="4"
              placeholder="의견을 적어주세요"
              value={comments[q.question_id] || ""}
              onChange={(e) =>
                handleCommentChange(q.question_id, e.target.value)
              }
              disabled={isLoading}
              className="w-full p-2 text-base mt-2 resize-y border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          ) : (
            <div className="w-[85%] mx-auto">
              <input
                type="range"
                min="1"
                max="5"
                value={scores[index] ?? 3}
                onChange={(e) => handleSliderChange(index, e.target.value)}
                disabled={isLoading}
                className="custom-slider w-full appearance-none h-2 rounded bg-gradient-to-r from-blue-800 to-teal-200 outline-none mb-1"
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

      <div className="text-white text-sm font-semibold float-right">
        <button
          className="bg-blue-500 hover:bg-blue-700 py-2 px-3 rounded transition disabled:opacity-50"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          제출
        </button>
        &nbsp;
        <button
          className="bg-gray-400 hover:bg-gray-700 py-2 px-3 rounded transition disabled:opacity-50"
          onClick={handleReset}
          disabled={isLoading}
        >
          리셋
        </button>
      </div>

      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full bg-white/70 flex justify-center items-center z-50">
          <div className="text-xl font-semibold text-blue-700 animate-pulse">
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