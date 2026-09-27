require("dotenv").config();

const app = require("./app");
const { testConnection } = require("./config/db");

const PORT = process.env.PORT || 3000;
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 3000;

// In Docker Compose, the app container can start before MySQL is ready to
// accept connections, so we retry instead of crashing immediately.
async function connectWithRetry(retries = MAX_RETRIES) {
  try {
    await testConnection();
    console.log("Connected to MySQL");
  } catch (err) {
    if (retries === 0) {
      console.error("Could not connect to MySQL, giving up:", err.message);
      process.exit(1);
    }
    console.log(`MySQL not ready yet, retrying in ${RETRY_DELAY_MS / 1000}s... (${retries} left)`);
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    return connectWithRetry(retries - 1);
  }
}

(async () => {
  await connectWithRetry();
  app.listen(PORT, () => {
    console.log(`Foundry server running on port ${PORT}`);
  });
})();
