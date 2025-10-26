import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { BarChart3, CheckCircle, Clock } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

interface QuizAttempt {
  id: number;
  quiz_id: number;
  quiz_title: string;
  course_title: string;
  score: number;
  completed_at: string;
}

export default function QuizAttempts() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const response = await api.get("/quizzes/my/attempts");
      setAttempts(response.data.attempts);
    } catch (error) {
      console.error("Quiz attempts fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            My Quiz Attempts
          </h1>
          <p className="text-gray-600">
            Review your previous quiz performances
          </p>
        </div>

        <div className="space-y-4">
          {attempts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No quiz attempts yet
              </h3>
              <p className="text-gray-600">
                Complete a quiz to see your results here
              </p>
            </div>
          ) : (
            attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      {attempt.quiz_title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-2">
                      {attempt.course_title}
                    </p>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`flex items-center text-sm font-medium ${
                          attempt.score >= 70
                            ? "text-green-600"
                            : "text-orange-600"
                        }`}
                      >
                        {attempt.score >= 70 ? (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        ) : (
                          <Clock className="h-4 w-4 mr-1" />
                        )}
                        Score: {Math.round(attempt.score)}%
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(attempt.completed_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/quiz/${attempt.quiz_id}/review/${attempt.id}`}
                    className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
