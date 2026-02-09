/**
 * Script to create the E2E test user directly in MongoDB
 * Run: node scripts/create-test-user.js
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPassword123!',
};

async function createTestUser() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');
    
    const db = client.db('simple-mango');
    const users = db.collection('users');
    
    // Check if user already exists
    const existing = await users.findOne({ email: TEST_USER.email });
    if (existing) {
      console.log('✓ Test user already exists');
      console.log(`  Email: ${TEST_USER.email}`);
      console.log(`  ID: ${existing._id}`);
      return;
    }
    
    // Hash password
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(TEST_USER.password, 12);
    
    // Insert user
    const now = new Date().toISOString();
    const result = await users.insertOne({
      email: TEST_USER.email,
      name: TEST_USER.name,
      passwordHash,
      provider: 'credentials',
      ageVerified: true,
      createdAt: now,
      updatedAt: now,
    });
    
    console.log('✅ Test user created successfully!');
    console.log(`  Email: ${TEST_USER.email}`);
    console.log(`  Password: ${TEST_USER.password}`);
    console.log(`  ID: ${result.insertedId}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

createTestUser();
