# Course Compliance Management System - Architecture Plan

This document outlines the high-level architecture and design for the Course Compliance Management System for business school accreditation.

> [!IMPORTANT]
> **User Review Required:** Please review the architecture, schema, and API designs below. If this looks good to you, simply approve it, and we can proceed to setup the project and write the code. If you have any modifications (e.g. additional tables, specific UI frameworks), please let me know.

## Step 1: Database Schema with Relationships

We will use **PostgreSQL** for the database.

### 1. `users` (Replaces solitary Faculty table for better scalability)
Handles both Admin and Faculty authentication securely.
- `user_id` (Primary Key, UUID)
- `name` (String)
- `email` (String, Unique)
- `password_hash` (String)
- `role` (Enum: 'ADMIN', 'FACULTY')
- `created_at` (Timestamp)

### 2. `courses`
Tracks individual course offerings for a specific semester.
- `course_id` (Primary Key, UUID)
- `course_code` (String, e.g., 'MGT101')
- `course_name` (String)
- `semester` (String)
- `section` (String)
- `faculty_id` (Foreign Key -> `users.user_id`)
- `created_at` (Timestamp)

### 3. `checklist_master`
The global defining list of required documents/actions mapped to categories.
- `checklist_id` (Primary Key, UUID)
- `checklist_item_name` (String, e.g., 'Teaching Plan', 'CO-PO Mapping')
- `category` (Enum: 'Course Planning', 'OBE', 'Teaching Learning', etc.)
- `required_flag` (Boolean - defines if it's mandatory for completion)

### 4. `course_checklist_status`
Tracks the status of a specific checklist item for a specific course.
- `id` (Primary Key, UUID)
- `course_id` (Foreign Key -> `courses.course_id`)
- `checklist_id` (Foreign Key -> `checklist_master.checklist_id`)
- `status` (Enum: 'PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED')
- `remarks` (Text - for Faculty to add notes, or Admin to add rejection reasons)
- `submission_date` (Timestamp)
- `last_updated` (Timestamp)

*(Constraint: `course_id` + `checklist_id` must be Unique)*

### 5. `submissions`
Tracks the individual files uploaded for a specific checklist item within a course.
- `submission_id` (Primary Key, UUID)
- `course_checklist_id` (Foreign Key -> `course_checklist_status.id`)
- `file_url` (String - S3 or Supabase Cloud Storage URL)
- `file_name` (String - Original file name uploaded)
- `uploaded_at` (Timestamp)


## Step 2: API Structure

We will use a RESTful approach via **Node.js + Express**.

### Authentication APIs
- `POST /api/auth/login` - Authenticate user and return JWT
- `GET /api/auth/me` - Get current user profile

### Faculty APIs (Role restricted to 'FACULTY')
- `GET /api/faculty/courses` - List courses assigned to logged-in faculty (with overall completion %)
- `GET /api/faculty/courses/:course_id` - Detailed course view + its checklist items and current statuses
- `POST /api/faculty/courses/:course_id/checklist/:checklist_id/upload` - Upload a single or multiple files (Multipart/form-data)
- `DELETE /api/faculty/submissions/:submission_id` - Delete an uploaded file (if not yet approved)
- `PATCH /api/faculty/courses/:course_id/checklist/:checklist_id` - Update remarks and change status to 'SUBMITTED'

### Admin APIs (Role restricted to 'ADMIN')
- `GET /api/admin/dashboard` - Analytics: total courses, overall compliance rate, pending review count
- `GET /api/admin/courses` - View all courses across semesters + filtering
- `GET /api/admin/courses/:course_id` - View a specific course's submission details and files
- `PATCH /api/admin/checklist-status/:id` - Approve or Reject a submitted checklist item
- `GET /api/admin/courses/:course_id/download-all` - Triggers a zip compilation of all approved/submitted files for a course
- `GET /api/admin/reports/export` - Export course compliances to CSV/Excel


## Step 3: Frontend Pages (React + Tailwind)

### Common
- **/login**: Central login portal distinguishing between admin and faculty based on credentials.

### Faculty Portal
- **/faculty/dashboard**: Displays cards for each assigned course, showing a quick summary and a progress bar (e.g., 60% Complete).
- **/faculty/courses/:id**: The Course Compliance Interface. 
  - Sectioned out by Categories (Course Planning, OBE, Assessment, etc.).
  - Shows color-coded status pills: <span style="color: gray">Pending</span>, <span style="color: blue">Submitted</span>, <span style="color: green">Approved</span>, <span style="color: red">Rejected</span>.
  - Clicking on a checklist item opens a right-side drawer or modal:
    - Lists current uploaded files
    - Drag & drop file upload 
    - Textarea for remarks
    - "Mark as Submitted" button

### Admin Portal
- **/admin/dashboard**: High-level analytics dashboard, outstanding approvals, top non-compliant courses.
- **/admin/courses**: Data table mapping out every course. Filters for Faculty Name, Semester, and general status.
- **/admin/courses/:id**: 
  - Similar UI to Faculty, but specialized for reviewing. 
  - Clicking an item allows the Admin to view remarks, open/download files, and click "Approve" or "Reject".
- **/admin/reports**: Page detailing bulk export rules to generate CSV/Excel status sheets of overall compliance metrics.


## Step 4: Folder Structure

We'll structure this as a monorepo workspace for logical grouping.

```text
course-compliance-system/
├── client/                 # React + Vite + Tailwind Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/         # Images, global styles
│   │   ├── components/     # Reusable UI (Buttons, Modals, StatusBadges, ProgressBars)
│   │   ├── contexts/       # React Context (Auth Context)
│   │   ├── hooks/          # Custom hooks for fetching data
│   │   ├── layouts/        # AdminLayout with Sidebar, FacultyLayout
│   │   ├── pages/          # Admin and Faculty page components
│   │   ├── services/       # Axios API integration endpoints
│   │   └── utils/          # Formatting tools, permissions mapping
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node + Express Backend
│   ├── src/
│   │   ├── config/         # Postgres connection setup, Environment variables
│   │   ├── controllers/    # Request handling per route
│   │   ├── middlewares/    # JWT Auth verification, Role Checking, File Upload handlers
│   │   ├── models/         # Database models / queries
│   │   ├── routes/         # Express Router definitions
│   │   ├── services/       # Cloud Storage integrations, business logic
│   │   └── utils/          # Error handling frameworks
│   ├── .env
│   ├── package.json
│   └── server.js
└── README.md
```

## Open Questions

1. **Upload Method**: The prompt mentioned Supabase or AWS S3. Do you have a preference? (Supabase is generally faster to step up for a prototype if you plan on using Supabase Postgres).
2. **Database ORM**: I plan to use **Prisma ORM** as it maps beautifully to PostgreSQL and provides excellent type-safety for Node. Are you comfortable with this choice?
