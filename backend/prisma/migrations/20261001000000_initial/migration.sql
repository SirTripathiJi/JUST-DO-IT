-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('academic', 'career', 'work', 'personal', 'health', 'finance', 'projects');

-- CreateEnum
CREATE TYPE "HabitFrequency" AS ENUM ('daily', 'weekdays', 'weekends', 'weekly', 'custom');

-- CreateEnum
CREATE TYPE "HabitCategory" AS ENUM ('wellness', 'mindset', 'productivity', 'fitness', 'learning', 'health');

-- CreateEnum
CREATE TYPE "HabitTimeOfDay" AS ENUM ('morning', 'afternoon', 'evening', 'anytime');

-- CreateEnum
CREATE TYPE "SupplementTiming" AS ENUM ('morning', 'noon', 'evening', 'bedtime', 'with_meal');

-- CreateEnum
CREATE TYPE "SupplementFrequency" AS ENUM ('daily', 'specific_days', 'as_needed');

-- CreateEnum
CREATE TYPE "WorkoutType" AS ENUM ('strength', 'cardio', 'hiit', 'mobility', 'sports', 'custom', 'recovery');

-- CreateEnum
CREATE TYPE "SelfCareCategory" AS ENUM ('skincare', 'haircare', 'hygiene', 'grooming', 'body', 'mental');

-- CreateEnum
CREATE TYPE "RoutineFrequency" AS ENUM ('daily', 'alternate', 'weekly', 'custom');

-- CreateEnum
CREATE TYPE "RoutineTimeOfDay" AS ENUM ('morning', 'evening', 'night', 'anytime');

-- CreateEnum
CREATE TYPE "GoalCategory" AS ENUM ('semester', 'monthly', 'subject', 'career', 'personal', 'habit');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('not_started', 'in_progress', 'completed', 'on_hold');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('beginner', 'intermediate', 'advanced', 'master');

-- CreateEnum
CREATE TYPE "CareerProjectStatus" AS ENUM ('planning', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "CareerResourceType" AS ENUM ('article', 'book', 'video', 'tool', 'repo');

-- CreateEnum
CREATE TYPE "ScheduleCategory" AS ENUM ('work', 'academic', 'fitness', 'personal', 'wellness', 'hobby');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "password_hash" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "user_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "title" VARCHAR(160) NOT NULL DEFAULT '',
    "daily_focus" VARCHAR(500) NOT NULL DEFAULT '',
    "semester" VARCHAR(120),
    "wake_time" VARCHAR(5),
    "sleep_time" VARCHAR(5),
    "avatar_initials" VARCHAR(4) NOT NULL DEFAULT '',
    "avatar_color" VARCHAR(20),
    "water_target_ml" INTEGER NOT NULL DEFAULT 2500,
    "onboarded" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_data" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "description" TEXT,
    "priority" "TaskPriority" NOT NULL DEFAULT 'medium',
    "due_date" DATE,
    "due_time" VARCHAR(5),
    "end_time" VARCHAR(5),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMPTZ(3),
    "category" "TaskCategory" NOT NULL DEFAULT 'personal',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "recurring" VARCHAR(16),
    "reminder" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_subtasks" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "task_subtasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habits" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "icon" VARCHAR(80),
    "description" TEXT,
    "frequency" "HabitFrequency" NOT NULL DEFAULT 'daily',
    "selected_days" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "target_per_day" INTEGER NOT NULL DEFAULT 1,
    "target_unit" VARCHAR(40),
    "category" "HabitCategory" NOT NULL DEFAULT 'wellness',
    "time_of_day" "HabitTimeOfDay",
    "color" VARCHAR(40),
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "reminder_time" VARCHAR(5),
    "best_streak" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "habits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_completions" (
    "id" UUID NOT NULL,
    "habit_id" UUID NOT NULL,
    "completed_on" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habit_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "water_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "target_ml" INTEGER NOT NULL DEFAULT 2500,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "water_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "water_log_entries" (
    "id" UUID NOT NULL,
    "water_log_id" UUID NOT NULL,
    "amount_ml" INTEGER NOT NULL,
    "timestamp" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "container_name" VARCHAR(100),

    CONSTRAINT "water_log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplements" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "dosage" VARCHAR(80) NOT NULL,
    "unit" VARCHAR(40) NOT NULL,
    "timing" "SupplementTiming" NOT NULL,
    "frequency" "SupplementFrequency" NOT NULL DEFAULT 'daily',
    "selected_days" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "notes" TEXT,
    "reminder" BOOLEAN NOT NULL DEFAULT false,
    "reminder_time" VARCHAR(5),
    "category" VARCHAR(40),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "supplements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplement_completions" (
    "id" UUID NOT NULL,
    "supplement_id" UUID NOT NULL,
    "completed_on" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplement_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "scheduled_date" DATE,
    "title" VARCHAR(160) NOT NULL,
    "workout_type" "WorkoutType" NOT NULL,
    "muscle_groups" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "duration_minutes" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER NOT NULL DEFAULT 3,
    "energy_level" INTEGER,
    "difficulty" INTEGER,
    "reflection" TEXT,
    "notes" TEXT,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "template_name" VARCHAR(160),
    "activity_type" VARCHAR(40),
    "distance" DOUBLE PRECISION,
    "sport_activity" VARCHAR(100),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "workout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "target_muscle" VARCHAR(100) NOT NULL,
    "notes" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_sets" (
    "id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "set_number" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "weight_kg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "exercise_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "self_care_routines" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "category" "SelfCareCategory" NOT NULL,
    "frequency" "RoutineFrequency" NOT NULL,
    "selected_days" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "time_of_day" "RoutineTimeOfDay" NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "self_care_routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "self_care_completions" (
    "id" UUID NOT NULL,
    "routine_id" UUID NOT NULL,
    "completed_on" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "self_care_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_subjects" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "professor" VARCHAR(160),
    "semester" VARCHAR(120) NOT NULL,
    "color" VARCHAR(40),
    "notes" TEXT,
    "goals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "academic_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecture_sheets" (
    "id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "completed_date" DATE,

    CONSTRAINT "lecture_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_sheets" (
    "id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "completed_date" DATE,

    CONSTRAINT "lab_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "due_date" DATE NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "weightPercentage" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_exams" (
    "id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "date" DATE NOT NULL,
    "time" VARCHAR(5),
    "location" VARCHAR(160),
    "syllabus_covered" TEXT,
    "weight_percentage" DOUBLE PRECISION,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "academic_exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_roadmaps" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "target_role" VARCHAR(180) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "career_roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_skills" (
    "id" UUID NOT NULL,
    "roadmap_id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "level" "SkillLevel" NOT NULL,
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "career_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_courses" (
    "id" UUID NOT NULL,
    "roadmap_id" UUID NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "platform" VARCHAR(120) NOT NULL,
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "url" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "career_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_projects" (
    "id" UUID NOT NULL,
    "roadmap_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "tech_stack" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "github_url" TEXT,
    "live_url" TEXT,
    "status" "CareerProjectStatus" NOT NULL DEFAULT 'planning',

    CONSTRAINT "career_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_project_milestones" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "career_project_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_milestones" (
    "id" UUID NOT NULL,
    "roadmap_id" UUID NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "target_date" DATE,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "career_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_resources" (
    "id" UUID NOT NULL,
    "roadmap_id" UUID NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "type" "CareerResourceType" NOT NULL,
    "url" TEXT,
    "notes" TEXT,

    CONSTRAINT "career_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "category" "GoalCategory" NOT NULL,
    "target_date" DATE NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'not_started',
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_milestones" (
    "id" UUID NOT NULL,
    "goal_id" UUID NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "target_date" DATE,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "goal_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_checklist_items" (
    "id" UUID NOT NULL,
    "goal_id" UUID NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "goal_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hobbies" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "category" VARCHAR(80) NOT NULL,
    "icon" VARCHAR(80),
    "target_frequency" VARCHAR(100) NOT NULL,
    "target_minutes_per_week" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "hobbies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hobby_sessions" (
    "id" UUID NOT NULL,
    "hobby_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "hobby_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_items" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "category" "ScheduleCategory" NOT NULL,
    "location" VARCHAR(240),
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "schedule_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspiration_images" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "image_data" TEXT NOT NULL,
    "title" VARCHAR(200),
    "caption" VARCHAR(500),
    "category" VARCHAR(100),
    "note" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER,
    "height" INTEGER,
    "aspect_ratio" DOUBLE PRECISION,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "inspiration_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_expires_at_idx" ON "sessions"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "tasks_user_id_due_date_completed_idx" ON "tasks"("user_id", "due_date", "completed");

-- CreateIndex
CREATE INDEX "tasks_user_id_created_at_idx" ON "tasks"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "task_subtasks_task_id_position_idx" ON "task_subtasks"("task_id", "position");

-- CreateIndex
CREATE INDEX "habits_user_id_archived_idx" ON "habits"("user_id", "archived");

-- CreateIndex
CREATE INDEX "habit_completions_completed_on_idx" ON "habit_completions"("completed_on");

-- CreateIndex
CREATE UNIQUE INDEX "habit_completions_habit_id_completed_on_key" ON "habit_completions"("habit_id", "completed_on");

-- CreateIndex
CREATE INDEX "water_logs_user_id_date_idx" ON "water_logs"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "water_logs_user_id_date_key" ON "water_logs"("user_id", "date");

-- CreateIndex
CREATE INDEX "water_log_entries_water_log_id_timestamp_idx" ON "water_log_entries"("water_log_id", "timestamp");

-- CreateIndex
CREATE INDEX "supplements_user_id_name_idx" ON "supplements"("user_id", "name");

-- CreateIndex
CREATE INDEX "supplement_completions_completed_on_idx" ON "supplement_completions"("completed_on");

-- CreateIndex
CREATE UNIQUE INDEX "supplement_completions_supplement_id_completed_on_key" ON "supplement_completions"("supplement_id", "completed_on");

-- CreateIndex
CREATE INDEX "workout_sessions_user_id_date_idx" ON "workout_sessions"("user_id", "date");

-- CreateIndex
CREATE INDEX "workout_sessions_user_id_is_template_idx" ON "workout_sessions"("user_id", "is_template");

-- CreateIndex
CREATE INDEX "exercises_session_id_position_idx" ON "exercises"("session_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_sets_exercise_id_set_number_key" ON "exercise_sets"("exercise_id", "set_number");

-- CreateIndex
CREATE INDEX "self_care_routines_user_id_category_idx" ON "self_care_routines"("user_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "self_care_completions_routine_id_completed_on_key" ON "self_care_completions"("routine_id", "completed_on");

-- CreateIndex
CREATE INDEX "academic_subjects_user_id_semester_idx" ON "academic_subjects"("user_id", "semester");

-- CreateIndex
CREATE UNIQUE INDEX "academic_subjects_user_id_code_key" ON "academic_subjects"("user_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "lecture_sheets_subject_id_number_key" ON "lecture_sheets"("subject_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "lab_sheets_subject_id_number_key" ON "lab_sheets"("subject_id", "number");

-- CreateIndex
CREATE INDEX "assignments_subject_id_due_date_idx" ON "assignments"("subject_id", "due_date");

-- CreateIndex
CREATE INDEX "academic_exams_subject_id_date_idx" ON "academic_exams"("subject_id", "date");

-- CreateIndex
CREATE INDEX "career_roadmaps_user_id_created_at_idx" ON "career_roadmaps"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "career_skills_roadmap_id_name_key" ON "career_skills"("roadmap_id", "name");

-- CreateIndex
CREATE INDEX "career_project_milestones_project_id_position_idx" ON "career_project_milestones"("project_id", "position");

-- CreateIndex
CREATE INDEX "goals_user_id_status_target_date_idx" ON "goals"("user_id", "status", "target_date");

-- CreateIndex
CREATE INDEX "goal_milestones_goal_id_position_idx" ON "goal_milestones"("goal_id", "position");

-- CreateIndex
CREATE INDEX "goal_checklist_items_goal_id_position_idx" ON "goal_checklist_items"("goal_id", "position");

-- CreateIndex
CREATE INDEX "hobbies_user_id_name_idx" ON "hobbies"("user_id", "name");

-- CreateIndex
CREATE INDEX "hobby_sessions_hobby_id_date_idx" ON "hobby_sessions"("hobby_id", "date");

-- CreateIndex
CREATE INDEX "schedule_items_user_id_date_start_time_idx" ON "schedule_items"("user_id", "date", "start_time");

-- CreateIndex
CREATE INDEX "inspiration_images_user_id_pinned_position_idx" ON "inspiration_images"("user_id", "pinned", "position");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_subtasks" ADD CONSTRAINT "task_subtasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_completions" ADD CONSTRAINT "habit_completions_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "water_logs" ADD CONSTRAINT "water_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "water_log_entries" ADD CONSTRAINT "water_log_entries_water_log_id_fkey" FOREIGN KEY ("water_log_id") REFERENCES "water_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplements" ADD CONSTRAINT "supplements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplement_completions" ADD CONSTRAINT "supplement_completions_supplement_id_fkey" FOREIGN KEY ("supplement_id") REFERENCES "supplements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "workout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_sets" ADD CONSTRAINT "exercise_sets_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "self_care_routines" ADD CONSTRAINT "self_care_routines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "self_care_completions" ADD CONSTRAINT "self_care_completions_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "self_care_routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_subjects" ADD CONSTRAINT "academic_subjects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecture_sheets" ADD CONSTRAINT "lecture_sheets_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "academic_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_sheets" ADD CONSTRAINT "lab_sheets_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "academic_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "academic_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_exams" ADD CONSTRAINT "academic_exams_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "academic_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_roadmaps" ADD CONSTRAINT "career_roadmaps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_skills" ADD CONSTRAINT "career_skills_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "career_roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_courses" ADD CONSTRAINT "career_courses_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "career_roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_projects" ADD CONSTRAINT "career_projects_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "career_roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_project_milestones" ADD CONSTRAINT "career_project_milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "career_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_milestones" ADD CONSTRAINT "career_milestones_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "career_roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_resources" ADD CONSTRAINT "career_resources_roadmap_id_fkey" FOREIGN KEY ("roadmap_id") REFERENCES "career_roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_milestones" ADD CONSTRAINT "goal_milestones_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_checklist_items" ADD CONSTRAINT "goal_checklist_items_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hobbies" ADD CONSTRAINT "hobbies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hobby_sessions" ADD CONSTRAINT "hobby_sessions_hobby_id_fkey" FOREIGN KEY ("hobby_id") REFERENCES "hobbies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_items" ADD CONSTRAINT "schedule_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspiration_images" ADD CONSTRAINT "inspiration_images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
