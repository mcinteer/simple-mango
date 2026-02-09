/**
 * Check if test user exists in database
 * This uses the same DB connection as the app
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Set up the environment like the app does
process.env.NODE_ENV = 'development';

async function checkUser() {
  try {
    // Import after setting NODE_ENV
    const { getDb } = require('../src/lib/db/client.ts');
    
    console.log('Connecting to database...');
    const db = await getDb();
    console.log('✓ Connected');
    
    const email = 'test@example.com';
    console.log(`\nSearching for user: ${email}`);
    
    const user = await db.collection('users').findOne({ email });
    
    if (user) {
      console.log('\n✅ User found!');
      console.log('Document:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('\n❌ User NOT found');
      console.log('\nListing all users in the collection:');
      const allUsers = await db.collection('users').find({}).toArray();
      console.log(`Found ${allUsers.length} user(s):`);
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (ID: ${u._id})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkUser();
