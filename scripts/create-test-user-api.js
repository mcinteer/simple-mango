/**
 * Script to create the E2E test user via the registration API
 * Requires the Next.js dev server to be running
 * Run: node scripts/create-test-user-api.js
 */

const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPassword123!',
  ageVerified: true,
};

async function createTestUser() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Test user created successfully!');
      console.log(`  Email: ${TEST_USER.email}`);
      console.log(`  Password: ${TEST_USER.password}`);
      console.log(`  ID: ${data.data?.id}`);
    } else if (response.status === 409) {
      console.log('✓ Test user already exists');
      console.log(`  Email: ${TEST_USER.email}`);
    } else {
      console.error('❌ Error:', data.error?.message || 'Unknown error');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n⚠️  Make sure the Next.js dev server is running:');
    console.error('   npm run dev\n');
    process.exit(1);
  }
}

createTestUser();
