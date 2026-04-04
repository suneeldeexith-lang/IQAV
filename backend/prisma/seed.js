const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── 1. Admin ──────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('ibs123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'iqac@ibsindia.org' },
    update: {},
    create: {
      name: 'IQAC Admin',
      email: 'iqac@ibsindia.org',
      password_hash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`Admin: ${admin.email}`);

  // ── 2. Faculty ────────────────────────────────────────────
  const facultyPassword = await bcrypt.hash('ibs123', 10);

  const facultyList = [
    { name: 'Dr Saisree M',            email: 'saisree.mangu@ibsindia.org' },
    { name: 'Dr Rajani Kumari',         email: 'rajani.kumari@ibsindia.org' },
    { name: 'Prof Susheela G',          email: 'susheela.girisaballa@ibsindia.org' },
    { name: 'Dr Roshny U',              email: 'roshny.unnikrishnan@ifheindia.org' },
    { name: 'Dr Geetha Sharma',         email: 'geethasharma@ibsindia.org' },
    { name: 'Prof Soni Karekar',        email: 'soni.karekar@ibsindia.org' },
    { name: 'Prof Radhika Ramesh',      email: 'radhika@ibsindia.org' },
    { name: 'Prof Chetana Krishna',     email: 'chethana.krishna@ibsindia.org' },
    { name: 'Dr Poornima Joshi',        email: 'poornima.joshi@ibsindia.org' },
    { name: 'Dr Navya J Muricken',      email: 'navya.muricken@ibsindia.org' },
    { name: 'Dr Sharon K Jose',         email: 'skjose@ibsindia.org' },
    { name: 'Prof Yadhu Harikumar',     email: 'yadhu.harikumar@ibsindia.org' },
    { name: 'Prof Surjyabrat Buragohain', email: 'surjyabrat@ibsindia.org' },
    { name: 'Dr Niharikha Singh',       email: 'niharika.singh@ibsindia.org' },
    { name: 'Dr R Seethalakshmi',       email: 'seethalakshmi.r@ibsindia.org' },
    { name: 'Dr Reema Mohanthy',        email: 'reema.arunkumarmohanty@ibsindia.org' },
    { name: 'Dr Vishal Sharma',         email: 'vishal.sharma@ibsindia.org' },
    { name: 'Dr G Vanishree',           email: 'vanishree.gaddi@ibsindia.org' },
    { name: 'Dr Kavita Srivastava',     email: 'kavita.srivastava@ibsindia.org' },
    { name: 'Dr Vinay Joshi',           email: 'vinay.joshi@ibsindia.org' },
    { name: 'Dr Hemant Gupta',          email: 'hemant.gupta@ibsindia.org' },
    { name: 'Dr Shafiulla B',           email: 'shafiulla@ibsindia.org' },
    { name: 'Prof Hariharan V',         email: 'vhariharan123@gmail.com' },
    { name: 'Dr Clement Sudhakar',      email: 'clemnsud@gmail.com' },
    { name: 'Dr Vidhayshree',           email: 'vidhyashree.v@ibsindia.org' },
    { name: 'Prof LRS Mani',            email: 'lrsmani@gmail.com' },
    { name: 'Dr Ramesh M',              email: 'ramesh.murthy@ibsindia.org' },
    { name: 'Prof Leena Sidenur',       email: 'leenas@ibsindia.org' },
    { name: 'Dr Veena Bhat',            email: 'veena.h.bhat@gmail.com' },
    { name: 'Prof Raghavendra Rao',     email: 'raogn1975@gmail.com' },
    { name: 'Dr Khalid Ul Islam',       email: 'khalid.islam@ibsindia.org' },
    { name: 'Dr KG Sofi Dinesh',        email: 'sofi.dinesh@ibsindia.org' },
    { name: 'Prof Venkatesh G',         email: 'venkatesh.ganapathy@ibsindia.org' },
    { name: 'Dr V Rajesh Kumar',        email: 'vrajesh.kumar@ibsindia.org' },
    { name: 'Prof Nagaraj P',           email: 'nagkrish@yahoo.com' },
    { name: 'Dr GP Girish',             email: 'gpgirish@ibsindia.org' },
    { name: 'Dr Sandhya S',             email: 'sandhya.soundararajan@gmail.com' },
    { name: 'Prof Harisankar M',        email: 'harisankar.muralidharan@ibsindia.org' },
    { name: 'Prof Anupa Chatterjee',    email: 'anupaghosh72@gmail.com' },
    { name: 'Prof Kiran BK',            email: 'bkkiranshetty@gmail.com' },
    { name: 'Prof Suruchi M',           email: 'suruchimahajan10@gmail.com' },
    { name: 'Dr Ashok Anand',           email: 'ashokanand@gmail.com' },
    { name: 'Prof Chandra Kumar',       email: 'chandrakrishna1@gmail.com' },
    { name: 'Prof Gopal Mondal',        email: 'gopal.mondal@ideck.in' },
    { name: 'Prof Soujanya GK',         email: 'soujanyagk@gmail.com' },
    { name: 'Dr Sudindra VR',           email: 'sudindra.vr@ibsindia.org' },
    { name: 'Prof Mahabala Shetty',     email: 'mshetty.m123@gmail.com' },
    { name: 'Prof Sunil Pillai',        email: 'sunil.pillai@ibsindia.org' },
    { name: 'Prof Sumanjit Dass',       email: 'sumanjeet_dass@yahoo.com' },
    { name: 'Prof PK Chandrashekhar',   email: 'chandrashekar.pk@ibsindia.org' },
    { name: 'Dr Bharathi S Gopal',      email: 'bharathi.gopal@ibsindia.org' },
    { name: 'Dr Shweta Puneet',         email: 'shweta@ibsindia.org' },
    { name: 'Dr R Harish',              email: 'harish@ibsindia.org' },
    { name: 'Prof Sujit Kumar',         email: 'sujit.iitr@gmail.com' },
    { name: 'Dr P Vittala',             email: 'pundareeka.vittala@ibsindia.org' },
    { name: 'Prof Kiran Kumar KV',      email: 'kiranvisiting@gmail.com' },
    { name: 'Prof R Srinivasan',        email: 'srinivasan.r@ibsindia.org' },
    { name: 'Prof Ravindra Menon',      email: 'ravi_menon24@yahoo.co.in' },
  ];

  const facultyMap = [];
  for (const f of facultyList) {
    const user = await prisma.user.upsert({
      where: { email: f.email },
      update: {},
      create: {
        name: f.name,
        email: f.email,
        password_hash: facultyPassword,
        role: 'FACULTY',
      },
    });
    facultyMap.push(user);
  }
  console.log(`Faculty created/verified: ${facultyMap.length}`);

  // ── 3. ChecklistMaster (findFirst + create — avoids broken UUID hack) ──
  const masterItems = [
    { name: 'Faculty Time Table',       category: 'COURSE_PLANNING',   req: true  },
    { name: 'Student List',             category: 'COURSE_PLANNING',   req: true  },
    { name: 'Approved Syllabus',        category: 'COURSE_PLANNING',   req: true  },
    { name: 'Teaching Plan',            category: 'TEACHING_LEARNING', req: true  },
    { name: 'Previous CO-PO Mapping',   category: 'OBE',               req: true  },
    { name: 'Current CO-PO Mapping',    category: 'OBE',               req: true  },
    { name: 'CO Attainment',            category: 'OBE',               req: true  },
    { name: 'Gap Analysis',             category: 'OBE',               req: false },
    { name: 'Course Material',          category: 'TEACHING_LEARNING', req: true  },
    { name: 'ICT Tools',                category: 'TEACHING_LEARNING', req: false },
    { name: 'Beyond Syllabus',          category: 'TEACHING_LEARNING', req: false },
    { name: 'Attendance Record',        category: 'ASSESSMENT',        req: true  },
    { name: 'Slow Learner Record',      category: 'ASSESSMENT',        req: true  },
    { name: 'NCP 1',                    category: 'ASSESSMENT',        req: true  },
    { name: 'NCP 2',                    category: 'ASSESSMENT',        req: true  },
    { name: 'Project / Assignment',     category: 'ASSESSMENT',        req: true  },
    { name: 'End Semester Paper',       category: 'ASSESSMENT',        req: true  },
    { name: 'Mid Feedback',             category: 'FEEDBACK',          req: true  },
    { name: 'End Feedback',             category: 'FEEDBACK',          req: true  },
    { name: 'Course Committee Minutes', category: 'FEEDBACK',          req: true  },
  ];

  const checklistCache = [];
  for (const item of masterItems) {
    let existing = await prisma.checklistMaster.findFirst({
      where: { checklist_item_name: item.name },
    });
    if (!existing) {
      existing = await prisma.checklistMaster.create({
        data: {
          checklist_item_name: item.name,
          category: item.category,
          required_flag: item.req,
        },
      });
    }
    checklistCache.push(existing);
  }
  console.log(`ChecklistMaster items: ${checklistCache.length}`);

  // ── 4. Courses + CourseChecklist ──────────────────────────
  const subjectList = [
    'Business Impact Analysis',
    'Financial Management II',
    'Marketing Management II',
    'Human Resource Management',
    'Operations Management',
    'Business Analytics II',
    'Managerial Economics & Business Environment',
    'Business Communication',
  ];
  const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  let newCourses = 0;
  let courseSlot = 0;
  for (let i = 0; i < subjectList.length; i++) {
    for (const sec of sections) {
      const courseCode = `C${i}-${sec}`;
      // Round-robin so every faculty gets at least one course
      const faculty = facultyMap[courseSlot % facultyMap.length];
      courseSlot++;

      let course = await prisma.course.findFirst({ where: { course_code: courseCode } });

      if (!course) {
        course = await prisma.course.create({
          data: {
            course_code: courseCode,
            course_name: subjectList[i],
            semester: 'Sem II',
            section: sec,
            faculty_id: faculty.user_id,
            completion_percentage: 0.0,
          },
        });

        // Create 20 checklist status records for this course
        for (const master of checklistCache) {
          await prisma.courseChecklist.create({
            data: {
              course_id: course.course_id,
              checklist_id: master.checklist_id,
              status: 'PENDING',
            },
          });
        }
        newCourses++;
      }
    }
  }
  console.log(`New courses seeded: ${newCourses}`);

  // ── 5. Validation summary ─────────────────────────────────
  const [totalUsers, totalCourses, totalMasters, totalChecklist] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.checklistMaster.count(),
    prisma.courseChecklist.count(),
  ]);

  console.log('\n===== Seed Summary =====');
  console.log(`Users            : ${totalUsers}  (expect >= 58)`);
  console.log(`Courses          : ${totalCourses}  (expect 56)`);
  console.log(`ChecklistMaster  : ${totalMasters}  (expect 20)`);
  console.log(`CourseChecklist  : ${totalChecklist}  (expect ${totalCourses * 20})`);
  console.log('========================\n');
}

main()
  .catch((e) => {
    console.error('SEED FAILED:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
