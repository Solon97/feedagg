#!/usr/bin/env node

/**
 * Test script to create a test user and test the feeds functionality
 */bin/env node

/**
 * Test script to create a test user and test the feeds functionality
 */

const fetch = require("node-fetch");

const BASE_URL = "http://localhost:3000";

async function testFeeds() {
  console.log("🧪 Testing Feeds Functionality\n");

  try {
    // Test 1: Check if server is running
    console.log("1. Testing server connectivity...");
    const healthCheck = await fetch(`${BASE_URL}/api/auth/session`);
    console.log(
      `   Server is running: ${
        healthCheck.status === 401 ? "✅" : "❌"
      } (401 expected for unauthenticated)`
    );

    // Test 2: Create test user
    console.log("\n2. Creating test user...");
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@digestly.dev",
        password: "testPassword123!",
        fullName: "Test User",
      }),
    });

    const registerData = await registerResponse.json();
    if (registerResponse.ok) {
      console.log("   ✅ Test user created successfully");
    } else {
      console.log(
        `   ⚠️  Registration response: ${registerData.error || "Unknown error"}`
      );
      // Try to login instead (user might already exist)
      console.log("   Attempting to login with existing user...");
    }

    // Test 3: Login
    console.log("\n3. Testing login...");
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@digestly.dev",
        password: "testPassword123!",
      }),
    });

    const loginData = await loginResponse.json();
    if (loginResponse.ok) {
      console.log("   ✅ Login successful");
      console.log(`   User ID: ${loginData.user?.id}`);

      // Get session cookies for further requests
      const cookies = loginResponse.headers.get("set-cookie");
      console.log(`   Session cookies: ${cookies ? "Set" : "Not set"}`);
    } else {
      console.log(`   ❌ Login failed: ${loginData.error}`);
      throw new Error("Authentication failed");
    }

    console.log("\n✅ Basic authentication tests completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("   - Open http://localhost:3000/auth in browser");
    console.log("   - Login with: test@digestly.dev / testPassword123!");
    console.log("   - Navigate to /feeds to test the optimized architecture");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    process.exit(1);
  }
}

testFeeds();
