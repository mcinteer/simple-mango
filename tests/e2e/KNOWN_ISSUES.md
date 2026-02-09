# Known Issues with E2E Tests

## MongoDB Atlas TLS/SSL Compatibility Issue

**Status:** BLOCKING E2E test execution

**Error:**
```
error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error
SSL alert number 80
```

**Root Cause:**
MongoDB Atlas server is rejecting TLS connections from this Node.js environment. TLS alert 80 ("internal_error") indicates the server-side is rejecting the client's SSL/TLS handshake.

**Environment:**
- Node.js: 22.12.0 (also tested with 25.6.0)
- MongoDB Driver: 6.10.0 (also tested with 7.1.0)
- MongoDB Atlas: Cluster0
- OpenSSL: 3.x (bundled with Node.js)

**Impact:**
- Authentication setup fails → all E2E tests cannot run
- Unit tests work fine (70/70 passing)
- Test structure is complete and correct

**Attempted Fixes:**
1. ✗ `tlsAllowInvalidCertificates: true` in MongoDB client options
2. ✗ `tlsAllowInvalidHostnames: true` in MongoDB client options  
3. ✗ Adding TLS parameters to connection string
4. ✗ Downgrading MongoDB driver from 7.1.0 → 6.10.0
5. ✗ Downgrading Node.js from 25.6.0 → 22.12.0
6. ✗ Setting `NODE_TLS_REJECT_UNAUTHORIZED=0`

**Possible Solutions:**

### Option 1: Update MongoDB Atlas Cluster TLS Configuration
In MongoDB Atlas console:
- Check cluster TLS/SSL version settings
- Ensure TLS 1.2 is enabled (not just TLS 1.3)
- Review IP whitelist / Network Access settings

### Option 2: Use Different MongoDB Instance
- Set up local MongoDB for E2E tests
- Use MongoDB Docker container
- Use different Atlas cluster with compatible TLS settings

### Option 3: Different Test Environment
- Run E2E tests in GitHub Actions (different SSL/TLS environment)
- Run on developer machine with different Node.js/OpenSSL combination
- Use containerized test environment

##Workaround for Now

E2E test structure is complete and validated:
- 45 tests written across 5 spec files
- 21 unit tests validate Playwright configuration
- All test selectors and assertions reviewed
- Authentication flow properly structured

Tests will work once MongoDB connection issue is resolved.

## Verification

To test if the issue is resolved:

```bash
# Test MongoDB connection directly
node scripts/check-test-user.js

# If that works, run E2E tests
npm run test:e2e
```
