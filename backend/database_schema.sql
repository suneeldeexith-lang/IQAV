-- -------------------------------------------------------------
-- COURSE COMPLIANCE MANAGEMENT SYSTEM - POSTGRESQL SCHEMA
-- Adapted for Supabase
-- -------------------------------------------------------------

-- 1. Create Custom ENUM Types
CREATE TYPE "Role" AS ENUM ('ADMIN', 'FACULTY');
CREATE TYPE "Status" AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED');
CREATE TYPE "Category" AS ENUM ('COURSE_PLANNING', 'OBE', 'TEACHING_LEARNING', 'ASSESSMENT', 'FEEDBACK');

-- 2. Users Table (Replaces solitary Faculty table)
CREATE TABLE "users" (
    "user_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Courses Table
CREATE TABLE "courses" (
    "course_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "course_code" VARCHAR(50) NOT NULL,
    "course_name" VARCHAR(255) NOT NULL,
    "semester" VARCHAR(50) NOT NULL,
    "section" VARCHAR(50) NOT NULL,
    "faculty_id" UUID NOT NULL REFERENCES "users"("user_id") ON DELETE RESTRICT,
    "completion_percentage" NUMERIC(5,2) DEFAULT 0.0 CHECK ("completion_percentage" >= 0 AND "completion_percentage" <= 100),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Checklist Master Table
CREATE TABLE "checklist_master" (
    "checklist_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "checklist_item_name" VARCHAR(255) NOT NULL,
    "category" "Category" NOT NULL,
    "required_flag" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Course Checklist Status Table
CREATE TABLE "course_checklist_status" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "course_id" UUID NOT NULL REFERENCES "courses"("course_id") ON DELETE CASCADE,
    "checklist_id" UUID NOT NULL REFERENCES "checklist_master"("checklist_id") ON DELETE RESTRICT,
    "status" "Status" DEFAULT 'PENDING',
    "remarks" TEXT,
    "submission_date" TIMESTAMP WITH TIME ZONE,
    "last_updated" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("course_id", "checklist_id") -- Ensure only one entry per item per course
);

-- 6. Submissions (Uploads) Table
-- Enables multiple files per checklist item
CREATE TABLE "submissions" (
    "submission_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "course_checklist_id" UUID NOT NULL REFERENCES "course_checklist_status"("id") ON DELETE CASCADE,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Activity Log Table
-- Tracks who did what and when
CREATE TABLE "activity_logs" (
    "log_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
    "action" VARCHAR(255) NOT NULL, -- e.g., 'UPLOADED_FILE', 'APPROVED_CHECKLIST'
    "entity_type" VARCHAR(100) NOT NULL, -- e.g., 'SUBMISSION', 'CHECKLIST'
    "entity_id" UUID NOT NULL, -- Reference ID of the affected resource
    "details" TEXT, -- Optional JSON metadata or description
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attaching triggers
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON "users"
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER set_timestamp_courses
BEFORE UPDATE ON "courses"
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
