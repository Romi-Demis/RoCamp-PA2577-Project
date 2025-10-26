import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, X, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  user_answer: string;
  points: number;
}

interface QuizAttempt {
  id: number;
  quiz_id: number;
  quiz_title: string;
  course_title: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  completed_at: string;
}

export default function QuizReview() {
  const { quizId, attemptId } = useParams();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttemptDetails();
  }, [quizId, attemptId]);

  const fetchAttemptDetails = async () => {
    try {
      const response = await api.get(`/quizzes/attempts/${attemptId}`);
      setAttempt(response.data.attempt);
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Quiz attempt fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Quiz attempt not found
          </h2>
          <p className="text-gray-600">
            The quiz attempt you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const passed = attempt.score >= 70;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
            passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {passed ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <X className="h-8 w-8 text-red-600" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Quiz Review: {attempt.quiz_title}
          </h1>

          <div className="text-4xl font-bold mb-4">
            <span className={passed ? 'text-green-600' : 'text-red-600'}>
              {Math.round(attempt.score)}%
            </span>
          </div>

          <p className="text-lg text-gray-600 mb-6">
            You answered {attempt.correct_answers} out of {attempt.total_questions} questions correctly
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Question Review
          </h2>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Question {index + 1}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    question.user_answer === question.correct_answer
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {question.points} pts
                  </span>
                </div>

                <p className="text-gray-700 mb-4">{question.question_text}</p>

                {question.question_type === 'multiple_choice' && (
                  <div className="space-y-2">
                    {question.options.map((option, i) => (
                      <div
                        key={i}
                        className={`p-3 border rounded-lg ${
                          option === question.correct_answer
                            ? 'bg-green-50 border-green-200'
                            : question.user_answer === option
                            ? 'bg-red-50 border-red-200'
                            : 'border-gray-200'
                        }`}
                      >
                        {option}
                        {option === question.correct_answer && (
                          <span className="ml-2 text-green-600">✓ Correct answer</span>
                        )}
                        {question.user_answer === option && option !== question.correct_answer && (
                          <span className="ml-2 text-red-600">✗ Your answer</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {question.question_type === 'short_answer' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="font-medium text-gray-700">Your answer:</p>
                      <p className="mt-1">
                        {question.user_answer || "No answer provided"}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="font-medium text-gray-700">Correct answer:</p>
                      <p className="mt-1">{question.correct_answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link
              to="/quiz-attempts"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quiz Attempts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}