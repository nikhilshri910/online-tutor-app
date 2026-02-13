CREATE DATABASE IF NOT EXISTS online_tuition;
USE online_tuition;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher', 'student') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  teacher_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_courses_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_enrollment_student_course (student_id, course_id),
  CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS live_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  topic VARCHAR(255) NOT NULL,
  zoom_join_url TEXT NOT NULL,
  start_time DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_live_sessions_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS recordings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  vimeo_video_id VARCHAR(64) NOT NULL,
  embed_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_recordings_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_student_groups_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS group_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  student_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_group_student (group_id, student_id),
  CONSTRAINT fk_group_members_group FOREIGN KEY (group_id) REFERENCES student_groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_group_members_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS group_live_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  topic VARCHAR(255) NOT NULL,
  zoom_join_url TEXT NOT NULL,
  start_time DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_group_live_sessions_group FOREIGN KEY (group_id) REFERENCES student_groups(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS group_recordings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  vimeo_video_id VARCHAR(64) NOT NULL,
  embed_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_group_recordings_group FOREIGN KEY (group_id) REFERENCES student_groups(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS homework_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  teacher_id INT NOT NULL,
  subject VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  due_date DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_homework_tasks_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_homework_tasks_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS homework_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  student_id INT NOT NULL,
  status ENUM('pending', 'submitted') NOT NULL DEFAULT 'pending',
  submission_text TEXT NULL,
  submitted_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_homework_task_student (task_id, student_id),
  CONSTRAINT fk_homework_assignments_task FOREIGN KEY (task_id) REFERENCES homework_tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_homework_assignments_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  data_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
