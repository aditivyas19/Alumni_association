/**
 * ============================================================
 *  ALUMNI PLATFORM BACKEND – COMPREHENSIVE API TEST SCRIPT
 *  Run: node api_test.js
 *  Requirements: server must be running on http://localhost:5000
 * ============================================================
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
let TOKEN = '';        // Regular alumni JWT
let ADMIN_TOKEN = '';  // Admin JWT
let USER_ID = '';
let ADMIN_ID = '';
let SECOND_USER_ID = '';
let SECOND_USER_TOKEN = '';
let JOB_ID = '';
let EVENT_ID = '';
let CONNECTION_ID = '';
let STORY_ID = '';

// ─────────────────────────────────────────────────────────
//  HTTP Helper
// ─────────────────────────────────────────────────────────
function request(method, path, body = null, token = null) {
    return new Promise((resolve) => {
        const url = new URL(BASE_URL + path);
        const payload = body ? JSON.stringify(body) : null;

        const options = {
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname + url.search,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(payload && { 'Content-Length': Buffer.byteLength(payload) }),
                ...(token  && { 'Authorization': `Bearer ${token}` })
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed;
                try { parsed = JSON.parse(data); } catch { parsed = data; }
                resolve({ status: res.statusCode, body: parsed });
            });
        });

        req.on('error', (e) => resolve({ status: 'ERROR', body: e.message }));
        if (payload) req.write(payload);
        req.end();
    });
}

// ─────────────────────────────────────────────────────────
//  Logger
// ─────────────────────────────────────────────────────────
const results = [];
function log(endpoint, method, payload, status, body, passed) {
    const icon = passed ? '✅' : '❌';
    console.log(`\n${icon}  [${method}] ${endpoint}`);
    if (payload) console.log(`   📤 Payload:  ${JSON.stringify(payload)}`);
    console.log(`   📥 Status:   ${status}`);
    console.log(`   📄 Response: ${JSON.stringify(body).slice(0, 300)}`);
    results.push({ endpoint: `${method} ${endpoint}`, status, passed, body });
}

// ─────────────────────────────────────────────────────────
//  TESTS
// ─────────────────────────────────────────────────────────
async function run() {
    console.log('='.repeat(65));
    console.log('  ALUMNI PLATFORM – API TEST SUITE (v2.1)');
    console.log('='.repeat(65));

    // ── 0. Health Check ───────────────────────────────────
    console.log('\n\n━━━ 0. HEALTH CHECK ━━━');
    {
        const r = await request('GET', '/api/health');
        log('/api/health', 'GET', null, r.status, r.body, r.status === 200);
    }

    // ── 1. AUTH ───────────────────────────────────────────
    console.log('\n\n━━━ 1. AUTH ROUTES ━━━');

    // 1a. Register regular alumni user
    const alumniPayload = {
        firstName: 'Arjun',
        lastName:  'Sharma',
        email:     `arjun.sharma.${Date.now()}@test.com`,
        password:  'testpass123',
        graduationYear: 2020,
        degree:    'B.Tech',
        major:     'Computer Science'
    };
    {
        const r = await request('POST', '/api/auth/register', alumniPayload);
        log('/api/auth/register', 'POST', alumniPayload, r.status, r.body, r.status === 201);
        if (r.body?.token) { TOKEN = r.body.token; USER_ID = r.body.data?.user?._id; }
    }

    // 1b. Register admin user
    const adminPayload = {
        firstName: 'Admin',
        lastName:  'Principal',
        email:     `admin.principal.${Date.now()}@test.com`,
        password:  'adminpass123',
        graduationYear: 2010,
        degree:    'M.Tech',
        major:     'Electronics'
    };
    {
        const r = await request('POST', '/api/auth/register', adminPayload);
        log('/api/auth/register (admin)', 'POST', adminPayload, r.status, r.body, r.status === 201);
        ADMIN_TOKEN = r.body?.token;
        ADMIN_ID   = r.body?.data?.user?._id;
    }

    // 1c. Register a SECOND regular user
    const secondPayload = {
        firstName: 'Priya',
        lastName:  'Nair',
        email:     `priya.nair.${Date.now()}@test.com`,
        password:  'testpass456',
        graduationYear: 2021,
        degree:    'B.Sc',
        major:     'Mathematics'
    };
    {
        const r = await request('POST', '/api/auth/register', secondPayload);
        log('/api/auth/register (second user)', 'POST', secondPayload, r.status, r.body, r.status === 201);
        SECOND_USER_TOKEN = r.body?.token;
        SECOND_USER_ID   = r.body?.data?.user?._id;
    }

    // 1d. Login
    {
        const payload = { email: alumniPayload.email, password: alumniPayload.password };
        const r = await request('POST', '/api/auth/login', payload);
        log('/api/auth/login', 'POST', payload, r.status, r.body, r.status === 200);
        if (r.body?.token) TOKEN = r.body.token;
    }

    // 1e. GET /api/auth/me (protected)
    {
        const r = await request('GET', '/api/auth/me', null, TOKEN);
        log('/api/auth/me', 'GET', null, r.status, r.body, r.status === 200);
    }

    // 1f. POST /api/auth/update-password (new feature)
    {
        const payload = {
            passwordCurrent: alumniPayload.password,
            password:        'newtestpass123'
        };
        const r = await request('POST', '/api/auth/update-password', payload, TOKEN);
        log('/api/auth/update-password', 'POST', payload, r.status, r.body, r.status === 200);
        if (r.body?.token) {
            TOKEN = r.body.token; 
            alumniPayload.password = payload.password; 
        }
    }

    // ── 2. ALUMNI ───────────────────────────────────────────
    console.log('\n\n━━━ 2. ALUMNI ROUTES ━━━');

    // 2a. GET /api/alumni/directory
    {
        const r = await request('GET', '/api/alumni/directory');
        log('/api/alumni/directory', 'GET', null, r.status, r.body, r.status === 200);
    }

    // 2b. PATCH /api/alumni/me
    {
        const payload = { bio: 'Updated Bio via Test Script' };
        const r = await request('PATCH', '/api/alumni/me', payload, TOKEN);
        log('/api/alumni/me', 'PATCH', payload, r.status, r.body, r.status === 200);
    }

    // ── 3. JOBS ─────────────────────────────────────────────
    console.log('\n\n━━━ 3. JOB ROUTES ━━━');

    // 3a. POST /api/jobs
    const jobPayload = {
        title: 'Backend Dev', company: 'TestCo', location: 'Remote', description: 'NodeJS',
        salaryRange: '10 LPA', category: 'Technology', jobType: 'Full-time',
        applyLink: 'https://test.com/apply'
    };
    {
        const r = await request('POST', '/api/jobs', jobPayload, TOKEN);
        log('/api/jobs', 'POST', jobPayload, r.status, r.body, r.status === 201);
        JOB_ID = r.body?.data?.job?._id;
    }

    // 3b. PATCH /api/jobs/:id (new feature)
    {
        const payload = { title: 'Senior Backend Dev' };
        const r = await request('PATCH', `/api/jobs/${JOB_ID}`, payload, TOKEN);
        log('/api/jobs/:id (PATCH)', 'PATCH', payload, r.status, r.body, r.status === 200);
    }

    // ── 4. EVENTS ───────────────────────────────────────────
    console.log('\n\n━━━ 4. EVENT ROUTES ━━━');

    // 4a. POST /api/events
    const eventPayload = {
        title: 'Alumni Meet', description: 'Networking', date: '2026-10-10',
        location: 'New Delhi', type: 'Meetup', maxAttendees: 100
    };
    {
        const r = await request('POST', '/api/events', eventPayload, TOKEN);
        log('/api/events', 'POST', eventPayload, r.status, r.body, r.status === 201);
        EVENT_ID = r.body?.data?.event?._id;
    }

    // 4b. PATCH /api/events/:id (new feature)
    {
        const payload = { location: 'Lobby 1, New Delhi' };
        const r = await request('PATCH', `/api/events/${EVENT_ID}`, payload, TOKEN);
        log('/api/events/:id (PATCH)', 'PATCH', payload, r.status, r.body, r.status === 200);
    }

    // 4c. Register for event
    {
        const r = await request('POST', `/api/events/register/${EVENT_ID}`, null, TOKEN);
        log(`/api/events/register/${EVENT_ID}`, 'POST', null, r.status, r.body, r.status === 200);
    }

    // ── 5. CONNECTIONS ──────────────────────────────────────
    console.log('\n\n━━━ 5. CONNECTION ROUTES ━━━');

    // 5a. Send request
    {
        const r = await request('POST', `/api/connections/request/${SECOND_USER_ID}`, null, TOKEN);
        log(`/api/connections/request/${SECOND_USER_ID}`, 'POST', null, r.status, r.body, r.status === 201);
        CONNECTION_ID = r.body?.data?.connection?._id;
    }

    // 5b. Accept request
    {
        const r = await request('PATCH', `/api/connections/respond/${CONNECTION_ID}`, { status: 'accepted' }, SECOND_USER_TOKEN);
        log(`/api/connections/respond/${CONNECTION_ID}`, 'PATCH', { status: 'accepted' }, r.status, r.body, r.status === 200);
    }

    // ── 6. DONATIONS ────────────────────────────────────────
    console.log('\n\n━━━ 6. DONATION ROUTES ━━━');
    {
        const payload = { amount: 1000, currency: 'INR', purpose: 'Scholarship fund', transactionId: `TX_${Date.now()}` };
        const r = await request('POST', '/api/donations', payload, TOKEN);
        log('/api/donations', 'POST', payload, r.status, r.body, r.status === 201);
    }

    // ── 7. STORIES ──────────────────────────────────────────
    console.log('\n\n━━━ 7. STORY ROUTES ━━━');
    {
        const payload = { title: 'Success Story', content: 'Long content about success...', achievement: 'CEO', company: 'Self', year: 2024 };
        const r = await request('POST', '/api/stories', payload, TOKEN);
        log('/api/stories', 'POST', payload, r.status, r.body, r.status === 201);
    }

    // ── 8. CLEANUP ──────────────────────────────────────────
    console.log('\n\n━━━ 8. CLEANUP ━━━');
    {
        const r = await request('DELETE', `/api/jobs/${JOB_ID}`, null, TOKEN);
        log(`/api/jobs/${JOB_ID}`, 'DELETE', null, r.status, r.body, r.status === 204);
    }

    // ── 9. SECURITY (BUG VERIFICATION) ────────────────────
    console.log('\n\n━━━ 9. BUG VERIFICATION ━━━');
    
    // 9a. Malformed JWT (should be 401 now, not 500)
    {
        const r = await request('GET', '/api/auth/me', null, 'malformed.token.here');
        log('/api/auth/me (malformed token)', 'GET', null, r.status, r.body, r.status === 401);
    }

    // 9b. Role Restriction (expect 403)
    {
        const r = await request('GET', '/api/donations', null, TOKEN);
        log('/api/donations (admin-only)', 'GET', null, r.status, r.body, r.status === 403);
    }

    // SUMMARY
    const passed = results.filter(r => r.passed);
    const failed = results.filter(r => !r.passed);
    console.log('\n' + '='.repeat(40));
    console.log(`  FINAL RESULTS: ${passed.length} Passed / ${failed.length} Failed`);
    console.log('='.repeat(40) + '\n');
    if (failed.length > 0) process.exit(1);
}

run().catch(console.error);
