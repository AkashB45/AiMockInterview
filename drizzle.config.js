/** @type { import("drizzle-kit").Config } */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export default {
  schema: "./utils/schema.js",
  dialect: 'postgresql',
  dbCredentials: {
    url:  process.env.NEXT_PUBLIC_DRIZZLE_DB_URL,
  }
};