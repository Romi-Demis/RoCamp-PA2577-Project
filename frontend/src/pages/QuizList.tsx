import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Clock, Award, FileText, BookOpen } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

interface Quiz {
  id: number;
  title: string;
  description: string;
  time_limit_minutes: number;
  passing_score: number;
  max_attempts?: number;
  question_count: number;
  course_title: string;
}

export default function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await api.get("/quizzes");
        setQuizzes(response.data.quizzes);
      } catch (err) {
        console.error("Failed to fetch quizzes:", err);
        setError("Failed to load quizzes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Available Quizzes
          </h1>
          <p className="text-gray-600">
            Test your knowledge with these assessments
          </p>
        </div>

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No quizzes available
            </h3>
            <p className="text-gray-600 mb-4">
              There are currently no published quizzes
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">
                        <Link
                          to={`/quiz/${quiz.id}`}
                          className="hover:text-blue-600"
                        >
                          {quiz.title}
                        </Link>
                      </h2>
                      <p className="text-gray-600 text-sm mb-2">
                        {quiz.description}
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {quiz.question_count} Qs
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="flex items-center text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      <Clock className="h-3 w-3 mr-1" />
                      {quiz.time_limit_minutes} min
                    </span>
                    <span className="flex items-center text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      <Award className="h-3 w-3 mr-1" />
                      Pass: {quiz.passing_score}%
                    </span>
                    {quiz.course_title && (
                      <span className="flex items-center text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {quiz.course_title}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/quiz/${quiz.id}`}
                    className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start Quiz
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
