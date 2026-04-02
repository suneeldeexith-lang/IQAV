# API Testing Guide & Schema Commands

This guide provides the cURL commands and necessary workflows to test your implementation.

## Prisma & Supabase Schema Pushing

Before starting the server, make sure your `.env` contains the Supabase connection strings, then run:

\`\`\`bash
# 1. Push schema directly to Supabase via Prisma 
npx prisma db push

# 2. Alternatively, generate SQL migrations securely:
npx prisma migrate dev --name init

# 3. Seed the sample database (Admin, Faculty, Master Data, Course)
node prisma/seed.js

# 4. Start your Express Web Server
node server.js
\`\`\`

*(Your server should now be running locally on http://localhost:5000)*

---

## Testing API Flow (cURL Examples)

> **Note:** For Windows Command Prompt, replace single quotes `\'` with double quotes `\"` and escape inner double quotes. For Unix/Git Bash/Powershell, these commands work perfectly. Substitute `{YOUR_TOKEN}` and `{IDS}` naturally.

### 1. Login (Acquire JWT)

**Admin Log In:**
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/login \
-H 'Content-Type: application/json' \
-d '{"email":"admin@school.edu", "password":"admin123"}'
\`\`\`

**Faculty Log In:**
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/login \
-H 'Content-Type: application/json' \
-d '{"email":"faculty@school.edu", "password":"faculty123"}'
\`\`\`

*(Copy the `token` from the JSON response for the next steps).*

---

### 2. Get Faculty Courses (Faculty View)

To see the `MGT101` course assigned to Dr. Jane Smith via our seed file:

\`\`\`bash
curl -X GET http://localhost:5000/api/faculty/courses \
-H 'Authorization: Bearer {FACULTY_TOKEN}'
\`\`\`
*(Grab the `course_id` from the resulting list).*

Get inner checklist requirements:
\`\`\`bash
curl -X GET http://localhost:5000/api/faculty/courses/{COURSE_ID} \
-H 'Authorization: Bearer {FACULTY_TOKEN}'
\`\`\`
*(Grab one `checklist_id` from the `masterChecklist` array returned).*

---

### 3. Faculty Upload Checklist File

Ensure you have a sample file called `test.pdf` in your directory.

\`\`\`bash
curl -X POST http://localhost:5000/api/faculty/courses/{COURSE_ID}/checklist/{CHECKLIST_ID}/upload \
-H 'Authorization: Bearer {FACULTY_TOKEN}' \
-F "files=@test.pdf"
\`\`\`

---

### 4. Faculty Submit Checklist Item

Submit the actual section to the Admin with optional remarks.

\`\`\`bash
curl -X PATCH http://localhost:5000/api/faculty/courses/{COURSE_ID}/checklist/{CHECKLIST_ID}/submit \
-H 'Authorization: Bearer {FACULTY_TOKEN}' \
-H 'Content-Type: application/json' \
-d '{"remarks": "Uploaded the verified teaching timetable."}'
\`\`\`

---

### 5. Admin Approve Checklist

After the faculty has uploaded and submitted an item, the admin reviews it. First get the `course_checklist_status` ID (`courseChecklist.id`):

\`\`\`bash
# List all pending reviews
curl -X GET http://localhost:5000/api/admin/courses/{COURSE_ID} \
-H 'Authorization: Bearer {ADMIN_TOKEN}'
\`\`\`

*(Find the nested `status_record` that matches the submission, retrieve its `id`)*

\`\`\`bash
curl -X PATCH http://localhost:5000/api/admin/checklist/{CHECKLIST_STATUS_ID}/status \
-H 'Authorization: Bearer {ADMIN_TOKEN}' \
-H 'Content-Type: application/json' \
-d '{"status":"APPROVED", "remarks":"Looks accurate, well done."}'
\`\`\`

*(Once approved, Faculty attempting Step 3 or 4 will receive a `403 Forbidden Lock` Error, and the completion calculations run automatically!)*

---

### 6. Admin Download Zipped Course Files

\`\`\`bash
# Output defaults to a file using the -o / --output option
curl -X GET http://localhost:5000/api/admin/courses/{COURSE_ID}/download-zip \
-H 'Authorization: Bearer {ADMIN_TOKEN}' \
-o output_mgt101_files.zip
\`\`\`
