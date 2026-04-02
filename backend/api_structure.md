# Backend API Structure & Logic Outline

Here is the proposed API structure, including how we will handle your newly requested features in Express + Prisma.

## Middlewares Needed
1. `authenticate`: Verifies JWT token and attaches `req.user`.
2. `requireRole(role)`: Validates if `req.user.role` matches the route requirement.
3. `upload`: Multer middleware to stream files to Supabase Storage buffer.
4. `checkLock`: Specific middleware for faculty uploads to query if the item is already `APPROVED`.

---

## 1. Auth Routes (`/api/auth`)
- `POST /login` - Accepts email & password. Returns JWT and user info.
- `GET /me` - Validates JWT & returns user profile.

---

## 2. Admin Routes (`/api/admin`) - Requires `ADMIN` Role

**Dashboard & Overviews**
- `GET /dashboard` 
  - Retrieves high-level metrics.
  - **New Requirement (Notification Flag):** Includes a query to count `status === 'SUBMITTED'` across all `CourseChecklist` items to populate an admin unread/pending flag.

**Course Interactions**
- `GET /courses` - Fetches all courses. Includes pre-calculated `completion_percentage`.
- `GET /courses/:course_id` - Fetches specific course, all its checklist statuses, and nested submission files.

**Checklist Approvals**
- `PATCH /checklist/:id/status` 
  - **Body:** `{ status: 'APPROVED' | 'REJECTED', remarks: '...' }`
  - **Logic:** Updates the status. 
  - **Triggers:** 
    1. Creates `ActivityLog` entry (e.g. `action: 'APPROVED_CHECKLIST', user: Admin_ID`).
    2. Recalculates `completion_percentage` for the parent Course.

**Downloads**
- `GET /courses/:course_id/download-zip` 
  - **New Requirement (Bulk Download):**
  - Fetches all `submissions` associated with `course_id` where parent status might be `APPROVED` or `SUBMITTED`.
  - Streams files from Supabase Storage and pipes them into `archiver` standard npm package, sending a zip buffer back to the client.

---

## 3. Faculty Routes (`/api/faculty`) - Requires `FACULTY` Role

**Course Access**
- `GET /courses` - Fetches the faculty's assigned courses.
- `GET /courses/:course_id` - Fetches populated checklist so they know what to upload.

**Submissions & Processing**
- `POST /courses/:course_id/checklist/:checklist_id/upload` 
  - **Logic:**
    1. Check lock: If checklist `status === 'APPROVED'`, return `403 Forbidden` (Faculty Submission Lock).
    2. Upload file stream to Supabase Storage bucket.
    3. Save URL to `submissions` table.
    4. Create `ActivityLog` (e.g. `action: 'UPLOAD_FILE', user: Faculty_ID`).

- `DELETE /submissions/:submission_id`
  - Remove file from Supabase and delete DB row. Also locked if `APPROVED`.

- `PATCH /courses/:course_id/checklist/:checklist_id/submit`
  - **Body:** `{ remarks: 'Optional notes' }`
  - **Logic:** Updates status to `SUBMITTED`. Creates `ActivityLog`.
  
---

## Helper Functions

### Course Completion Calculation Hook
To be called after Admin Approvals (or optionally when Faculty submit, depending on business rule).
```typescript
async function recalculateCourseCompletion(course_id: string): Promise<void> {
  const totalRequired = await prisma.checklistMaster.count({ where: { required_flag: true } });
  
  // Assuming 'completion' means the admin gave it the thumbs up. 
  // If it should track faculty progress, check for 'SUBMITTED' or 'APPROVED'
  const completedItems = await prisma.courseChecklist.count({
    where: {
      course_id: course_id,
      status: 'APPROVED', 
      checklist_item: { required_flag: true }
    }
  });

  const percentage = totalRequired > 0 ? (completedItems / totalRequired) * 100 : 0;

  await prisma.course.update({
    where: { course_id },
    data: { completion_percentage: parseFloat(percentage.toFixed(2)) }
  });
}
```
