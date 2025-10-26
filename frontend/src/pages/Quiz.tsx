import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Clock, CheckCircle, X, ArrowLeft } from "lucide-react";

interface Question {
  id: number;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  options: string[] | string; // Updated to accept both array and string
  points: number;
  order_index: number;
  correct_answer?: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  time_limit_minutes: number;
  passing_score: number;
  max_attempts: number;
}

export default function Quiz() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Helper function to safely parse options
  const parseOptions = (options: string[] | string): string[] => {
    if (Array.isArray(options)) return options;
    try {
      return options ? JSON.parse(options) : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuiz();
    }
  }, [id]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !submitted) {
      handleSubmit();
    }
  }, [timeLeft, submitted]);

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/quizzes/${id}`);
      setQuiz(response.data.quiz);
      
      // Parse options for each question
      const parsedQuestions = response.data.questions.map((q: Question) => ({
        ...q,
        options: parseOptions(q.options)
      }));
      
      setQuestions(parsedQuestions);

      if (response.data.quiz.time_limit_minutes) {
        setTimeLeft(response.data.quiz.time_limit_minutes * 60);
      }
    } catch (error) {
      console.error("Quiz fetch error:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await api.post(`/quizzes/${id}/submit`, { answers });
      setResult(response.data);

      // Update questions with correct answers
      const updatedQuestions = questions.map((q) => ({
        ...q,
        correct_answer: response.data.correct_answers?.[q.id],
      }));
      setQuestions(updatedQuestions);

      setSubmitted(true);
    } catch (error) {
      console.error("Quiz submission error:", error);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Quiz not found
          </h2>
          <p className="text-gray-600">
            The quiz you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    const passed = result.score >= quiz.passing_score;
    const currentQ = questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${passed ? "bg-green-100" : "bg-red-100"}`}>
              {passed ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <X className="h-8 w-8 text-red-600" />
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Completed!</h1>
            <div className="text-6xl font-bold mb-4">
              <span className={passed ? "text-green-600" : "text-red-600"}>
                {Math.round(result.score)}%
              </span>
            </div>
            <p className="text-lg text-gray-600 mb-6">
              You answered {result.correctAnswers} out of {result.totalQuestions} questions correctly
            </p>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-8 ${
              passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {passed ? "🎉 Congratulations! You passed!" : "📚 Keep studying and try again!"}
            </div>
          </div>

          {/* Review Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Answers</h2>
            <div className="space-y-8">
              {questions.map((question, index) => {
                const options = parseOptions(question.options);
                return (
                  <div key={question.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Question {index + 1}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        answers[question.id] === question.correct_answer
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"}`}>
                        {question.points} pts
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{question.question_text}</p>

                    {question.question_type === "multiple_choice" && (
                      <div className="space-y-2">
                        {options.map((option, i) => (
                          <div key={i} className={`p-3 border rounded-lg ${
                            option === question.correct_answer
                              ? "bg-green-50 border-green-200"
                              : answers[question.id] === option && option !== question.correct_answer
                              ? "bg-red-50 border-red-200"
                              : "border-gray-200"}`}>
                            {option}
                            {option === question.correct_answer && (
                              <span className="ml-2 text-green-600">✓ Correct answer</span>
                            )}
                            {answers[question.id] === option && option !== question.correct_answer && (
                              <span className="ml-2 text-red-600">✗ Your answer</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {question.question_type === "true_false" && (
                      <div className="space-y-2">
                        {["True", "False"].map((option) => (
                          <div key={option} className={`p-3 border rounded-lg ${
                            option === question.correct_answer
                              ? "bg-green-50 border-green-200"
                              : answers[question.id] === option && option !== question.correct_answer
                              ? "bg-red-50 border-red-200"
                              : "border-gray-200"}`}>
                            {option}
                            {option === question.correct_answer && (
                              <span className="ml-2 text-green-600">✓ Correct answer</span>
                            )}
                            {answers[question.id] === option && option !== question.correct_answer && (
                              <span className="ml-2 text-red-600">✗ Your answer</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {question.question_type === "short_answer" && (
                      <div className="space-y-4">
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="font-medium text-gray-700">Your answer:</p>
                          <p className="mt-1">{answers[question.id] || "No answer provided"}</p>
                        </div>
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="font-medium text-gray-700">Correct answer:</p>
                          <p className="mt-1">{question.correct_answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const currentOptions = parseOptions(currentQ.options);
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            {timeLeft !== null && (
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                timeLeft < 300 ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(timeLeft)}
              </div>
            )}
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <p className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQ.question_text}
          </h2>

          <div className="space-y-3">
            {currentQ.question_type === "multiple_choice" &&
              currentOptions.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    value={option}
                    checked={answers[currentQ.id] === option}
                    onChange={() => handleAnswerChange(currentQ.id, option)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-900">{option}</span>
                </label>
              ))}

            {currentQ.question_type === "true_false" && (
              <>
                <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    value="True"
                    checked={answers[currentQ.id] === "True"}
                    onChange={() => handleAnswerChange(currentQ.id, "True")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-900">True</span>
                </label>
                <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    value="False"
                    checked={answers[currentQ.id] === "False"}
                    onChange={() => handleAnswerChange(currentQ.id, "False")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-900">False</span>
                </label>
              </>
            )}

            {currentQ.question_type === "short_answer" && (
              <textarea
                value={answers[currentQ.id] || ""}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                placeholder="Enter your answer..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Previous
          </button>

          <div className="flex space-x-4">
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}