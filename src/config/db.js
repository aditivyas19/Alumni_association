const mongoose = require("mongoose");

const connectDB = async () => {
  const uris = [
    { name: "MongoDB Atlas",  uri: process.env.DATABASE  },
    { name: "Local MongoDB",  uri: process.env.MONGO_URI }
  ].filter(u => u.uri);

  let lastError;
  for (const { name, uri } of uris) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ DB Connected (${name}): ${conn.connection.host}`);
      return;
    } catch (error) {
      console.warn(`⚠️  Could not connect to ${name}: ${error.message}`);
      lastError = error;
    }
  }

  console.error("❌ Database connection failed on all URIs:", lastError.message);
  process.exit(1);
};

module.exports = connectDB;