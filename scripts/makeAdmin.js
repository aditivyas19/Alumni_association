/**
 * ADMIN BOOTSTRAP SCRIPT
 * Usage: node scripts/makeAdmin.js <email>
 */
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../src/models/User');

dotenv.config();

const makeAdmin = async (email) => {
    try {
        await mongoose.connect(process.env.DATABASE || process.env.MONGO_URI);
        console.log('Connected to database...');

        const user = await User.findOneAndUpdate(
            { email: email },
            { role: 'admin' },
            { new: true }
        );

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        console.log(`Success! User ${user.firstName} ${user.lastName} (${user.email}) is now an ADMIN.`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

const email = process.argv[2];
if (!email) {
    console.error('Please provide an email address.');
    console.log('Usage: node scripts/makeAdmin.js <email>');
    process.exit(1);
}

makeAdmin(email);
