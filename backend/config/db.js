const mongoose = require('mongoose');

// ─── Mongoose Connection Options ───────────────────────────────────────────────
const MONGOOSE_OPTIONS = {
  serverSelectionTimeoutMS: 5000,   // Fail fast if no MongoDB server found
  socketTimeoutMS: 45000,           // Close sockets after 45s of inactivity
};

// ─── Validate Environment Variable ────────────────────────────────────────────
const validateMongoURI = () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ [DB] MONGO_URI is not defined in environment variables.');
    console.error('   ➜  Create a .env file with: MONGO_URI=mongodb://localhost:27017/mern_app');
    process.exit(1);
  }
  return uri;
};

// ─── Mongoose Global Event Listeners ──────────────────────────────────────────
const registerMongooseEvents = () => {
  mongoose.connection.on('connected', () => {
    console.log(`✅ [DB] Mongoose connected to: ${mongoose.connection.host}/${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`❌ [DB] Mongoose connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  [DB] Mongoose disconnected from MongoDB.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 [DB] Mongoose reconnected to MongoDB.');
  });

  // Gracefully close connection when the Node process ends
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🛑 [DB] MongoDB connection closed due to app termination (SIGINT).');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await mongoose.connection.close();
    console.log('🛑 [DB] MongoDB connection closed due to app termination (SIGTERM).');
    process.exit(0);
  });
};

// ─── Main Connect Function ─────────────────────────────────────────────────────
const connectDB = async () => {
  const uri = validateMongoURI();

  console.log('🔌 [DB] Connecting to MongoDB...');
  console.log(`   ➜  Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   ➜  URI         : ${uri.replace(/:([^@]+)@/, ':****@')}`); // Mask password in logs

  try {
    registerMongooseEvents();
    await mongoose.connect(uri, MONGOOSE_OPTIONS);
  } catch (error) {
    console.error('❌ [DB] Initial MongoDB connection failed:');
    console.error(`   ➜  ${error.message}`);

    // Helpful hints based on common errors
    if (error.message.includes('ECONNREFUSED')) {
      console.error('   💡 Hint: Is MongoDB running locally? Try: `mongod` or start the MongoDB service.');
    } else if (error.message.includes('Authentication failed')) {
      console.error('   💡 Hint: Check your MongoDB username/password in MONGO_URI.');
    } else if (error.message.includes('getaddrinfo')) {
      console.error('   💡 Hint: Cannot resolve the MongoDB hostname. Check your network or Atlas cluster URL.');
    }

    process.exit(1);
  }
};

module.exports = connectDB;
