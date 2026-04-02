# Backend Verification & Initialization Guide

Follow this systematic guide to bring your local backend online, connect it to your cloud services, and rigorously test each milestone. 

> [!IMPORTANT]
> Ensure you have an active [Supabase](https://supabase.com/) account. You will need a new project to get your PostgreSQL and Storage keys.

---

## 1. Setup & Connection Instructions

### Step 1: Connect Supabase Database & Storage
1. Log into your Supabase Dashboard and create a new project.
2. Navigate to **Project Settings -> Database** to find your Connection Strings.
3. Enable **Connection Pooling**, copy the pooled URL for `DATABASE_URL` and the direct URL for `DIRECT_URL`.
4. Navigate to **Project Settings -> API** to get your `SUPABASE_PROJECT_URL` and `SUPABASE_API_KEY` (use the `anon` public or `service_role` key).
5. Navigate to **Storage** in Supabase and create a new public bucket named `course-compliance-bucket`. Set the bucket to Public so uploads work correctly.
6. Open your `backend/.env` file and paste the specific variables over the `.env.example` placeholders.

### Step 2: Push Prisma Schema
To sync your cloud PostgreSQL database with our local Prisma structure:
1. Open your terminal inside the `backend/` directory.
2. Run: 
   ```bash
   npx prisma db push
   ```
3. Prisma will connect to Supabase, create the unified `Users`, `Courses`, `CourseChecklist`, and `ActivityLogs` tables exactly how we mapped them out.

### Step 3: Run Seed Script
Populate your freshly created database with our mock administrative and testing data.
1. Run:
   ```bash
   node prisma/seed.js
   ```
2. You should see logs confirming standard accounts (`admin@school.edu` & `faculty@school.edu`), 12 Checklist Master Items, and the `MGT101` course have been created.

### Step 4: Start Backend Server
Boot up the local node server.
1. Run:
   ```bash
   node server.js
   ```
2. You should see: `Server is running on port 5000`. Keep this terminal window open.

---

## 2. Testing Checklist (Validation Workflow)

Use **Postman**, **Insomnia**, or the raw cURL scripts from `api_testing_guide.md` to run through this workflow sequentially. Keep track of your progress by checking off these boxes:

- [ ] **1. API Health Check**  
  Send `GET http://localhost:5000/health`.  
  *Expected:* `{ "status": "OK", "message": "API is running" }`

- [ ] **2. Authenticate Faculty**  
  Send `POST http://localhost:5000/api/auth/login` (Body: `email: faculty@school.edu`, `password: faculty123`).  
  *Expected:* Returns a JWT token and Role `FACULTY`. Copy the `token`.

- [ ] **3. Fetch Assigned Courses & Checklists**  
  Send `GET http://localhost:5000/api/faculty/courses` using `Authorization: Bearer <token>`.  
  *Expected:* See `MGT101` in the response array.  
  Fetch internal checklist: `GET http://localhost:5000/api/faculty/courses/<COURSE_ID>`. Grab a master `checklist_id` (e.g., Teaching Plan).

- [ ] **4. Upload Checklist File**  
  Send `POST http://localhost:5000/api/faculty/courses/<COURSE_ID>/checklist/<CHECKLIST_ID>/upload` via Multipart form. Attach a dummy PDF to `files`.  
  *Expected:* Response indicating success. Validate by checking Supabase Storage Bucket -> ensuring file appeared.

- [ ] **5. Submit Checklist for Review**  
  Send `PATCH http://localhost:5000/api/faculty/courses/<COURSE_ID>/checklist/<CHECKLIST_ID>/submit` (Body: `{ "remarks": "Check it out" }`).  
  *Expected:* DB record transforms status from `PENDING` -> `SUBMITTED`.

- [ ] **6. Authenticate Admin**  
  Send `POST http://localhost:5000/api/auth/login` (Body: `email: admin@school.edu`, `password: admin123`). Copy Admin standard token.

- [ ] **7. Admin Approve Checklist**  
  Find the new *check_list_status ID* belonging to that submission payload.  
  Send `PATCH http://localhost:5000/api/admin/checklist/<CHECKLIST_STATUS_ID>/status` (Body: `{ "status": "APPROVED", "remarks": "Looks good" }`).  
  *Expected:* Item Locked. Faculty will now get a 403 Forbidden error if they try to edit this item again.

- [ ] **8. Test Bulk ZIP Download**  
  Send `GET http://localhost:5000/api/admin/courses/<COURSE_ID>/download-zip`.  
  *Expected:* A ZIP payload returns cleanly formatted to your browser/Postman local files.

---

## 3. Operations & Troubleshooting Guide

If the workflow above fails, check these common pitfalls globally associated with the architecture setup:

**Error: "PrismaClientInitializationError: Error querying the database"**
* **Cause**: Invalid connection bounds in Supabase strings.
* **Fix**: Ensure `DATABASE_URL` ends with `?pgbouncer=true` if using the pool, and `DIRECT_URL` uses port `5432` without pgbouncer. Also ensure your IP address isn't being restricted in Supabase Settings if IPv4 strictness is toggled.

**Error: "Supabase upload failed: insert or update on table violates foreign key constraint"` / File does not appear in storage**
* **Cause**: Your `SUPABASE_API_KEY` lacks upload authority or bucket RLS policy blocks it.
* **Fix**: Provide the `service_role` key inside `.env` if bypassing RLS entirely, OR ensure your `course-compliance-bucket` Storage bucket has global public SELECT/INSERT configurations setup via the Supabase Dashboard. 

**Error: 401 Unauthorized / Invalid Token**
* **Cause**: Token format mismatch.
* **Fix**: Ensure your Headers look exactly like: `Authorization: Bearer my_long_token_string...`. Do not omit the word `Bearer `.

**Error: "Failed to upload: Cannot read properties of undefined (reading 'buffer')"**
* **Cause**: Multer route middleware didn't catch the file.
* **Fix**: Ensure your Postman/Insomnia multipart/form-data field name is `files` not `file`, as our route demands: `upload.array('files', 5)`.

**Error: Zip Download Corrupted**
* **Cause**: Supabase buffer mismatch on memory storage download pipeline.
* **Fix**: Ensure the files being requested aren't empty (0kb payload) or private inside the Supabase Storage bounds causing the fetch request to pipe an HTML 404 response into the archiver buffer. (Making the bucket public solves this).
