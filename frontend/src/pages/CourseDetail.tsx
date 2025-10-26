import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import {
  BookOpen,
  Play,
  Clock,
  Users,
  Star,
  CheckCircle,
  Lock,
  Award,
  X,
} from "lucide-react";
import { Dialog } from "@headlessui/react";

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  price: number;
  instructor_name: string;
  instructor_email: string;
  thumbnail_url?: string;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  order_index: number;
  video_url?: string;
}

function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url?.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState<{ completedLessons: number[] }>({
    completedLessons: [],
  });
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [videoLoading, setVideoLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
      if (user) {
        checkEnrollmentStatus();
      }
    }
  }, [id, user]);

  const fetchCourseDetails = async (): Promise<void> => {
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data.course);
      setLessons(res.data.lessons);
    } catch (err) {
      console.error("Fetch error", err);
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async (): Promise<void> => {
    try {
      const [enrolledRes, progressRes] = await Promise.all([
        api.get("/courses/my/enrolled"),
        api.get(`/progress/course/${id}`),
      ]);
      const enrolled = enrolledRes.data.courses.some(
        (c: any) => c.id === parseInt(id!)
      );
      setIsEnrolled(enrolled);
      if (enrolled) setProgress(progressRes.data);
    } catch (err) {
      console.error("Enrollment check error:", err);
    }
  };

  const handleEnroll = async (): Promise<void> => {
    if (!user) {
      navigate("/login");
      return;
    }
    setEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll`);
      setIsEnrolled(true);
      await checkEnrollmentStatus();
    } catch (err: any) {
      alert(err.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  const markLessonComplete = async (lessonId: number): Promise<void> => {
    try {
      await api.post(`/progress/lesson/${lessonId}/complete`);
      await checkEnrollmentStatus();
    } catch (err) {
      console.error("Progress update error:", err);
    }
  };

  const openLesson = (lesson: Lesson): void => {
    if (!isEnrolled) return;
    setSelectedLesson(lesson);
    setVideoLoading(true);
    markLessonComplete(lesson.id);
  };

  const closeModal = (): void => {
    setSelectedLesson(null);
    setVideoLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center text-gray-700 py-10">Course not found.</div>
    );
  }

  const totalLessons = lessons.length;
  const completed = progress.completedLessons.length;
  const progressPercent =
    totalLessons > 0 ? (completed / totalLessons) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border mb-8">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-64 object-cover rounded-t-xl"
          />
        ) : (
          <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
            <Play className="h-12 w-12" />
          </div>
        )}

        <div className="p-6 lg:flex justify-between gap-6">
          <div className="flex-1">
            <div className="flex gap-2 mb-3">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                {course.category}
              </span>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                {course.difficulty}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>
                <Users className="inline h-4 w-4 mr-1" /> 500+ students
              </span>
              <span>
                <Clock className="inline h-4 w-4 mr-1" />{" "}
                {lessons.reduce((a, b) => a + b.duration_minutes, 0)} mins
              </span>
              <span>
                <Star className="inline h-4 w-4 mr-1 text-yellow-400" /> 4.8
                rating
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Instructor:{" "}
              <span className="font-semibold">{course.instructor_name}</span>
            </p>
          </div>

          <div className="lg:w-80 mt-6 lg:mt-0 bg-gray-50 rounded-xl p-6 shadow">
            <div className="text-3xl font-bold mb-4">
              {course.price === 0 ? "Free" : `$${course.price}`}
            </div>
            {isEnrolled ? (
              <div>
                <div className="flex items-center text-green-600 mb-2">
                  <CheckCircle className="h-5 w-5 mr-2" /> Enrolled
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="bg-gray-200 h-2 rounded-full mt-1">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {completed} / {totalLessons} lessons completed
                  </p>
                  {progressPercent === 100 && (
                    <div className="mt-4 bg-yellow-100 text-yellow-800 rounded p-3 flex items-center">
                      <Award className="h-5 w-5 mr-2" /> Course Completed!
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mt-2"
              >
                {enrolling ? "Enrolling..." : "Enroll Now"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Course Content</h2>
        {lessons.length === 0 ? (
          <p className="text-gray-600">No lessons added yet.</p>
        ) : (
          <ul className="space-y-3">
            {lessons.map((lesson) => {
              const completed = progress.completedLessons.includes(lesson.id);
              const locked = !isEnrolled;

              return (
                <li
                  key={lesson.id}
                  onClick={() => openLesson(lesson)}
                  className={`p-4 border rounded-lg flex justify-between items-center cursor-pointer ${
                    completed
                      ? "bg-green-50 border-green-200"
                      : "hover:bg-gray-50"
                  } ${locked ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  <div>
                    <h3 className="font-medium">{lesson.title}</h3>
                    <p className="text-sm text-gray-500">
                      {lesson.description}
                    </p>
                  </div>
                  <div>
                    {locked ? (
                      <Lock className="h-5 w-5 text-gray-400" />
                    ) : completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Play className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Video Modal */}
      <Dialog
        open={!!selectedLesson}
        onClose={closeModal}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white w-full max-w-4xl rounded-xl shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{selectedLesson?.title}</h3>
              <button onClick={closeModal}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="aspect-video bg-black relative">
              {selectedLesson?.video_url ? (
                <>
                  {videoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                  )}
                  {getYouTubeId(selectedLesson.video_url) ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${getYouTubeId(
                        selectedLesson.video_url
                      )}?autoplay=1`}
                      title={selectedLesson.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className={`w-full h-full ${
                        videoLoading ? "opacity-0" : "opacity-100"
                      }`}
                      onLoad={() => setVideoLoading(false)}
                    />
                  ) : (
                    <video
                      controls
                      autoPlay
                      className="w-full h-full"
                      onCanPlay={() => setVideoLoading(false)}
                    >
                      <source src={selectedLesson.video_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No video available for this lesson.
                </div>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
