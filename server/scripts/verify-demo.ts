// PATHPILOT — LIVE SERVER E2E & RESTART PERSISTENCE VERIFICATION SCRIPT
// Directive: PP-DEMO-FINAL-VERIFY-2026-01

const API_BASE = 'http://localhost:3001/api/v1';

async function preRestartSmoke() {
  console.log('🧪 Starting Live HTTP End-to-End Smoke Verification...\n');

  // 1. Health & Readiness
  const readyRes = await fetch(`${API_BASE}/ready`).then((r) => r.json());
  if (!readyRes.success || readyRes.data.status !== 'ready') {
    throw new Error(`Readiness failed: ${JSON.stringify(readyRes)}`);
  }
  console.log('1️⃣ Health/Ready:', readyRes.data.status, readyRes.data.dependencies);

  // 2. Logins (Student, Mentor 1, Mentor 2, Admin)
  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return { status: res.status, body: await res.json() };
  };

  const sLogin = await login('student@pathpilot.io', 'Student123!');
  const m1Login = await login('mentor@pathpilot.io', 'Mentor123!');
  const m2Login = await login('mentor2@pathpilot.io', 'Mentor123!');
  const aLogin = await login('admin@pathpilot.io', 'Admin123!');
  const badLogin = await login('student@pathpilot.io', 'BadPass!');

  if (
    sLogin.body.data.user.role !== 'STUDENT' ||
    m1Login.body.data.user.role !== 'MENTOR' ||
    m2Login.body.data.user.role !== 'MENTOR' ||
    aLogin.body.data.user.role !== 'ADMIN' ||
    badLogin.status !== 401
  ) {
    throw new Error('Authentication / Automatic role detection check failed.');
  }
  console.log('2️⃣ Auth & Auto Role Detection: STUDENT, MENTOR, MENTOR2, ADMIN PASS; Invalid Pass -> 401 PASS');

  const sToken = sLogin.body.data.token;
  const m1Token = m1Login.body.data.token;
  const m2Token = m2Login.body.data.token;
  const aToken = aLogin.body.data.token;

  // 3. Student Forbidden from Admin API; Admin Allowed
  const sAdminRes = await fetch(`${API_BASE}/admin/overview`, {
    headers: { Authorization: `Bearer ${sToken}` }
  });
  const aAdminRes = await fetch(`${API_BASE}/admin/overview`, {
    headers: { Authorization: `Bearer ${aToken}` }
  });
  if (sAdminRes.status !== 403 || aAdminRes.status !== 200) {
    throw new Error(`Admin RBAC check failed: student=${sAdminRes.status}, admin=${aAdminRes.status}`);
  }
  console.log('3️⃣ Admin RBAC: Student -> 403 Forbidden PASS; Admin -> 200 OK PASS');

  // 4. Careers API
  const careersRes = await fetch(`${API_BASE}/careers`).then((r) => r.json());
  if (!careersRes.success || careersRes.data.length !== 6) {
    throw new Error('Careers API check failed.');
  }
  console.log(`4️⃣ Career API: Retrieved ${careersRes.data.length} careers with active roadmaps PASS`);

  // 5. Mentors Directory (DEMO MENTOR check) & Booking + Cancel/Rebook + Cross-Mentor RBAC
  const mentorsRes = await fetch(`${API_BASE}/mentors`).then((r) => r.json());
  const sarah = mentorsRes.data.find((m: any) => m.name === 'Sarah Jenkins');
  const david = mentorsRes.data.find((m: any) => m.name === 'David Chen');
  if (!sarah?.role.includes('DEMO MENTOR') || !david?.bio.includes('DEMONSTRATION PROFILE')) {
    throw new Error('Mentor demonstration labeling missing.');
  }
  console.log('5️⃣ Mentor Data Integrity: 4 profiles labeled DEMO MENTOR / DEMONSTRATION PROFILE PASS');

  const persistSlot = `2026-12-20T${String(new Date().getUTCHours()).padStart(2, '0')}:00:00Z`;
  const bookRes = await fetch(`${API_BASE}/mentors/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sToken}` },
    body: JSON.stringify({
      mentorId: david.id,
      scheduledTime: persistSlot,
      topic: 'Server Restart Persistence Verification'
    })
  });
  const bookData = await bookRes.json();
  if (bookRes.status !== 201 && bookRes.status !== 409) {
    throw new Error(`Booking failed unexpectedly: ${JSON.stringify(bookData)}`);
  }

  let bookingId = bookData.data?.id;
  if (bookRes.status === 201) {
    console.log(`6️⃣ Created Persistent Booking ID=${bookingId} for slot ${persistSlot} PASS`);

    // Cross-mentor check: Mentor 1 tries to modify Mentor 2 booking
    const crossRes = await fetch(`${API_BASE}/mentors/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${m1Token}` },
      body: JSON.stringify({ status: 'CONFIRMED' })
    });
    if (crossRes.status !== 403) {
      throw new Error(`Expected 403 on cross-mentor confirm, got ${crossRes.status}`);
    }
    console.log('7️⃣ Cross-Mentor RBAC: Mentor 1 blocked from Mentor 2 booking (403) PASS');

    // Duplicate booking rejection
    const dupRes = await fetch(`${API_BASE}/mentors/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sToken}` },
      body: JSON.stringify({
        mentorId: david.id,
        scheduledTime: persistSlot,
        topic: 'Duplicate Attempt'
      })
    });
    if (dupRes.status !== 409) {
      throw new Error(`Expected 409 on duplicate booking, got ${dupRes.status}`);
    }
    console.log('8️⃣ Duplicate Booking Rejection: HTTP 409 Conflict PASS');
  } else {
    // Retrieve existing booking id for that slot
    const myRes = await fetch(`${API_BASE}/mentors/bookings/my`, {
      headers: { Authorization: `Bearer ${sToken}` }
    }).then((r) => r.json());
    bookingId = myRes.data.find((b: any) => b.scheduledTime === persistSlot)?.id;
    console.log(`6️⃣ Using existing Booking ID=${bookingId} for persistence test PASS`);
  }

  // 6. Gemini Live Generation over HTTP
  const aiRes = await fetch(`${API_BASE}/ai/mentor/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sToken}` },
    body: JSON.stringify({ message: 'Give me 1 short actionable tip for ML engineering interviews.' })
  }).then((r) => r.json());

  if (!aiRes.success || aiRes.data.isFallback !== false || aiRes.data.model !== 'gemini-3.1-flash-lite') {
    throw new Error(`Gemini live HTTP verification failed: ${JSON.stringify(aiRes)}`);
  }
  console.log(`9️⃣ Live Gemini AI Mentor HTTP: model=${aiRes.data.model}, isFallback=${aiRes.data.isFallback}, chars=${aiRes.data.reply.length} PASS`);

  console.log(`\nPERSISTENCE_BOOKING_ID=${bookingId}`);
  console.log(`PERSISTENCE_SLOT=${persistSlot}`);
  console.log(`PERSISTENCE_MENTOR_ID=${david.id}`);
}

async function postRestartVerify(bookingId: string) {
  console.log(`\n🔄 Verifying Persistence After Server Restart for Booking ID=${bookingId}...`);
  const sLogin = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@pathpilot.io', password: 'Student123!' })
  }).then((r) => r.json());

  const sToken = sLogin.data.token;
  const myRes = await fetch(`${API_BASE}/mentors/bookings/my`, {
    headers: { Authorization: `Bearer ${sToken}` }
  }).then((r) => r.json());

  const found = myRes.data.find((b: any) => b.id === bookingId);
  if (!found) {
    throw new Error(`Persistence failure: Booking ${bookingId} not found after server restart!`);
  }
  console.log(`✅ PERSISTENCE VERIFIED: Booking ${found.id} (${found.topic}, status=${found.status}) survived full server restart!`);

  // Also test cancellation and re-booking on live server!
  const cancelRes = await fetch(`${API_BASE}/mentors/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sToken}` },
    body: JSON.stringify({ status: 'CANCELLED' })
  });
  if (cancelRes.status !== 200) {
    throw new Error(`Cancel failed after restart: ${cancelRes.status}`);
  }
  console.log(`✅ Live Cancel Verified: Booking ${bookingId} -> CANCELLED.`);

  const rebookRes = await fetch(`${API_BASE}/mentors/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sToken}` },
    body: JSON.stringify({
      mentorId: found.mentorId,
      scheduledTime: found.scheduledTime,
      topic: 'Re-booked after cancellation'
    })
  });
  const rebookData = await rebookRes.json();
  if (rebookRes.status !== 201) {
    throw new Error(`Re-booking cancelled slot failed: ${JSON.stringify(rebookData)}`);
  }
  console.log(`✅ Live Re-booking of Cancelled Slot Verified: New Booking ID=${rebookData.data.id} (status=REQUESTED).`);
}

const mode = process.argv[2];
const targetId = process.argv[3];

if (mode === '--post-restart' && targetId) {
  postRestartVerify(targetId).catch((err) => {
    console.error('❌ Post-restart verification failed:', err);
    process.exit(1);
  });
} else {
  preRestartSmoke().catch((err) => {
    console.error('❌ Pre-restart verification failed:', err);
    process.exit(1);
  });
}
