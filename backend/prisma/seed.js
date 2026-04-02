const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Clean existing records (Optional, uncomment if you want a fresh start every time)
  // await prisma.activityLog.deleteMany();
  // await prisma.submission.deleteMany();
  // await prisma.courseChecklist.deleteMany();
  // await prisma.checklistMaster.deleteMany();
  // await prisma.course.deleteMany();
  // await prisma.user.deleteMany();

  // 2. Hash Passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const facultyPassword = await bcrypt.hash('faculty123', 10);

  // 3. Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@school.edu' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@school.edu',
      password_hash: adminPassword,
      role: 'ADMIN'
    }
  });

  const faculty = await prisma.user.upsert({
    where: { email: 'faculty@school.edu' },
    update: {},
    create: {
      name: 'Dr. Jane Smith',
      email: 'faculty@school.edu',
      password_hash: facultyPassword,
      role: 'FACULTY'
    }
  });

  console.log(`Created Users: Admin(${admin.email}) | Faculty(${faculty.email})`);

  // 4. Populate Checklist Master Data
  const masterItems = [
    { name: 'Faculty Time Table', category: 'COURSE_PLANNING', required: true },
    { name: 'Student List', category: 'COURSE_PLANNING', required: true },
    { name: 'Approved Syllabus', category: 'COURSE_PLANNING', required: true },
    { name: 'Teaching Plan', category: 'TEACHING_LEARNING', required: true },
    { name: 'CO-PO Mapping', category: 'OBE', required: true },
    { name: 'CO Attainment', category: 'OBE', required: true },
    { name: 'Gap Analysis', category: 'OBE', required: false },
    { name: 'Course Material', category: 'TEACHING_LEARNING', required: true },
    { name: 'ICT Tools', category: 'TEACHING_LEARNING', required: false },
    { name: 'Attendance Record', category: 'ASSESSMENT', required: true },
    { name: 'Assignments', category: 'ASSESSMENT', required: true },
    { name: 'Feedback Reports', category: 'FEEDBACK', required: true }
  ];

  for (const item of masterItems) {
    const existing = await prisma.checklistMaster.findFirst({
      where: { checklist_item_name: item.name }
    });

    if (!existing) {
      await prisma.checklistMaster.create({
        data: {
          checklist_item_name: item.name,
          category: item.category,
          required_flag: item.required
        }
      });
    }
  }
  console.log("Checklist Master Items populated.");

  // 5. Create Sample Courses
  const course = await prisma.course.findFirst({ where: { course_code: 'MGT101' } });
  
  if (!course) {
    await prisma.course.create({
      data: {
        course_code: 'MGT101',
        course_name: 'Introduction to Management',
        semester: 'Fall 2026',
        section: 'A1',
        faculty_id: faculty.user_id,
        completion_percentage: 0.0
      }
    });
    console.log("Sample Course 'MGT101' created for Dr. Jane Smith.");
  } else {
    console.log("Sample Course already exists.");
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
