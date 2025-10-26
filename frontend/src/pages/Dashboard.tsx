import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  BookOpen,
  Award,
  TrendingUp,
  Clock,
  Play,
  CheckCircle,
  BarChart3,
  Users,
  Star,
  MessageCircle,
} from "lucide-react";

import EduChatBot from "./EduChatBot"; // 👈 Import chatbot

interface DashboardStats {
  enrolledCourses: number;
  completedCourses: number;
  quizAttempts: number;
}

interface RecentActivity {
  type: "lesson" | "quiz";
  title: string;
  date: string;
}

interface EnrolledCourse {
  id: number;
  title: string;
  instructor_name: string;
  progress: number;
  enrolled_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    enrolledCourses: 0,
    completedCourses: 0,
    quizAttempts: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const [isChatOpen, setIsChatOpen] = useState(false); // 👈 Chat toggle state
  const toggleChat = () => setIsChatOpen((prev) => !prev); // 👈 Chat toggle handler

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, coursesRes] = await Promise.all([
        api.get("/users/dashboard"),
        api.get("/courses/my/enrolled"),
      ]);

      setStats(dashboardRes.data.stats);
      setRecentActivity(dashboardRes.data.recentActivity);
      setEnrolledCourses(coursesRes.data.courses);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Enrolled Courses",
      value: stats.enrolledCourses,
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Completed Courses",
      value: stats.completedCourses,
      icon: Award,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Quiz Attempts",
      value: stats.quizAttempts,
      icon: BarChart3,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Hours Learned",
      value: Math.floor(stats.enrolledCourses * 8.5),
      icon: Clock,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Track your learning progress and continue your journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Enrolled Courses */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  My Courses
                </h2>
                <Link
                  to="/courses"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                >
                  Browse More →
                </Link>
              </div>

              {enrolledCourses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No courses yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Start your learning journey by enrolling in a course
                  </p>
                  <Link
                    to="/courses"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Courses
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrolledCourses.slice(0, 4).map((course) => (
                    <div
                      key={course.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            by {course.instructor_name}
                          </p>
                        </div>
                        <Link
                          to={`/courses/${course.id}`}
                          className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Continue
                        </Link>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {Math.round(course.progress)}% complete
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Recent Activity
              </h2>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          activity.type === "lesson"
                            ? "bg-blue-50"
                            : "bg-purple-50"
                        }`}
                      >
                        {activity.type === "lesson" ? (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Star className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.type === "lesson"
                            ? "Lesson completed"
                            : "Quiz completed"}{" "}
                          • {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  to="/courses"
                  className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                >
                  <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-blue-700 font-medium">
                    Browse Courses
                  </span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <Users className="h-5 w-5 text-gray-600 mr-3" />
                  <span className="text-gray-700 font-medium">
                    Edit Profile
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ChatBot Component */}
      <EduChatBot isOpen={isChatOpen} onToggle={toggleChat} />
    </div>
  );
}
