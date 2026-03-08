/* global use, db */
// MongoDB Playground for Alumni Platform
// Use this to explore your local database

// Select the alumni database
use('alumni_db');

// --- QUERIES ---

// 1. See all registered Alumni
console.log('--- ALL ALUMNI ---');
db.getCollection('users').find({}, { password: 0 }).pretty();

// 2. See all Job Postings
console.log('--- ALL JOBS ---');
db.getCollection('jobs').find({}).pretty();

// 3. See all Events
console.log('--- ALL EVENTS ---');
db.getCollection('events').find({}).pretty();

// 4. See all Success Stories (including unapproved ones)
console.log('--- ALL STORIES ---');
db.getCollection('successstories').find({}).pretty();

// 5. See all Connections
console.log('--- ALL CONNECTIONS ---');
db.getCollection('connections').find({}).pretty();

// 6. See all Donations
console.log('--- ALL DONATIONS ---');
db.getCollection('donations').find({}).pretty();

// --- USEFUL SNIPPETS ---

// Example: Count users by graduation year
// db.users.aggregate([{ $group: { _id: "$graduationYear", count: { $sum: 1 } } }]);

// Example: Approve all stories (if you want to bypass admin moderation for testing)
// db.successstories.updateMany({}, { $set: { isApproved: true } });
