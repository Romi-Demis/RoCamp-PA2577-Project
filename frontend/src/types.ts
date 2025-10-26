// src/types.ts
export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  price: string;
  thumbnail_url: string;
  instructor_id: number;
  is_published: number;
  duration_hours: number;
  created_at: string;
  updated_at: string;
  instructor_name: string;
  instructor_email: string;
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  description: string;
  video_url: string;
  content: string;
  duration_minutes: number;
  order_index: number;
  is_published: number;
  created_at: string;
  updated_at: string;
}
