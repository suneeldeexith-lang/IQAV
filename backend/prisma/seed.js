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
    create: { name: 'IQAC Admin', email: 'iqac@ibsindia.org', password_hash: adminPassword, role: 'ADMIN' },
  });
  console.log(`Admin: ${admin.email}`);

  // ── 2. All Users (Faculty + Coordinators share same accounts) ──
  const userPassword = await bcrypt.hash('ibs123', 10);

  // Coordinator emails (these users get COORDINATOR role)
  const coordinatorEmails = new Set([
    'saisree.mangu@ibsindia.org',
    'radhika@ibsindia.org',
    'skjose@ibsindia.org',
    'niharika.singh@ibsindia.org',
    'vanishree.gaddi@ibsindia.org',
    'hemant.gupta@ibsindia.org',
    'ramesh.murthy@ibsindia.org',
    'susheela.girisaballa@ibsindia.org',
    'khalid.islam@ibsindia.org',
    'sofi.dinesh@ibsindia.org',
    'vrajesh.kumar@ibsindia.org',
    'nagkrish@yahoo.com',
    'gpgirish@ibsindia.org',
    'shafiulla@ibsindia.org',
    'sandhya.soundararajan@gmail.com',
    'harisankar.muralidharan@ibsindia.org',
    'anupaghosh72@gmail.com',
    'bkkiranshetty@gmail.com',
    'sudindra.vr@ibsindia.org',
    'chandrashekar.pk@ibsindia.org',
    'clemnsud@gmail.com',
    'poornima.joshi@ibsindia.org',
    'shweta@ibsindia.org',
    'sunil.pillai@ibsindia.org',
    'harish@ibsindia.org',
    'vidhyashree.v@ibsindia.org',
    'sujit.iitr@gmail.com',
    'pundareeka.vittala@ibsindia.org',
    'navya.muricken@ibsindia.org',
    'yadhu.harikumar@ibsindia.org',
    'kiranvisiting@gmail.com',
    'venkatesh.ganapathy@ibsindia.org',
    'reema.arunkumarmohanty@ibsindia.org',
    'leenas@ibsindia.org',
    'srinivasan.r@ibsindia.org',
    'ravi_menon24@yahoo.co.in',
    'surjyabrat@ibsindia.org',
    'seethalakshmi.r@ibsindia.org',
  ]);

  const allUsers = [
    { name: 'Dr Saisree M',               email: 'saisree.mangu@ibsindia.org' },
    { name: 'Dr Rajani Kumari',           email: 'rajani.kumari@ibsindia.org' },
    { name: 'Prof Susheela G',            email: 'susheela.girisaballa@ibsindia.org' },
    { name: 'Dr Roshny U',                email: 'roshny.unnikrishnan@ifheindia.org' },
    { name: 'Dr Geetha Sharma',           email: 'geethasharma@ibsindia.org' },
    { name: 'Prof Soni Karekar',          email: 'soni.karekar@ibsindia.org' },
    { name: 'Prof Radhika Ramesh',        email: 'radhika@ibsindia.org' },
    { name: 'Prof Chetana Krishna',       email: 'chethana.krishna@ibsindia.org' },
    { name: 'Dr Poornima Joshi',          email: 'poornima.joshi@ibsindia.org' },
    { name: 'Dr Navya J Muricken',        email: 'navya.muricken@ibsindia.org' },
    { name: 'Dr Sharon K Jose',           email: 'skjose@ibsindia.org' },
    { name: 'Prof Yadhu Harikumar',       email: 'yadhu.harikumar@ibsindia.org' },
    { name: 'Prof Surjyabrat Buragohain', email: 'surjyabrat@ibsindia.org' },
    { name: 'Dr Niharikha Singh',         email: 'niharika.singh@ibsindia.org' },
    { name: 'Dr R Seethalakshmi',         email: 'seethalakshmi.r@ibsindia.org' },
    { name: 'Dr Reema Mohanthy',          email: 'reema.arunkumarmohanty@ibsindia.org' },
    { name: 'Dr Vishal Sharma',           email: 'vishal.sharma@ibsindia.org' },
    { name: 'Dr G Vanishree',             email: 'vanishree.gaddi@ibsindia.org' },
    { name: 'Dr Kavita Srivastava',       email: 'kavita.srivastava@ibsindia.org' },
    { name: 'Dr Vinay Joshi',             email: 'vinay.joshi@ibsindia.org' },
    { name: 'Dr Hemant Gupta',            email: 'hemant.gupta@ibsindia.org' },
    { name: 'Dr Shafiulla B',             email: 'shafiulla@ibsindia.org' },
    { name: 'Prof Hariharan V',           email: 'vhariharan123@gmail.com' },
    { name: 'Dr Clement Sudhakar',        email: 'clemnsud@gmail.com' },
    { name: 'Dr Vidhayshree',             email: 'vidhyashree.v@ibsindia.org' },
    { name: 'Prof LRS Mani',              email: 'lrsmani@gmail.com' },
    { name: 'Dr Ramesh M',                email: 'ramesh.murthy@ibsindia.org' },
    { name: 'Prof Leena Sidenur',         email: 'leenas@ibsindia.org' },
    { name: 'Dr Veena Bhat',              email: 'veena.h.bhat@gmail.com' },
    { name: 'Prof Raghavendra Rao',       email: 'raogn1975@gmail.com' },
    { name: 'Dr Khalid Ul Islam',         email: 'khalid.islam@ibsindia.org' },
    { name: 'Dr KG Sofi Dinesh',          email: 'sofi.dinesh@ibsindia.org' },
    { name: 'Prof Venkatesh G',           email: 'venkatesh.ganapathy@ibsindia.org' },
    { name: 'Dr V Rajesh Kumar',          email: 'vrajesh.kumar@ibsindia.org' },
    { name: 'Prof Nagaraj P',             email: 'nagkrish@yahoo.com' },
    { name: 'Dr GP Girish',               email: 'gpgirish@ibsindia.org' },
    { name: 'Dr Sandhya S',               email: 'sandhya.soundararajan@gmail.com' },
    { name: 'Prof Harisankar M',          email: 'harisankar.muralidharan@ibsindia.org' },
    { name: 'Prof Anupa Chatterjee',      email: 'anupaghosh72@gmail.com' },
    { name: 'Prof Kiran BK',              email: 'bkkiranshetty@gmail.com' },
    { name: 'Prof Suruchi M',             email: 'suruchimahajan10@gmail.com' },
    { name: 'Dr Ashok Anand',             email: 'ashokanand@gmail.com' },
    { name: 'Prof Chandra Kumar',         email: 'chandrakrishna1@gmail.com' },
    { name: 'Prof Gopal Mondal',          email: 'gopal.mondal@ideck.in' },
    { name: 'Prof Soujanya GK',           email: 'soujanyagk@gmail.com' },
    { name: 'Dr Sudindra VR',             email: 'sudindra.vr@ibsindia.org' },
    { name: 'Prof Mahabala Shetty',       email: 'mshetty.m123@gmail.com' },
    { name: 'Prof Sunil Pillai',          email: 'sunil.pillai@ibsindia.org' },
    { name: 'Prof Sumanjit Dass',         email: 'sumanjeet_dass@yahoo.com' },
    { name: 'Prof PK Chandrashekhar',     email: 'chandrashekar.pk@ibsindia.org' },
    { name: 'Dr Bharathi S Gopal',        email: 'bharathi.gopal@ibsindia.org' },
    { name: 'Dr Shweta Puneet',           email: 'shweta@ibsindia.org' },
    { name: 'Dr R Harish',                email: 'harish@ibsindia.org' },
    { name: 'Prof Sujit Kumar',           email: 'sujit.iitr@gmail.com' },
    { name: 'Dr P Vittala',               email: 'pundareeka.vittala@ibsindia.org' },
    { name: 'Prof Kiran Kumar KV',        email: 'kiranvisiting@gmail.com' },
    { name: 'Prof R Srinivasan',          email: 'srinivasan.r@ibsindia.org' },
    { name: 'Prof Ravindra Menon',        email: 'ravi_menon24@yahoo.co.in' },
  ];

  const userMap = {};
  for (const u of allUsers) {
    const role = coordinatorEmails.has(u.email) ? 'COORDINATOR' : 'FACULTY';
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: { role },
      create: { name: u.name, email: u.email, password_hash: userPassword, role },
    });
    userMap[u.email] = created.user_id;
  }
  console.log(`Users: ${Object.keys(userMap).length} created/updated`);

  // ── 3. Checklist Master ──────────────────────────────────
  const checklistItems = [
    { name: 'Course Plan / Lesson Plan',      category: 'COURSE_PLANNING' },
    { name: 'Course Handout',                 category: 'COURSE_PLANNING' },
    { name: 'Course Objectives and Outcomes', category: 'OBE' },
    { name: 'CO-PO Mapping',                  category: 'OBE' },
    { name: 'Teaching Material / Slides',     category: 'TEACHING_LEARNING' },
    { name: 'Reference Books and Resources',  category: 'TEACHING_LEARNING' },
    { name: 'Case Studies Used',              category: 'TEACHING_LEARNING' },
    { name: 'Industry Connect Activities',    category: 'TEACHING_LEARNING' },
    { name: 'Assignment Details',             category: 'ASSESSMENT' },
    { name: 'Quiz / Test Records',            category: 'ASSESSMENT' },
    { name: 'Mid-Term Question Paper',        category: 'ASSESSMENT' },
    { name: 'End-Term Question Paper',        category: 'ASSESSMENT' },
    { name: 'Marks Distribution',             category: 'ASSESSMENT' },
    { name: 'Answer Scripts Sample',          category: 'ASSESSMENT' },
    { name: 'Student Feedback Summary',       category: 'FEEDBACK' },
    { name: 'Faculty Feedback on Course',     category: 'FEEDBACK' },
    { name: 'Attendance Records',             category: 'TEACHING_LEARNING' },
    { name: 'Innovation in Teaching',         category: 'TEACHING_LEARNING' },
    { name: 'Remedial / Bridge Classes',      category: 'TEACHING_LEARNING' },
    { name: 'CO Attainment Report',           category: 'OBE' },
  ];

  const checklistMap = {};
  for (const item of checklistItems) {
    const existing = await prisma.checklistMaster.findFirst({ where: { checklist_item_name: item.name } });
    if (!existing) {
      const created = await prisma.checklistMaster.create({
        data: { checklist_item_name: item.name, category: item.category, required_flag: true }
      });
      checklistMap[item.name] = created.checklist_id;
    } else {
      checklistMap[item.name] = existing.checklist_id;
    }
  }
  console.log(`Checklist master: ${Object.keys(checklistMap).length} items`);

  // ── 4. Courses ─────────────────────────────────────────────
  const courses = [
    // Sem 2 - Core
    { sem: '2', code: 'SHRM502', name: 'Business Analytics - II',                section: 'A', faculty: 'saisree.mangu@ibsindia.org',               coordinator: 'saisree.mangu@ibsindia.org' },
    { sem: '2', code: 'SHRM502', name: 'Business Analytics - II',                section: 'B', faculty: 'rajani.kumari@ibsindia.org',               coordinator: 'saisree.mangu@ibsindia.org' },
    { sem: '2', code: 'SHRM502', name: 'Business Analytics - II',                section: 'C', faculty: 'susheela.girisaballa@ibsindia.org',         coordinator: 'saisree.mangu@ibsindia.org' },
    { sem: '2', code: 'SHRM502', name: 'Business Analytics - II',                section: 'D', faculty: 'roshny.unnikrishnan@ifheindia.org',         coordinator: 'saisree.mangu@ibsindia.org' },
    { sem: '2', code: 'SHRM502', name: 'Business Analytics - II',                section: 'E', faculty: 'rajani.kumari@ibsindia.org',               coordinator: 'saisree.mangu@ibsindia.org' },
    { sem: '2', code: 'SHRM502', name: 'Business Analytics - II',                section: 'F', faculty: 'saisree.mangu@ibsindia.org',               coordinator: 'saisree.mangu@ibsindia.org' },
    { sem: '2', code: 'SHRM502', name: 'Business Analytics - II',                section: 'G', faculty: 'roshny.unnikrishnan@ifheindia.org',         coordinator: 'saisree.mangu@ibsindia.org' },
    { sem: '2', code: 'SLGM502', name: 'Business Communication',                 section: 'A', faculty: 'geethasharma@ibsindia.org',                coordinator: 'radhika@ibsindia.org' },
    { sem: '2', code: 'SLGM502', name: 'Business Communication',                 section: 'B', faculty: 'soni.karekar@ibsindia.org',                coordinator: 'radhika@ibsindia.org' },
    { sem: '2', code: 'SLGM502', name: 'Business Communication',                 section: 'C', faculty: 'geethasharma@ibsindia.org',                coordinator: 'radhika@ibsindia.org' },
    { sem: '2', code: 'SLGM502', name: 'Business Communication',                 section: 'D', faculty: 'radhika@ibsindia.org',                     coordinator: 'radhika@ibsindia.org' },
    { sem: '2', code: 'SLGM502', name: 'Business Communication',                 section: 'E', faculty: 'chethana.krishna@ibsindia.org',             coordinator: 'radhika@ibsindia.org' },
    { sem: '2', code: 'SLGM502', name: 'Business Communication',                 section: 'F', faculty: 'chethana.krishna@ibsindia.org',             coordinator: 'radhika@ibsindia.org' },
    { sem: '2', code: 'SLGM502', name: 'Business Communication',                 section: 'G', faculty: 'soni.karekar@ibsindia.org',                coordinator: 'radhika@ibsindia.org' },
    { sem: '2', code: 'SLFI502', name: 'Financial Management - II',              section: 'A', faculty: 'poornima.joshi@ibsindia.org',              coordinator: 'skjose@ibsindia.org' },
    { sem: '2', code: 'SLFI502', name: 'Financial Management - II',              section: 'B', faculty: 'navya.muricken@ibsindia.org',              coordinator: 'skjose@ibsindia.org' },
    { sem: '2', code: 'SLFI502', name: 'Financial Management - II',              section: 'C', faculty: 'skjose@ibsindia.org',                      coordinator: 'skjose@ibsindia.org' },
    { sem: '2', code: 'SLFI502', name: 'Financial Management - II',              section: 'D', faculty: 'yadhu.harikumar@ibsindia.org',             coordinator: 'skjose@ibsindia.org' },
    { sem: '2', code: 'SLFI502', name: 'Financial Management - II',              section: 'E', faculty: 'navya.muricken@ibsindia.org',              coordinator: 'skjose@ibsindia.org' },
    { sem: '2', code: 'SLFI502', name: 'Financial Management - II',              section: 'F', faculty: 'skjose@ibsindia.org',                      coordinator: 'skjose@ibsindia.org' },
    { sem: '2', code: 'SLFI502', name: 'Financial Management - II',              section: 'G', faculty: 'yadhu.harikumar@ibsindia.org',             coordinator: 'skjose@ibsindia.org' },
    { sem: '2', code: 'SLHR502', name: 'Human Resource Management',              section: 'A', faculty: 'surjyabrat@ibsindia.org',                 coordinator: 'niharika.singh@ibsindia.org' },
    { sem: '2', code: 'SLHR502', name: 'Human Resource Management',              section: 'B', faculty: 'niharika.singh@ibsindia.org',             coordinator: 'niharika.singh@ibsindia.org' },
    { sem: '2', code: 'SLHR502', name: 'Human Resource Management',              section: 'C', faculty: 'seethalakshmi.r@ibsindia.org',            coordinator: 'niharika.singh@ibsindia.org' },
    { sem: '2', code: 'SLHR502', name: 'Human Resource Management',              section: 'D', faculty: 'radhika@ibsindia.org',                    coordinator: 'niharika.singh@ibsindia.org' },
    { sem: '2', code: 'SLHR502', name: 'Human Resource Management',              section: 'E', faculty: 'niharika.singh@ibsindia.org',             coordinator: 'niharika.singh@ibsindia.org' },
    { sem: '2', code: 'SLHR502', name: 'Human Resource Management',              section: 'F', faculty: 'reema.arunkumarmohanty@ibsindia.org',     coordinator: 'niharika.singh@ibsindia.org' },
    { sem: '2', code: 'SLHR502', name: 'Human Resource Management',              section: 'G', faculty: 'radhika@ibsindia.org',                    coordinator: 'niharika.singh@ibsindia.org' },
    { sem: '2', code: 'SLEC502', name: 'Macroeconomics and Business Environment',section: 'A', faculty: 'vishal.sharma@ibsindia.org',              coordinator: 'vanishree.gaddi@ibsindia.org' },
    { sem: '2', code: 'SLEC502', name: 'Macroeconomics and Business Environment',section: 'B', faculty: 'vanishree.gaddi@ibsindia.org',            coordinator: 'vanishree.gaddi@ibsindia.org' },
    { sem: '2', code: 'SLEC502', name: 'Macroeconomics and Business Environment',section: 'C', faculty: 'vishal.sharma@ibsindia.org',              coordinator: 'vanishree.gaddi@ibsindia.org' },
    { sem: '2', code: 'SLEC502', name: 'Macroeconomics and Business Environment',section: 'D', faculty: 'kavita.srivastava@ibsindia.org',          coordinator: 'vanishree.gaddi@ibsindia.org' },
    { sem: '2', code: 'SLEC502', name: 'Macroeconomics and Business Environment',section: 'E', faculty: 'kavita.srivastava@ibsindia.org',          coordinator: 'vanishree.gaddi@ibsindia.org' },
    { sem: '2', code: 'SLEC502', name: 'Macroeconomics and Business Environment',section: 'F', faculty: 'vinay.joshi@ibsindia.org',                coordinator: 'vanishree.gaddi@ibsindia.org' },
    { sem: '2', code: 'SLEC502', name: 'Macroeconomics and Business Environment',section: 'G', faculty: 'vanishree.gaddi@ibsindia.org',            coordinator: 'vanishree.gaddi@ibsindia.org' },
    { sem: '2', code: 'SLMM502', name: 'Marketing Management - II',             section: 'A', faculty: 'hemant.gupta@ibsindia.org',               coordinator: 'hemant.gupta@ibsindia.org' },
    { sem: '2', code: 'SLMM502', name: 'Marketing Management - II',             section: 'B', faculty: 'shafiulla@ibsindia.org',                  coordinator: 'hemant.gupta@ibsindia.org' },
    { sem: '2', code: 'SLMM502', name: 'Marketing Management - II',             section: 'C', faculty: 'vhariharan123@gmail.com',                 coordinator: 'hemant.gupta@ibsindia.org' },
    { sem: '2', code: 'SLMM502', name: 'Marketing Management - II',             section: 'D', faculty: 'clemnsud@gmail.com',                      coordinator: 'hemant.gupta@ibsindia.org' },
    { sem: '2', code: 'SLMM502', name: 'Marketing Management - II',             section: 'E', faculty: 'hemant.gupta@ibsindia.org',               coordinator: 'hemant.gupta@ibsindia.org' },
    { sem: '2', code: 'SLMM502', name: 'Marketing Management - II',             section: 'F', faculty: 'shafiulla@ibsindia.org',                  coordinator: 'hemant.gupta@ibsindia.org' },
    { sem: '2', code: 'SLMM502', name: 'Marketing Management - II',             section: 'G', faculty: 'clemnsud@gmail.com',                      coordinator: 'hemant.gupta@ibsindia.org' },
    { sem: '2', code: 'SLOP502', name: 'Operations Management',                 section: 'A', faculty: 'vidhyashree.v@ibsindia.org',              coordinator: 'ramesh.murthy@ibsindia.org' },
    { sem: '2', code: 'SLOP502', name: 'Operations Management',                 section: 'B', faculty: 'lrsmani@gmail.com',                       coordinator: 'ramesh.murthy@ibsindia.org' },
    { sem: '2', code: 'SLOP502', name: 'Operations Management',                 section: 'C', faculty: 'ramesh.murthy@ibsindia.org',              coordinator: 'ramesh.murthy@ibsindia.org' },
    { sem: '2', code: 'SLOP502', name: 'Operations Management',                 section: 'D', faculty: 'vidhyashree.v@ibsindia.org',              coordinator: 'ramesh.murthy@ibsindia.org' },
    { sem: '2', code: 'SLOP502', name: 'Operations Management',                 section: 'E', faculty: 'lrsmani@gmail.com',                       coordinator: 'ramesh.murthy@ibsindia.org' },
    { sem: '2', code: 'SLOP502', name: 'Operations Management',                 section: 'F', faculty: 'ramesh.murthy@ibsindia.org',              coordinator: 'ramesh.murthy@ibsindia.org' },
    { sem: '2', code: 'SLOP502', name: 'Operations Management',                 section: 'G', faculty: 'leenas@ibsindia.org',                     coordinator: 'ramesh.murthy@ibsindia.org' },
    // Sem 2 - Electives
    { sem: '2', code: 'SLIT609', name: 'Business Intelligence & Analytics',     section: 'A', faculty: 'veena.h.bhat@gmail.com',                 coordinator: 'susheela.girisaballa@ibsindia.org' },
    { sem: '2', code: 'SLIT609', name: 'Business Intelligence & Analytics',     section: 'B', faculty: 'veena.h.bhat@gmail.com',                 coordinator: 'susheela.girisaballa@ibsindia.org' },
    { sem: '2', code: 'SLIT609', name: 'Business Intelligence & Analytics',     section: 'C', faculty: 'susheela.girisaballa@ibsindia.org',       coordinator: 'susheela.girisaballa@ibsindia.org' },
    { sem: '2', code: 'SLIT609', name: 'Business Intelligence & Analytics',     section: 'D', faculty: 'raogn1975@gmail.com',                    coordinator: 'susheela.girisaballa@ibsindia.org' },
    { sem: '2', code: 'SHFI628', name: 'Financial Derivatives and Risk Mgmt',  section: 'A', faculty: 'khalid.islam@ibsindia.org',              coordinator: 'khalid.islam@ibsindia.org' },
    { sem: '2', code: 'SHFI628', name: 'Financial Derivatives and Risk Mgmt',  section: 'B', faculty: 'khalid.islam@ibsindia.org',              coordinator: 'khalid.islam@ibsindia.org' },
    { sem: '2', code: 'SHFI628', name: 'Financial Derivatives and Risk Mgmt',  section: 'C', faculty: 'khalid.islam@ibsindia.org',              coordinator: 'khalid.islam@ibsindia.org' },
    { sem: '2', code: 'SLMM603', name: 'B2B Marketing',                        section: 'A', faculty: 'sofi.dinesh@ibsindia.org',               coordinator: 'sofi.dinesh@ibsindia.org' },
    { sem: '2', code: 'SLMM603', name: 'B2B Marketing',                        section: 'B', faculty: 'venkatesh.ganapathy@ibsindia.org',       coordinator: 'sofi.dinesh@ibsindia.org' },
    { sem: '2', code: 'SLFI611', name: 'Financial Statement Analysis',         section: 'A', faculty: 'vrajesh.kumar@ibsindia.org',             coordinator: 'vrajesh.kumar@ibsindia.org' },
    { sem: '2', code: 'SLFI611', name: 'Financial Statement Analysis',         section: 'B', faculty: 'vrajesh.kumar@ibsindia.org',             coordinator: 'vrajesh.kumar@ibsindia.org' },
    { sem: '2', code: 'SLOM607', name: 'Project Management',                   section: 'A', faculty: 'nagkrish@yahoo.com',                    coordinator: 'nagkrish@yahoo.com' },
    { sem: '2', code: 'SLOM607', name: 'Project Management',                   section: 'B', faculty: 'nagkrish@yahoo.com',                    coordinator: 'nagkrish@yahoo.com' },
    { sem: '2', code: 'SLFI605', name: 'Security Analysis',                    section: 'A', faculty: 'gpgirish@ibsindia.org',                 coordinator: 'gpgirish@ibsindia.org' },
    { sem: '2', code: 'SLFI605', name: 'Security Analysis',                    section: 'B', faculty: 'gpgirish@ibsindia.org',                 coordinator: 'gpgirish@ibsindia.org' },
    { sem: '2', code: 'SLMM604', name: 'Services Marketing',                   section: 'A', faculty: 'shafiulla@ibsindia.org',                coordinator: 'shafiulla@ibsindia.org' },
    { sem: '2', code: 'SLIT610', name: 'Business Analysis',                    section: 'A', faculty: 'sandhya.soundararajan@gmail.com',       coordinator: 'sandhya.soundararajan@gmail.com' },
    { sem: '2', code: 'SLMM606', name: 'Sales & Distribution Management',      section: 'A', faculty: 'harisankar.muralidharan@ibsindia.org',  coordinator: 'harisankar.muralidharan@ibsindia.org' },
    { sem: '2', code: 'SHHR603', name: 'Talent Acquisition and Retention',     section: 'A', faculty: 'niharika.singh@ibsindia.org',           coordinator: 'niharika.singh@ibsindia.org' },
    { sem: '2', code: 'SLHR608', name: 'Training & Development',               section: 'A', faculty: 'anupaghosh72@gmail.com',               coordinator: 'anupaghosh72@gmail.com' },
    // Sem 4 - Core
    { sem: '4', code: 'SLGM504', name: 'Legal Environment of Business',        section: 'A', faculty: 'bkkiranshetty@gmail.com',              coordinator: 'bkkiranshetty@gmail.com' },
    { sem: '4', code: 'SLGM504', name: 'Legal Environment of Business',        section: 'B', faculty: 'suruchimahajan10@gmail.com',           coordinator: 'bkkiranshetty@gmail.com' },
    { sem: '4', code: 'SLGM504', name: 'Legal Environment of Business',        section: 'C', faculty: 'suruchimahajan10@gmail.com',           coordinator: 'bkkiranshetty@gmail.com' },
    { sem: '4', code: 'SLGM504', name: 'Legal Environment of Business',        section: 'D', faculty: 'ashokanand@gmail.com',                coordinator: 'bkkiranshetty@gmail.com' },
    { sem: '4', code: 'SLGM504', name: 'Legal Environment of Business',        section: 'E', faculty: 'chandrakrishna1@gmail.com',            coordinator: 'bkkiranshetty@gmail.com' },
    { sem: '4', code: 'SLGM504', name: 'Legal Environment of Business',        section: 'F', faculty: 'gopal.mondal@ideck.in',               coordinator: 'bkkiranshetty@gmail.com' },
    { sem: '4', code: 'SLGM504', name: 'Legal Environment of Business',        section: 'G', faculty: 'gopal.mondal@ideck.in',               coordinator: 'bkkiranshetty@gmail.com' },
    { sem: '4', code: 'SLGM601', name: 'Management Control Systems',           section: 'A', faculty: 'soujanyagk@gmail.com',                coordinator: 'sudindra.vr@ibsindia.org' },
    { sem: '4', code: 'SLGM601', name: 'Management Control Systems',           section: 'B', faculty: 'bkkiranshetty@gmail.com',             coordinator: 'sudindra.vr@ibsindia.org' },
    { sem: '4', code: 'SLGM601', name: 'Management Control Systems',           section: 'C', faculty: 'soujanyagk@gmail.com',                coordinator: 'sudindra.vr@ibsindia.org' },
    { sem: '4', code: 'SLGM601', name: 'Management Control Systems',           section: 'D', faculty: 'sudindra.vr@ibsindia.org',            coordinator: 'sudindra.vr@ibsindia.org' },
    { sem: '4', code: 'SLGM601', name: 'Management Control Systems',           section: 'E', faculty: 'soujanyagk@gmail.com',                coordinator: 'sudindra.vr@ibsindia.org' },
    { sem: '4', code: 'SLGM601', name: 'Management Control Systems',           section: 'F', faculty: 'sudindra.vr@ibsindia.org',            coordinator: 'sudindra.vr@ibsindia.org' },
    { sem: '4', code: 'SLGM601', name: 'Management Control Systems',           section: 'G', faculty: 'bkkiranshetty@gmail.com',             coordinator: 'sudindra.vr@ibsindia.org' },
    { sem: '4', code: 'SLGM602', name: 'Business Ethics & Corporate Governance',section: 'A', faculty: 'mshetty.m123@gmail.com',             coordinator: 'chandrashekar.pk@ibsindia.org' },
    { sem: '4', code: 'SLGM602', name: 'Business Ethics & Corporate Governance',section: 'B', faculty: 'lrsmani@gmail.com',                  coordinator: 'chandrashekar.pk@ibsindia.org' },
    { sem: '4', code: 'SLGM602', name: 'Business Ethics & Corporate Governance',section: 'C', faculty: 'sunil.pillai@ibsindia.org',          coordinator: 'chandrashekar.pk@ibsindia.org' },
    { sem: '4', code: 'SLGM602', name: 'Business Ethics & Corporate Governance',section: 'D', faculty: 'sumanjeet_dass@yahoo.com',           coordinator: 'chandrashekar.pk@ibsindia.org' },
    { sem: '4', code: 'SLGM602', name: 'Business Ethics & Corporate Governance',section: 'E', faculty: 'chandrashekar.pk@ibsindia.org',      coordinator: 'chandrashekar.pk@ibsindia.org' },
    { sem: '4', code: 'SLGM602', name: 'Business Ethics & Corporate Governance',section: 'F', faculty: 'sunil.pillai@ibsindia.org',          coordinator: 'chandrashekar.pk@ibsindia.org' },
    { sem: '4', code: 'SLGM602', name: 'Business Ethics & Corporate Governance',section: 'G', faculty: 'chandrashekar.pk@ibsindia.org',      coordinator: 'chandrashekar.pk@ibsindia.org' },
    // Sem 4 - Electives
    { sem: '4', code: 'SLMM612', name: 'Brand Management',                     section: 'A', faculty: 'bharathi.gopal@ibsindia.org',         coordinator: 'clemnsud@gmail.com' },
    { sem: '4', code: 'SLMM612', name: 'Brand Management',                     section: 'B', faculty: 'bharathi.gopal@ibsindia.org',         coordinator: 'clemnsud@gmail.com' },
    { sem: '4', code: 'SLMM612', name: 'Brand Management',                     section: 'C', faculty: 'clemnsud@gmail.com',                 coordinator: 'clemnsud@gmail.com' },
    { sem: '4', code: 'SLFI609', name: 'Portfolio Management & Mutual Funds',  section: 'A', faculty: 'poornima.joshi@ibsindia.org',         coordinator: 'poornima.joshi@ibsindia.org' },
    { sem: '4', code: 'SLFI609', name: 'Portfolio Management & Mutual Funds',  section: 'B', faculty: 'poornima.joshi@ibsindia.org',         coordinator: 'poornima.joshi@ibsindia.org' },
    { sem: '4', code: 'SLMM603', name: 'B2B Marketing',                        section: 'A', faculty: 'sofi.dinesh@ibsindia.org',            coordinator: 'sofi.dinesh@ibsindia.org' },
    { sem: '4', code: 'SLMM603', name: 'B2B Marketing',                        section: 'B', faculty: 'sofi.dinesh@ibsindia.org',            coordinator: 'sofi.dinesh@ibsindia.org' },
    { sem: '4', code: 'SLIT610', name: 'Business Analysis',                    section: 'A', faculty: 'shweta@ibsindia.org',                coordinator: 'shweta@ibsindia.org' },
    { sem: '4', code: 'SLIT610', name: 'Business Analysis',                    section: 'B', faculty: 'shweta@ibsindia.org',                coordinator: 'shweta@ibsindia.org' },
    { sem: '4', code: 'SLMM608', name: 'Strategic Marketing Management',       section: 'A', faculty: 'sunil.pillai@ibsindia.org',           coordinator: 'sunil.pillai@ibsindia.org' },
    { sem: '4', code: 'SLMM607', name: 'International Marketing',              section: 'A', faculty: 'harish@ibsindia.org',                coordinator: 'harish@ibsindia.org' },
    { sem: '4', code: 'SHOM601', name: 'Supply Chain Analytics',               section: 'A', faculty: 'vidhyashree.v@ibsindia.org',         coordinator: 'vidhyashree.v@ibsindia.org' },
    { sem: '4', code: 'SLMM611', name: 'Customer Relationship Management',     section: 'A', faculty: 'sujit.iitr@gmail.com',              coordinator: 'sujit.iitr@gmail.com' },
    { sem: '4', code: 'SLFI604', name: 'Mergers and Acquisitions',             section: 'A', faculty: 'pundareeka.vittala@ibsindia.org',    coordinator: 'pundareeka.vittala@ibsindia.org' },
    { sem: '4', code: 'SHFI624', name: 'Behavioural Finance',                  section: 'A', faculty: 'navya.muricken@ibsindia.org',        coordinator: 'navya.muricken@ibsindia.org' },
    { sem: '4', code: 'SLFI606', name: 'Strategic Financial Management',       section: 'A', faculty: 'yadhu.harikumar@ibsindia.org',       coordinator: 'yadhu.harikumar@ibsindia.org' },
    { sem: '4', code: 'SHFI636', name: 'Advanced Topics in FinTech',           section: 'A', faculty: 'kiranvisiting@gmail.com',            coordinator: 'kiranvisiting@gmail.com' },
    { sem: '4', code: 'SHMM625', name: 'Digital Marketing',                    section: 'A', faculty: 'venkatesh.ganapathy@ibsindia.org',  coordinator: 'venkatesh.ganapathy@ibsindia.org' },
    { sem: '4', code: 'SHOM611', name: 'Prescriptive Analytics',               section: 'A', faculty: 'ramesh.murthy@ibsindia.org',        coordinator: 'ramesh.murthy@ibsindia.org' },
    { sem: '4', code: 'SLMM602', name: 'Consumer Behavior',                    section: 'A', faculty: 'harish@ibsindia.org',               coordinator: 'harish@ibsindia.org' },
    { sem: '4', code: 'SLMM606', name: 'Sales & Distribution Management',      section: 'A', faculty: 'harisankar.muralidharan@ibsindia.org', coordinator: 'harisankar.muralidharan@ibsindia.org' },
    { sem: '4', code: 'SHOM605', name: 'Intro to Blockchain & Machine Learning',section: 'A', faculty: 'leenas@ibsindia.org',              coordinator: 'leenas@ibsindia.org' },
    { sem: '4', code: 'SLMM604', name: 'Services Marketing',                   section: 'A', faculty: 'hemant.gupta@ibsindia.org',         coordinator: 'hemant.gupta@ibsindia.org' },
    { sem: '4', code: 'SHHR603', name: 'Talent Acquisition and Retention',     section: 'A', faculty: 'reema.arunkumarmohanty@ibsindia.org', coordinator: 'reema.arunkumarmohanty@ibsindia.org' },
    { sem: '4', code: 'SLOM605', name: 'Business Modeling and Simulation',     section: 'A', faculty: 'sandhya.soundararajan@gmail.com',   coordinator: 'sandhya.soundararajan@gmail.com' },
    { sem: '4', code: 'SLFI610', name: 'Project Appraisal & Finance',          section: 'A', faculty: 'pundareeka.vittala@ibsindia.org',   coordinator: 'pundareeka.vittala@ibsindia.org' },
    { sem: '4', code: 'SLFI612', name: 'Financial Services',                   section: 'A', faculty: 'sudindra.vr@ibsindia.org',          coordinator: 'sudindra.vr@ibsindia.org' },
    { sem: '4', code: 'SLMM605', name: 'Integrated Marketing Communication',   section: 'A', faculty: 'srinivasan.r@ibsindia.org',         coordinator: 'srinivasan.r@ibsindia.org' },
    { sem: '4', code: 'SLBK601', name: 'Risk Management in Banks',             section: 'A', faculty: 'ravi_menon24@yahoo.co.in',          coordinator: 'ravi_menon24@yahoo.co.in' },
    { sem: '4', code: 'SLEP601', name: 'Entrepreneurial Development',          section: 'A', faculty: 'surjyabrat@ibsindia.org',           coordinator: 'surjyabrat@ibsindia.org' },
    { sem: '4', code: 'SLHR602', name: 'Strategic HRM',                        section: 'A', faculty: 'seethalakshmi.r@ibsindia.org',      coordinator: 'seethalakshmi.r@ibsindia.org' },
  ];

  let courseCount = 0;
  for (const c of courses) {
    const facultyId = userMap[c.faculty];
    const coordinatorId = userMap[c.coordinator] || null;
    if (!facultyId) { console.warn(`Faculty not found: ${c.faculty}`); continue; }
    const existing = await prisma.course.findFirst({
      where: { course_code: c.code, section: c.section, semester: c.sem }
    });
    if (!existing) {
      await prisma.course.create({
        data: {
          course_code: c.code,
          course_name: c.name,
          semester: c.sem,
          section: c.section,
          faculty_id: facultyId,
          coordinator_id: coordinatorId,
        }
      });
      courseCount++;
    } else {
      // Update coordinator if not set
      await prisma.course.update({
        where: { course_id: existing.course_id },
        data: { coordinator_id: coordinatorId }
      });
    }
  }
  console.log(`Courses: ${courseCount} new courses created`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
