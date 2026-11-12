import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { deflateSync } from 'node:zlib';
import { createClient } from '@supabase/supabase-js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env.seed.local');
const isDryRun = process.argv.includes('--dry-run');

const instructors = [
  { email: 'pengajar1@eduspace.test', name: 'Nadia Pratama', role: 'instructor' },
  { email: 'pengajar2@eduspace.test', name: 'Bima Santoso', role: 'instructor' },
  { email: 'pengajar3@eduspace.test', name: 'Sari Wulandari', role: 'instructor' },
];
const participants = [
  { email: 'peserta1@eduspace.test', name: 'Raka Wijaya', role: 'participant' },
  { email: 'peserta2@eduspace.test', name: 'Dewi Anggraini', role: 'participant' },
  { email: 'peserta3@eduspace.test', name: 'Fajar Ramadhan', role: 'participant' },
  { email: 'peserta4@eduspace.test', name: 'Intan Permata', role: 'participant' },
  { email: 'peserta5@eduspace.test', name: 'Yoga Saputra', role: 'participant' },
  { email: 'peserta6@eduspace.test', name: 'Maya Lestari', role: 'participant' },
];
const adminAccount = { email: 'admin@eduspace.test', name: 'Admin EduSpace', role: 'admin' };

const courseSeeds = [
  {
    slug: 'react-typescript-fundamentals',
    title: 'React dan TypeScript dari Dasar',
    subtitle: 'Bangun antarmuka web yang terstruktur dan mudah dirawat.',
    description: 'Pelajari komponen React, state, props, dan TypeScript melalui latihan bertahap.',
    category: 'development',
    instructor: 0,
    price: 149000,
    status: 'published',
  },
  {
    slug: 'ui-ux-product-design',
    title: 'UI/UX dan Desain Produk Digital',
    subtitle: 'Riset, wireframe, prototipe, dan uji kegunaan.',
    description: 'Rancang pengalaman produk digital dengan proses desain yang berpusat pada pengguna.',
    category: 'design',
    instructor: 1,
    price: 99000,
    status: 'published',
  },
  {
    slug: 'data-analysis-python',
    title: 'Analisis Data dengan Python',
    subtitle: 'Olah data dan komunikasikan temuan secara jelas.',
    description: 'Kenali alur analisis data, pembersihan dataset, ringkasan statistik, dan visualisasi.',
    category: 'data-ai',
    instructor: 2,
    price: 179000,
    status: 'published',
  },
  {
    slug: 'digital-marketing-practice',
    title: 'Praktik Digital Marketing',
    subtitle: 'Susun strategi konten dan ukur hasil kampanye.',
    description: 'Bangun rencana pemasaran digital dengan tujuan, kanal, dan metrik yang terukur.',
    category: 'marketing',
    instructor: 0,
    price: 0,
    status: 'published',
  },
  {
    slug: 'startup-business-foundation',
    title: 'Dasar Membangun Bisnis Startup',
    subtitle: 'Validasi masalah, model bisnis, dan eksperimen pasar.',
    description: 'Pelajari langkah awal menguji ide bisnis dan menyusun proposisi nilai.',
    category: 'business',
    instructor: 1,
    price: 129000,
    status: 'published',
  },
  {
    slug: 'cloud-deployment-basics',
    title: 'Dasar Deployment Aplikasi Cloud',
    subtitle: 'Siapkan aplikasi untuk dirilis dengan praktik yang aman.',
    description: 'Kenali environment, build, konfigurasi, dan proses rilis aplikasi berbasis cloud.',
    category: 'technology',
    instructor: 2,
    price: 159000,
    status: 'pending_review',
  },
];

const optionLabels = ['A', 'B', 'C', 'D'];
const questionPrompts = [
  'Apa tujuan utama dari materi pada modul ini?',
  'Langkah mana yang paling tepat untuk memulai pekerjaan?',
  'Apa manfaat memeriksa hasil sebelum melanjutkan?',
  'Bagaimana cara memilih pendekatan yang sesuai kebutuhan?',
  'Apa tindakan yang tepat setelah hasil dievaluasi?',
];
const optionSets = [
  ['Memahami kebutuhan dan tujuan', 'Menambah langkah tanpa alasan', 'Mengabaikan konteks pengguna', 'Menghapus hasil pekerjaan'],
  ['Membuat rencana berdasarkan kebutuhan', 'Langsung melewati pemeriksaan', 'Mengubah semua pengaturan sekaligus', 'Mengabaikan data yang tersedia'],
  ['Menemukan kesalahan dan memperbaiki hasil', 'Memastikan tidak ada evaluasi', 'Menghilangkan catatan proses', 'Mengulang langkah tanpa perubahan'],
  ['Membandingkan pilihan dengan kriteria', 'Memilih secara acak', 'Menggunakan satu cara untuk semua kasus', 'Mengabaikan batasan proyek'],
  ['Mencatat temuan dan menentukan perbaikan', 'Menghapus semua catatan', 'Menghentikan evaluasi', 'Mengabaikan umpan balik'],
];

function stableUuid(value) {
  const bytes = createHash('sha1').update(`eduspace-seed:${value}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function parseEnvFile(text) {
  const result = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
    result[key] = value;
  }
  return result;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const name = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

function createThumbnail(seedIndex) {
  const width = 640;
  const height = 360;
  const colors = [
    [35, 72, 180],
    [146, 65, 160],
    [20, 125, 115],
    [210, 115, 35],
    [40, 100, 145],
    [70, 80, 120],
  ];
  const [red, green, blue] = colors[seedIndex % colors.length];
  const pixels = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    pixels[rowStart] = 0;
    for (let x = 0; x < width; x += 1) {
      const offset = rowStart + 1 + x * 4;
      const blend = Math.floor((x / width) * 32 + (y / height) * 18);
      pixels[offset] = Math.min(255, red + blend);
      pixels[offset + 1] = Math.min(255, green + blend);
      pixels[offset + 2] = Math.min(255, blue + blend);
      pixels[offset + 3] = 255;
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const compressed = deflateSync(pixels);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function pdfText(value) {
  return value.normalize('NFKD').replace(/[^\x20-\x7e]/g, '').replace(/[()\\]/g, '\\$&');
}

function createSamplePdf(title, lessonTitle) {
  const lines = [
    'EduSpace - Materi Contoh',
    title,
    lessonTitle,
    'Dokumen contoh untuk pengujian akses materi privat.',
    'Ringkas kembali tujuan, langkah, dan hasil belajar pada materi ini.',
  ];
  const commands = ['BT', '/F1 18 Tf', '72 740 Td'];
  lines.forEach((line, index) => {
    if (index > 0) commands.push('0 -34 Td');
    commands.push(`(${pdfText(line)}) Tj`);
  });
  commands.push('ET');
  const content = commands.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(content, 'ascii')} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, 'ascii'));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, 'ascii');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, 'ascii');
}

async function assertNoError(result, action) {
  if (result.error) throw new Error(`${action}: ${result.error.message}`);
  return result.data;
}

async function listAllUsers(client) {
  const users = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`Gagal membaca akun Supabase Auth: ${error.message}`);
    users.push(...data.users);
    if (data.users.length < 1000) return users;
  }
}

async function ensureUsers(client, seedPassword) {
  const existingUsers = await listAllUsers(client);
  const byEmail = new Map(existingUsers.map((user) => [user.email?.toLowerCase(), user]));
  const accounts = [adminAccount, ...instructors, ...participants];
  const userIds = new Map();

  for (const account of accounts) {
    let user = byEmail.get(account.email);
    if (!user) {
      const { data, error } = await client.auth.admin.createUser({
        email: account.email,
        password: seedPassword,
        email_confirm: true,
        user_metadata: { full_name: account.name },
      });
      if (error || !data.user) throw new Error(`Gagal membuat akun seed ${account.email}: ${error?.message ?? 'user tidak dikembalikan'}`);
      user = data.user;
      byEmail.set(account.email, user);
    }
    userIds.set(account.email, user.id);
    const { error } = await client.from('profiles').upsert({
      id: user.id,
      full_name: account.name,
      role: account.role,
      instructor_requested: false,
      is_active: true,
      avatar_path: `${user.id}/avatar.png`,
    }, { onConflict: 'id' });
    if (error) throw new Error(`Gagal menyiapkan profil ${account.email}: ${error.message}`);
    const avatar = await client.storage.from('avatars').upload(
      `${user.id}/avatar.png`,
      createThumbnail(account.name.length % 6),
      { contentType: 'image/png', upsert: true },
    );
    if (avatar.error) throw new Error(`Gagal mengunggah avatar ${account.email}: ${avatar.error.message}`);
  }
  return userIds;
}

async function runSeed(client, userIds) {
  const { data: categoryRows, error: categoryError } = await client
    .from('categories')
    .select('id, slug')
    .eq('is_active', true);
  const categories = await assertNoError({ data: categoryRows, error: categoryError }, 'Gagal membaca kategori');
  const categoryIds = new Map(categories.map((category) => [category.slug, category.id]));
  for (const course of courseSeeds) {
    if (!categoryIds.has(course.category)) throw new Error(`Kategori seed tidak ditemukan: ${course.category}`);
  }

  const courses = courseSeeds.map((seed) => ({
    id: stableUuid(`course:${seed.slug}`),
    teacher_id: userIds.get(instructors[seed.instructor].email),
    category_id: categoryIds.get(seed.category),
    title: seed.title,
    slug: seed.slug,
    subtitle: seed.subtitle,
    description: seed.description,
    level: 'Beginner',
    language: 'id',
    learning_outcomes: ['Memahami konsep utama', 'Menerapkan langkah kerja', 'Mengevaluasi hasil'],
    requirements: ['Akses internet', 'Kesediaan mengikuti latihan'],
    thumbnail_path: `${userIds.get(instructors[seed.instructor].email)}/${stableUuid(`course:${seed.slug}`)}/thumbnail.png`,
    price: seed.price,
    original_price: seed.price ? Math.round(seed.price * 1.25) : 0,
    max_participants: null,
    status: seed.status,
    admin_locked: false,
    review_note: seed.status === 'pending_review' ? 'Menunggu pemeriksaan materi demo.' : null,
    published_at: seed.status === 'published' ? new Date().toISOString() : null,
  }));
  await assertNoError(await client.from('courses').upsert(courses, { onConflict: 'id' }), 'Gagal menyimpan kursus seed');

  const modules = [];
  const lessons = [];
  const lessonContents = [];
  for (const [courseIndex, course] of courses.entries()) {
    const firstModuleId = stableUuid(`module:${course.slug}:1`);
    const secondModuleId = stableUuid(`module:${course.slug}:2`);
    modules.push(
      { id: firstModuleId, course_id: course.id, title: 'Konsep dan Persiapan', position: 0 },
      { id: secondModuleId, course_id: course.id, title: 'Praktik dan Evaluasi', position: 1 },
    );
    const lessonSpecs = [
      { moduleId: firstModuleId, position: 0, type: 'video', title: 'Tujuan dan Peta Belajar', duration: 12 },
      { moduleId: firstModuleId, position: 1, type: 'text', title: 'Konsep Inti', duration: 18 },
      { moduleId: secondModuleId, position: 0, type: 'pdf', title: 'Latihan dan Ringkasan', duration: 20 },
      { moduleId: secondModuleId, position: 1, type: 'text', title: 'Refleksi dan Langkah Berikutnya', duration: 10 },
    ];
    for (const spec of lessonSpecs) {
      const lessonId = stableUuid(`lesson:${course.slug}:${spec.title}`);
      const filePath = spec.type === 'pdf' ? `${course.id}/${lessonId}/materi-contoh.pdf` : null;
      lessons.push({
        id: lessonId,
        module_id: spec.moduleId,
        course_id: course.id,
        title: spec.title,
        type: spec.type,
        duration_minutes: spec.duration,
        is_preview: spec.type === 'video',
        position: spec.position,
      });
      lessonContents.push({
        lesson_id: lessonId,
        content: `${course.title}: materi ${spec.title}. Ikuti penjelasan, catat poin penting, lalu kerjakan latihan mandiri.`,
        video_url: spec.type === 'video' ? 'https://www.youtube-nocookie.com/embed/ScMzIvxBSi4' : null,
        file_path: filePath,
      });
      if (filePath) {
        const upload = await client.storage.from('lesson-files').upload(
          filePath,
          createSamplePdf(course.title, spec.title),
          { contentType: 'application/pdf', upsert: true },
        );
        if (upload.error) throw new Error(`Gagal mengunggah PDF ${course.slug}: ${upload.error.message}`);
      }
    }
    const thumbnailPath = course.thumbnail_path;
    const thumbnail = await client.storage.from('course-thumbnails').upload(
      thumbnailPath,
      createThumbnail(courseIndex),
      { contentType: 'image/png', upsert: true },
    );
    if (thumbnail.error) throw new Error(`Gagal mengunggah thumbnail ${course.slug}: ${thumbnail.error.message}`);
  }
  await assertNoError(await client.from('modules').upsert(modules, { onConflict: 'id' }), 'Gagal menyimpan modul seed');
  await assertNoError(await client.from('lessons').upsert(lessons, { onConflict: 'id' }), 'Gagal menyimpan materi seed');
  await assertNoError(await client.from('lesson_contents').upsert(lessonContents, { onConflict: 'lesson_id' }), 'Gagal menyimpan isi materi seed');

  const quizzes = courses.map((course) => ({
    id: stableUuid(`quiz:${course.slug}`),
    course_id: course.id,
    module_id: stableUuid(`module:${course.slug}:2`),
    title: `Kuis: ${course.title}`,
    time_limit_minutes: 20,
    passing_score: 80,
    max_attempts: 3,
    is_published: course.status === 'published',
  }));
  await assertNoError(await client.from('quizzes').upsert(quizzes, { onConflict: 'id' }), 'Gagal menyimpan kuis seed');

  const questions = [];
  const options = [];
  const keys = [];
  for (const [courseIndex, course] of courses.entries()) {
    for (let index = 0; index < 5; index += 1) {
      const questionId = stableUuid(`question:${course.slug}:${index + 1}`);
      questions.push({
        id: questionId,
        quiz_id: quizzes[courseIndex].id,
        topic: index < 2 ? 'Konsep' : 'Praktik',
        text: `${questionPrompts[index]} (${course.title})`,
        code_snippet: null,
        position: index,
        points: 20,
      });
      const optionIds = optionLabels.map((label) => stableUuid(`option:${course.slug}:${index + 1}:${label}`));
      options.push(...optionLabels.map((label, optionIndex) => ({
        id: optionIds[optionIndex],
        question_id: questionId,
        label,
        text: optionSets[index][optionIndex],
      })));
      keys.push({
        question_id: questionId,
        correct_option_id: optionIds[0],
        explanation: 'Pilih jawaban yang mengikuti tujuan dan langkah kerja pada materi.',
      });
    }
  }
  await assertNoError(await client.from('questions').upsert(questions, { onConflict: 'id' }), 'Gagal menyimpan soal seed');
  await assertNoError(await client.from('question_options').upsert(options, { onConflict: 'id' }), 'Gagal menyimpan opsi seed');
  await assertNoError(await client.from('question_keys').upsert(keys, { onConflict: 'question_id' }), 'Gagal menyimpan kunci jawaban seed');

  const enrollmentSpecs = [
    [0, 0], [0, 1], [1, 0], [1, 2], [2, 1],
    [2, 3], [3, 2], [3, 4], [4, 3], [5, 4],
  ];
  const enrollments = enrollmentSpecs.map(([participantIndex, courseIndex], index) => ({
    id: stableUuid(`enrollment:${participantIndex}:${courseIndex}`),
    student_id: userIds.get(participants[participantIndex].email),
    course_id: courses[courseIndex].id,
    status: index % 4 === 0 ? 'completed' : 'active',
    enrolled_at: new Date(Date.now() - (index + 2) * 86400000).toISOString(),
    completed_at: index % 4 === 0 ? new Date(Date.now() - 86400000).toISOString() : null,
    last_lesson_id: lessons[(courseIndex * 4) + (index % 4)].id,
    last_accessed_at: new Date(Date.now() - index * 3600000).toISOString(),
  }));
  await assertNoError(await client.from('enrollments').upsert(enrollments, { onConflict: 'course_id,student_id' }), 'Gagal menyimpan pendaftaran seed');

  const progress = [];
  for (const [index, enrollment] of enrollments.entries()) {
    const courseLessons = lessons.filter((lesson) => lesson.course_id === enrollment.course_id);
    const completedCount = enrollment.status === 'completed' ? courseLessons.length : (index % 3) + 1;
    for (const lesson of courseLessons.slice(0, completedCount)) {
      progress.push({
        id: stableUuid(`progress:${enrollment.student_id}:${lesson.id}`),
        student_id: enrollment.student_id,
        lesson_id: lesson.id,
        course_id: enrollment.course_id,
        completed_at: new Date(Date.now() - (index + 1) * 3600000).toISOString(),
      });
    }
  }
  await assertNoError(await client.from('lesson_progress').upsert(progress, { onConflict: 'student_id,lesson_id' }), 'Gagal menyimpan progres seed');

  const payments = enrollments.map((enrollment, index) => ({
    id: stableUuid(`payment:${enrollment.id}`),
    enrollment_id: enrollment.id,
    amount: courses.find((course) => course.id === enrollment.course_id).price,
    method: 'simulasi',
    status: index % 3 === 0 ? 'pending' : 'confirmed',
    paid_at: index % 3 === 0 ? null : new Date(Date.now() - index * 86400000).toISOString(),
  }));
  await assertNoError(await client.from('payments').upsert(payments, { onConflict: 'enrollment_id' }), 'Gagal menyimpan pembayaran seed');

  const attempts = [];
  const answers = [];
  for (const [index, enrollment] of enrollments.slice(0, 8).entries()) {
    const courseIndex = courses.findIndex((course) => course.id === enrollment.course_id);
    const isSubmitted = index !== 3;
    const attemptId = stableUuid(`attempt:${enrollment.student_id}:${courseIndex}:1`);
    const score = index % 3 === 0 ? 60 : index % 3 === 1 ? 80 : 100;
    const startedAt = new Date(Date.now() - (index + 1) * 7200000);
    attempts.push({
      id: attemptId,
      quiz_id: quizzes[courseIndex].id,
      student_id: enrollment.student_id,
      attempt_no: 1,
      status: isSubmitted ? 'submitted' : 'in_progress',
      score: isSubmitted ? score : null,
      passed: isSubmitted ? score >= 80 : null,
      started_at: startedAt.toISOString(),
      submitted_at: isSubmitted ? new Date(startedAt.getTime() + 900000).toISOString() : null,
      time_taken_seconds: isSubmitted ? 900 : null,
    });
    for (let questionIndex = 0; questionIndex < 5; questionIndex += 1) {
      const questionId = stableUuid(`question:${courses[courseIndex].slug}:${questionIndex + 1}`);
      const correct = !isSubmitted || questionIndex < Math.round(score / 20);
      const selectedLabel = correct ? 'A' : 'B';
      answers.push({
        attempt_id: attemptId,
        question_id: questionId,
        selected_option_id: stableUuid(`option:${courses[courseIndex].slug}:${questionIndex + 1}:${selectedLabel}`),
        is_correct: isSubmitted ? correct : null,
        flagged: !isSubmitted && questionIndex === 0,
        updated_at: startedAt.toISOString(),
      });
    }
  }
  await assertNoError(await client.from('quiz_attempts').upsert(attempts, { onConflict: 'id' }), 'Gagal menyimpan percobaan kuis seed');
  await assertNoError(await client.from('attempt_answers').upsert(answers, { onConflict: 'attempt_id,question_id' }), 'Gagal menyimpan jawaban seed');

  const savedCourses = participants.slice(0, 5).map((participant, index) => ({
    student_id: userIds.get(participant.email),
    course_id: courses[index].id,
  }));
  await assertNoError(await client.from('saved_courses').upsert(savedCourses, { onConflict: 'student_id,course_id' }), 'Gagal menyimpan kursus favorit seed');

  const lessonNotes = enrollmentSpecs.slice(0, 5).map(([participantIndex, courseIndex], index) => ({
    student_id: userIds.get(participants[participantIndex].email),
    lesson_id: lessons[courseIndex * 3].id,
    note: 'Catatan demo: rangkum tujuan dan langkah penting materi.',
    is_bookmarked: index % 2 === 0,
    sandbox_code: '',
    updated_at: new Date().toISOString(),
  }));
  await assertNoError(await client.from('lesson_notes').upsert(lessonNotes, { onConflict: 'student_id,lesson_id' }), 'Gagal menyimpan catatan seed');

  const notifications = participants.slice(0, 5).map((participant, index) => ({
    id: stableUuid(`notification:${participant.email}`),
    user_id: userIds.get(participant.email),
    kind: 'course_update',
    title: 'Selamat belajar di EduSpace',
    body: `Kursus ${courses[index].title} siap dilanjutkan.`,
    read_at: index % 2 === 0 ? null : new Date().toISOString(),
  }));
  await assertNoError(await client.from('notifications').upsert(notifications, { onConflict: 'id' }), 'Gagal menyimpan notifikasi seed');

  const messages = enrollmentSpecs.slice(0, 5).map(([participantIndex, courseIndex]) => ({
    id: stableUuid(`message:${participants[participantIndex].email}:${courses[courseIndex].slug}`),
    sender_id: userIds.get(instructors[courseSeeds[courseIndex].instructor].email),
    recipient_id: userIds.get(participants[participantIndex].email),
    body: 'Selamat datang. Silakan kirim pertanyaan melalui materi yang sedang dipelajari.',
  }));
  await assertNoError(await client.from('messages').upsert(messages, { onConflict: 'id' }), 'Gagal menyimpan pesan seed');

  const reviews = enrollmentSpecs.slice(0, 5).map(([participantIndex, courseIndex], index) => ({
    id: stableUuid(`review:${participants[participantIndex].email}:${courses[courseIndex].id}`),
    course_id: courses[courseIndex].id,
    student_id: userIds.get(participants[participantIndex].email),
    rating: 4 + (index % 2),
    comment: 'Materi tersusun jelas dan latihan membantu memahami konsep.',
  }));
  await assertNoError(await client.from('course_reviews').upsert(reviews, { onConflict: 'course_id,student_id' }), 'Gagal menyimpan ulasan seed');

  return {
    accounts: 1 + instructors.length + participants.length,
    publishedCourses: courses.filter((course) => course.status === 'published').length,
    pendingCourses: courses.filter((course) => course.status === 'pending_review').length,
    modules: modules.length,
    lessons: lessons.length,
    quizzes: quizzes.filter((quiz) => quiz.is_published).length,
    questions: questions.length,
    enrollments: enrollments.length,
    attempts: attempts.length,
  };
}

if (isDryRun) {
  console.log(JSON.stringify({
    dryRun: true,
    plannedAccounts: 1 + instructors.length + participants.length,
    publishedCourses: courseSeeds.filter((course) => course.status === 'published').length,
    pendingCourses: courseSeeds.filter((course) => course.status === 'pending_review').length,
    modules: courseSeeds.length * 2,
    lessons: courseSeeds.length * 4,
    questions: courseSeeds.length * 5,
    requiresServiceRoleKey: true,
  }, null, 2));
  process.exit(0);
}

let env;
try {
  env = parseEnvFile(await readFile(envPath, 'utf8'));
} catch {
  throw new Error('Buat .env.seed.local dari format di README, lalu isi URL, service-role key, dan SEED_PASSWORD.');
}

const supabaseUrl = env.SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
const seedPassword = env.SEED_PASSWORD;
if (!supabaseUrl || !serviceRoleKey || !seedPassword) {
  throw new Error('.env.seed.local harus berisi SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, dan SEED_PASSWORD.');
}
if (seedPassword.length < 12) {
  throw new Error('SEED_PASSWORD harus memiliki minimal 12 karakter.');
}

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const userIds = await ensureUsers(client, seedPassword);
const summary = await runSeed(client, userIds);
console.log(`Seed selesai: ${summary.accounts} akun, ${summary.publishedCourses} kursus terbit, ${summary.lessons} materi, ${summary.questions} soal.`);
